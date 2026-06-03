import { Injectable, NotFoundException, ConflictException, Logger } from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { CreateVehicleDto, UpdateVehicleDto } from "./dto/vehicles.dto"

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, limit = 20, cursor?: string) {
    const take = limit + 1

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

    return { data, nextCursor, hasMore }
  }

  async findByPlate(plate: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { plate: { equals: plate, mode: "insensitive" } },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, phone: true } },
      },
    })

    if (!vehicle) {
      throw new NotFoundException("Vehiculo no encontrado")
    }

    return vehicle
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        client: true,
        workOrders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            number: true,
            status: true,
            description: true,
            totalCost: true,
            createdAt: true,
          },
        },
      },
    })
    if (!vehicle) {
      throw new NotFoundException("Vehiculo no encontrado")
    }
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

    this.logger.log(`Vehiculo creado: ${vehicle.plate} (${vehicle.id})`)
    return vehicle
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.findOne(id)

    if (dto.plate) {
      const existing = await this.prisma.vehicle.findFirst({
        where: { plate: { equals: dto.plate, mode: "insensitive" }, id: { not: id } },
      })
      if (existing) {
        throw new ConflictException("Ya existe otro vehiculo con esa placa")
      }
    }

    if (dto.clientId) {
      const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } })
      if (!client) {
        throw new NotFoundException("Cliente no encontrado")
      }
    }

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: dto,
      include: { client: { select: { id: true, firstName: true, lastName: true } } },
    })

    this.logger.log(`Vehiculo actualizado: ${vehicle.plate} (${vehicle.id})`)
    return vehicle
  }
}
