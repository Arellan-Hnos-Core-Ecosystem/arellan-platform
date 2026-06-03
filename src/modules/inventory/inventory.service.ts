import { Injectable, NotFoundException, ConflictException, Logger } from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { CreateItemDto, UpdateItemDto, InventoryMovementDto } from "./dto/inventory.dto"
import { Prisma, MovementType } from "@prisma/client"

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string, lowStock?: boolean, limit = 20, cursor?: string) {
    if (lowStock) {
      return this.findAllLowStock(category, limit, cursor)
    }

    const take = limit + 1

    const items = await this.prisma.inventoryItem.findMany({
      where: category ? { category } : {},
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    })

    const hasMore = items.length > limit
    const data = hasMore ? items.slice(0, limit) : items
    const nextCursor = hasMore ? data[data.length - 1].id : null

    return { data, nextCursor, hasMore }
  }

  private async findAllLowStock(category?: string, limit = 20, cursor?: string) {
    const conditions: string[] = [`stock <= "minStock"`]

    if (category) {
      conditions.push(`category = '${category.replace(/'/g, "''")}'`)
    }

    if (cursor) {
      conditions.push(`id < '${cursor.replace(/'/g, "''")}'`)
    }

    const whereClause = conditions.join(" AND ")
    const take = limit + 1

    const items = await this.prisma.$queryRawUnsafe<Array<{
      id: string; sku: string; name: string; category: string
      stock: number; minStock: number; unitPrice: string
      createdAt: Date; updatedAt: Date
    }>>(
      `SELECT * FROM inventory_items WHERE ${whereClause} ORDER BY id DESC LIMIT ${take}`,
    )

    const inventoryItems = items.map((i) => ({
      ...i,
      unitPrice: i.unitPrice,
    }))

    const hasMore = inventoryItems.length > limit
    const data = hasMore ? inventoryItems.slice(0, limit) : inventoryItems
    const nextCursor = hasMore ? data[data.length - 1].id : null

    return { data, nextCursor, hasMore }
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } })
    if (!item) {
      throw new NotFoundException("Item de inventario no encontrado")
    }
    return item
  }

  async create(dto: CreateItemDto) {
    const existing = await this.prisma.inventoryItem.findUnique({
      where: { sku: dto.sku },
    })
    if (existing) {
      throw new ConflictException("Ya existe un item con ese SKU")
    }

    const item = await this.prisma.inventoryItem.create({
      data: {
        sku: dto.sku,
        name: dto.name,
        category: dto.category,
        stock: dto.stock,
        minStock: dto.minStock,
        unitPrice: dto.unitPrice,
      },
    })

    this.logger.log(`Item creado: ${item.sku} (${item.id})`)
    return item
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

    const item = await this.prisma.inventoryItem.update({
      where: { id },
      data: dto,
    })

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
      case MovementType.IN:
        newStock = item.stock + dto.quantity
        break
      case MovementType.OUT:
        newStock = item.stock - dto.quantity
        break
      case MovementType.ADJUSTMENT:
        newStock = dto.quantity
        break
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

  async getCriticalStock() {
    const items = await this.prisma.$queryRawUnsafe<Array<{
      id: string; sku: string; name: string; category: string
      stock: number; minStock: number; unitPrice: string
      createdAt: Date; updatedAt: Date
    }>>(`SELECT * FROM inventory_items WHERE stock <= "minStock" ORDER BY stock ASC`)

    return items
  }
}
