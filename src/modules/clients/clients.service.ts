import { Injectable, NotFoundException, ConflictException, Logger } from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { CreateClientDto, UpdateClientDto } from "./dto/clients.dto"

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, limit = 20, cursor?: string) {
    const take = limit + 1

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { dni: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const clients = await this.prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    })

    const hasMore = clients.length > limit
    const data = hasMore ? clients.slice(0, limit) : clients
    const nextCursor = hasMore ? data[data.length - 1].id : null

    return { data, nextCursor, hasMore }
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { vehicles: true },
    })
    if (!client) {
      throw new NotFoundException("Cliente no encontrado")
    }
    return client
  }

  async create(dto: CreateClientDto) {
    if (dto.dni) {
      const existing = await this.prisma.client.findUnique({ where: { dni: dto.dni } })
      if (existing) {
        throw new ConflictException("Ya existe un cliente con ese DNI")
      }
    }

    const client = await this.prisma.client.create({
      data: { ...dto, phone: dto.phone ?? "-" },
    })

    this.logger.log(`Cliente creado: ${client.firstName} ${client.lastName} (${client.id})`)
    return client
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id)

    if (dto.dni) {
      const existing = await this.prisma.client.findFirst({
        where: { dni: dto.dni, id: { not: id } },
      })
      if (existing) {
        throw new ConflictException("Ya existe otro cliente con ese DNI")
      }
    }

    const client = await this.prisma.client.update({
      where: { id },
      data: dto,
    })

    this.logger.log(`Cliente actualizado: ${client.firstName} ${client.lastName} (${client.id})`)
    return client
  }

  async getHistory(id: string) {
    await this.findOne(id)

    const workOrders = await this.prisma.workOrder.findMany({
      where: { clientId: id },
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: { select: { plate: true, brand: true, model: true } },
        mechanic: { select: { name: true } },
      },
    })

    return workOrders
  }
}
