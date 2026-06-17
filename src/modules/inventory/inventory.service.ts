import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger, HttpException, HttpStatus } from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { RedisService } from "../../common/redis/redis.service"
import { CreateItemDto, UpdateItemDto, InventoryMovementDto } from "./dto/inventory.dto"
import { Prisma, MovementType } from "@prisma/client"

const CACHE_PREFIX = "inventory"
const CATALOG_CACHE_TTL = 120
const ITEM_CACHE_TTL = 300

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(category?: string, lowStock?: boolean, limit = 20, cursor?: string, search?: string, page?: number, pageSize?: number) {
    if (lowStock) {
      return this.findAllLowStock(category, limit, cursor)
    }

    // Busqueda server-side insensible por nombre o SKU (Anti "Faro" sin resultados)
    const where: Prisma.InventoryItemWhereInput = {
      ...(category ? { categoryId: category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    }

    // Modo offset (panel admin: ?page=N&pageSize=M&search=...)
    if (page !== undefined || pageSize !== undefined) {
      const size = Math.min(pageSize ?? 10, 100)
      const currentPage = page ?? 1
      const offsetKey = `${CACHE_PREFIX}:catalog:offset:${category ?? "all"}:${search ?? "none"}:${currentPage}:${size}`
      const cachedOffset = await this.redis.get(offsetKey)
      if (cachedOffset) return JSON.parse(cachedOffset)

      const [pagedItems, total] = await Promise.all([
        this.prisma.inventoryItem.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: size,
          skip: (currentPage - 1) * size,
          include: { category: { select: { name: true } } },
        }),
        this.prisma.inventoryItem.count({ where }),
      ])

      const offsetResult = {
        data: pagedItems.map((i) => this.flattenItem(i)),
        total,
        page: currentPage,
        pageSize: size,
        totalPages: Math.ceil(total / size),
      }
      await this.redis.set(offsetKey, JSON.stringify(offsetResult), CATALOG_CACHE_TTL)
      return offsetResult
    }

    const cacheKey = `${CACHE_PREFIX}:catalog:${category ?? "all"}:${search ?? "none"}:${limit}:${cursor ?? "start"}`
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const take = limit + 1
    const items = await this.prisma.inventoryItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: { category: { select: { name: true } } },
    })

    const hasMore = items.length > limit
    const sliced = hasMore ? items.slice(0, limit) : items
    const data = sliced.map((i) => this.flattenItem(i))
    const nextCursor = hasMore ? sliced[sliced.length - 1].id : null
    const result = { data, nextCursor, hasMore }

    await this.redis.set(cacheKey, JSON.stringify(result), CATALOG_CACHE_TTL)
    return result
  }

  // Contrato plano para los frontends: el modelo Prisma expone sku/stock/
  // unitPrice y la categoria como relacion — se emiten alias canonicos
  // (code/currentStock/salePrice/category-string) sin quitar los originales
  private flattenItem(i: { sku: string; stock: number; costPrice: unknown; unitPrice: unknown; category?: { name: string } | null } & Record<string, unknown>) {
    return {
      ...i,
      code: i.sku,
      currentStock: i.stock,
      costPrice: Number(i.costPrice ?? 0),
      salePrice: Number(i.unitPrice ?? 0),
      category: i.category?.name ?? null,
      categoryName: i.category?.name ?? "Sin categoría",
    }
  }

  private async findAllLowStock(category?: string, limit = 20, cursor?: string) {
    const cacheKey = `${CACHE_PREFIX}:lowstock:${category ?? "all"}:${limit}:${cursor ?? "start"}`
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const take = limit + 1
    const items = await this.prisma.inventoryItem.findMany({
      where: {
        stock: { lte: this.prisma.inventoryItem.fields.minStock },
        ...(category ? { categoryId: category } : {}),
      },
      orderBy: { stock: "asc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: { category: { select: { name: true } } },
    })

    const hasMore = items.length > limit
    const sliced = hasMore ? items.slice(0, limit) : items
    const data = sliced.map((i) => this.flattenItem(i))
    const nextCursor = hasMore ? sliced[sliced.length - 1].id : null
    const result = { data, nextCursor, hasMore }

    await this.redis.set(cacheKey, JSON.stringify(result), CATALOG_CACHE_TTL)
    return result
  }

  async findOne(id: string) {
    const cacheKey = `${CACHE_PREFIX}:item:${id}`
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const item = await this.prisma.inventoryItem.findUnique({ where: { id } })
    if (!item) {
      throw new NotFoundException("Item de inventario no encontrado")
    }

    await this.redis.set(cacheKey, JSON.stringify(item), ITEM_CACHE_TTL)
    return item
  }

  async create(dto: CreateItemDto) {
    const existing = await this.prisma.inventoryItem.findUnique({
      where: { sku: dto.sku },
    })
    if (existing) {
      throw new ConflictException("Ya existe un item con ese SKU")
    }

    // dto.category puede llegar como UUID de Category o como nombre escrito en
    // el panel ("Frenos"). Pasarlo crudo como FK dispara P2003 (constraint
    // inventory_items_categoryId_fkey). Se resuelve: id existente -> usar;
    // texto -> upsert por nombre (Category.name es @unique).
    let categoryId: string | null = null
    if (dto.category) {
      const byId = await this.prisma.category.findUnique({ where: { id: dto.category } })
      if (byId) {
        categoryId = byId.id
      } else {
        const byName = await this.prisma.category.upsert({
          where: { name: dto.category },
          update: {},
          create: { name: dto.category },
        })
        categoryId = byName.id
      }
    }

    try {
      const item = await this.prisma.inventoryItem.create({
        data: {
          sku: dto.sku,
          name: dto.name,
          categoryId,
          costPrice: 0,
          stock: dto.stock,
          minStock: dto.minStock,
          unitPrice: dto.unitPrice,
        },
      })

      await this.invalidateCatalogCache()
      this.logger.log(`Item creado: ${item.sku} (${item.id})`)
      return item
    } catch (err) {
      // Red de seguridad ante carreras: SKU duplicado (P2002) o FK rota (P2003)
      // se reportan como 4xx amigables en vez de colapsar con 500
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          throw new ConflictException("El SKU ya se encuentra registrado")
        }
        if (err.code === "P2003") {
          throw new BadRequestException("La categoría indicada no existe")
        }
      }
      throw err
    }
  }

  async update(id: string, dto: UpdateItemDto) {
    await this.findOne(id)

    if (dto.sku) {
      const existing = await this.prisma.inventoryItem.findFirst({
        where: { sku: dto.sku, id: { not: id } },
      })
      if (existing) {
        throw new ConflictException("Ya existe otro item con ese SKU")
      }
    }

    const { category, ...rest } = dto
    const updateData: Prisma.InventoryItemUpdateInput = {
      ...rest,
      ...(category !== undefined ? { categoryId: category } : {}),
    }

    const item = await this.prisma.inventoryItem.update({
      where: { id },
      data: updateData as any,
    })

    await this.redis.del(`${CACHE_PREFIX}:item:${id}`)
    await this.invalidateCatalogCache()

    this.logger.log(`Item actualizado: ${item.sku} (${item.id})`)
    return item
  }

  async addMovement(authorizedBy: string, itemId: string, dto: InventoryMovementDto) {
    if (dto.type === MovementType.OUT && !dto.orderId) {
      throw new ConflictException("El ID de la orden de trabajo es requerido para movimientos de salida")
    }

    if (dto.type === MovementType.ADJUSTMENT && !dto.justification) {
      throw new ConflictException("La justificacion es requerida para ajustes de inventario")
    }

    const item = await this.findOne(itemId)

    if (dto.type === MovementType.OUT && item.stock < dto.quantity) {
      throw new ConflictException(
        `Stock insuficiente. Disponible: ${item.stock}, solicitado: ${dto.quantity}`,
      )
    }

    let newStock: number
    switch (dto.type) {
      case MovementType.IN: newStock = item.stock + dto.quantity; break
      case MovementType.OUT: newStock = item.stock - dto.quantity; break
      case MovementType.ADJUSTMENT: newStock = dto.quantity; break
    }

    const [movement] = await this.prisma.$transaction([
      this.prisma.inventoryMovement.create({
        data: {
          itemId,
          type: dto.type,
          quantity: dto.quantity,
          orderId: dto.orderId ?? null,
          authorizedBy,
          justification: dto.justification ?? null,
          unitCost: item.unitPrice,
        },
      }),
      this.prisma.inventoryItem.update({
        where: { id: itemId },
        data: { stock: newStock },
      }),
    ])

    await this.redis.del(`${CACHE_PREFIX}:item:${itemId}`)
    await this.invalidateCatalogCache()
    await this.redis.del(`${CACHE_PREFIX}:lowstock:*`)
    await this.redis.del(`${CACHE_PREFIX}:valuation`)

    this.logger.log(
      `Movimiento ${dto.type} x${dto.quantity} en item ${item.sku}, stock: ${item.stock} -> ${newStock}`,
    )
    return movement
  }

  async getMovements(itemId: string, limit = 20, cursor?: string) {
    await this.findOne(itemId)
    const take = limit + 1

    const movements = await this.prisma.inventoryMovement.findMany({
      where: { itemId },
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    })

    const hasMore = movements.length > limit
    const data = hasMore ? movements.slice(0, limit) : movements
    const nextCursor = hasMore ? data[data.length - 1].id : null

    return { data, nextCursor, hasMore }
  }

  async getAllMovements(itemId?: string, type?: string, limit = 20, cursor?: string) {
    const take = limit + 1
    const where: any = {}
    if (itemId) where.itemId = itemId
    if (type) where.type = type

    const movements = await this.prisma.inventoryMovement.findMany({
      where,
      include: { item: { select: { name: true, sku: true, unit: true } } },
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    })

    const hasMore = movements.length > limit
    const data = hasMore ? movements.slice(0, limit) : movements
    const nextCursor = hasMore ? data[data.length - 1].id : null

    return { data, nextCursor, hasMore }
  }

  async getCriticalStock() {
    const cacheKey = `${CACHE_PREFIX}:critical`
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const items = await this.prisma.inventoryItem.findMany({
      where: { stock: { lte: this.prisma.inventoryItem.fields.minStock } },
      orderBy: { stock: "asc" },
      include: { category: { select: { name: true } } },
    })

    const flattened = items.map((i) => this.flattenItem(i))

    await this.redis.set(cacheKey, JSON.stringify(flattened), 60)
    return flattened
  }

  async getValuation() {
    const cacheKey = `${CACHE_PREFIX}:valuation`
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const items = await this.prisma.inventoryItem.findMany({
      where: { isActive: true },
      select: { stock: true, costPrice: true, unitPrice: true, minStock: true },
    })

    const totalItems = items.length
    const totalCostValue = items.reduce((sum, i) => sum + Number(i.costPrice) * i.stock, 0)
    const totalSaleValue = items.reduce((sum, i) => sum + Number(i.unitPrice) * i.stock, 0)
    const lowStockCount = items.filter((i) => i.stock <= i.minStock).length

    const result = { totalItems, totalCostValue, totalSaleValue, lowStockCount }
    await this.redis.set(cacheKey, JSON.stringify(result), 120)
    return result
  }

  async reserveForOrder(
    itemId: string,
    quantity: number,
    workOrderId: string,
    userId: string,
  ) {
    if (!workOrderId) {
      throw new HttpException(
        {
          statusCode: 422,
          error: "INVENTORY_NO_ACTIVE_ORDER",
          message: "No se puede retirar inventario sin una Orden de Trabajo activa vinculada.",
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      )
    }

    const order = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: { id: true, status: true, number: true },
    })
    if (!order) throw new NotFoundException(`OT ${workOrderId} no encontrada`)

    if (order.status !== "IN_PROGRESS") {
      throw new HttpException(
        {
          statusCode: 422,
          error: "INVENTORY_NO_ACTIVE_ORDER",
          message: `Solo se puede retirar inventario de OT en estado IN_PROGRESS. OT ${order.number} está en estado ${order.status}.`,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      )
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({ where: { id: itemId } })
      if (!item) throw new NotFoundException(`Item ${itemId} no encontrado`)
      if (item.stock < quantity) {
        throw new BadRequestException(
          `Stock insuficiente. Disponible: ${item.stock}, solicitado: ${quantity}`,
        )
      }

      await tx.inventoryItem.update({
        where: { id: itemId },
        data: { stock: { decrement: quantity } },
      })

      await tx.inventoryMovement.create({
        data: {
          itemId,
          type: MovementType.OUT,
          quantity,
          orderId: workOrderId,
          authorizedBy: userId,
          justification: `Reservado para orden ${workOrderId}`,
        },
      })

      const updated = await tx.inventoryItem.findUnique({ where: { id: itemId } })

      this.logger.log(
        `Reserva: ${item.sku} x${quantity} para OT ${workOrderId}. Stock: ${item.stock} -> ${updated?.stock}`,
      )

      return { success: true, remainingStock: updated?.stock ?? 0 }
    })

    await this.redis.del(`${CACHE_PREFIX}:item:${itemId}`)
    await this.invalidateCatalogCache()
    await this.redis.del(`${CACHE_PREFIX}:lowstock:*`)
    await this.redis.del(`${CACHE_PREFIX}:critical`)
    await this.redis.del(`${CACHE_PREFIX}:valuation`)

    return result
  }

  private async invalidateCatalogCache() {
    try {
      const client = this.redis.client
      let cursor = "0"
      do {
        const [nextCursor, keys] = await client.scan(
          cursor, "MATCH", `${CACHE_PREFIX}:catalog:*`, "COUNT", 100,
        )
        cursor = nextCursor
        if (keys.length > 0) await client.del(...keys)
      } while (cursor !== "0")
    } catch (err) {
      this.logger.warn(`Cache invalidation warning: ${(err as Error).message}`)
    }
  }
}
