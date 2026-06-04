import { Injectable, NotFoundException, ConflictException, Logger } from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { RedisService } from "../../common/redis/redis.service"
import { CreateVehicleDto, UpdateVehicleDto } from "./dto/vehicles.dto"

const VEHICLE_CACHE_PREFIX = "vehicles"
const VEHICLE_CACHE_TTL_SHORT = 60
const VEHICLE_CACHE_TTL_LONG = 300

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(search?: string, limit = 20, cursor?: string) {
    const take = limit + 1
    const cacheKey = `${VEHICLE_CACHE_PREFIX}:list:${search ?? "all"}:${limit}:${cursor ?? "start"}`

    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const where = search
      ? {
          OR: [
            { plate: { contains: search, mode: "insensitive" as const } },
            { brand: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      include: { client: { select: { id: true, firstName: true, lastName: true } } },
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    })

    const hasMore = vehicles.length > limit
    const data = hasMore ? vehicles.slice(0, limit) : vehicles
    const nextCursor = hasMore ? data[data.length - 1].id : null
    const result = { data, nextCursor, hasMore }

    await this.redis.set(cacheKey, JSON.stringify(result), VEHICLE_CACHE_TTL_SHORT)
    return result
  }

  async findByPlate(plate: string) {
    const cacheKey = `${VEHICLE_CACHE_PREFIX}:plate:${plate.toUpperCase()}`
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const vehicle = await this.prisma.vehicle.findFirst({
      where: { plate: { equals: plate, mode: "insensitive" } },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, phone: true } },
      },
    })

    if (!vehicle) {
      throw new NotFoundException("Vehiculo no encontrado")
    }

    await this.redis.set(cacheKey, JSON.stringify(vehicle), VEHICLE_CACHE_TTL_LONG)
    return vehicle
  }

  async findOne(id: string) {
    const cacheKey = `${VEHICLE_CACHE_PREFIX}:id:${id}`
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        client: true,
        workOrders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true, number: true, status: true,
            description: true, totalCost: true, createdAt: true,
          },
        },
      },
    })
    if (!vehicle) {
      throw new NotFoundException("Vehiculo no encontrado")
    }

    await this.redis.set(cacheKey, JSON.stringify(vehicle), VEHICLE_CACHE_TTL_LONG)
    return vehicle
  }

  async create(dto: CreateVehicleDto) {
    const existing = await this.prisma.vehicle.findFirst({
      where: { plate: { equals: dto.plate, mode: "insensitive" } },
    })
    if (existing) {
      throw new ConflictException("Ya existe un vehiculo con esa placa")
    }

    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } })
    if (!client) {
      throw new NotFoundException("Cliente no encontrado")
    }

    const vehicle = await this.prisma.vehicle.create({
      data: dto,
      include: { client: { select: { id: true, firstName: true, lastName: true } } },
    })

    await this.invalidateVehicleCache()
    this.logger.log(`Vehiculo creado: ${vehicle.plate} (${vehicle.id})`)
    return vehicle
  }

  async update(id: string, dto: UpdateVehicleDto) {
    const existing = await this.findOne(id)

    if (dto.plate) {
      const dup = await this.prisma.vehicle.findFirst({
        where: { plate: { equals: dto.plate, mode: "insensitive" }, id: { not: id } },
      })
      if (dup) throw new ConflictException("Ya existe otro vehiculo con esa placa")
    }

    if (dto.clientId) {
      const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } })
      if (!client) throw new NotFoundException("Cliente no encontrado")
    }

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: dto,
      include: { client: { select: { id: true, firstName: true, lastName: true } } },
    })

    await this.invalidateVehicleCache()
    await this.redis.del(`${VEHICLE_CACHE_PREFIX}:id:${id}`)
    if (existing.plate) await this.redis.del(`${VEHICLE_CACHE_PREFIX}:plate:${existing.plate.toUpperCase()}`)
    if (dto.plate) await this.redis.del(`${VEHICLE_CACHE_PREFIX}:plate:${dto.plate.toUpperCase()}`)

    this.logger.log(`Vehiculo actualizado: ${vehicle.plate} (${vehicle.id})`)
    return vehicle
  }

  private async invalidateVehicleCache() {
    try {
      const client = this.redis.client
      let cursor = "0"
      do {
        const [nextCursor, keys] = await client.scan(
          cursor, "MATCH", `${VEHICLE_CACHE_PREFIX}:list:*`, "COUNT", 100,
        )
        cursor = nextCursor
        if (keys.length > 0) await client.del(...keys)
      } while (cursor !== "0")
    } catch (err) {
      this.logger.warn(`Cache invalidation warning: ${(err as Error).message}`)
    }
  }

  async getWorkshopFleet() {
    return this.prisma.vehicle.findMany({
      where: { plate: { startsWith: "TAL-" } },
      include: {
        usageLogs: {
          where: { status: "PENDING_RETURN" },
          take: 1,
          include: { personnel: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }
}

