import { Injectable, NotFoundException, Logger } from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    total: number
    limit: number
    cursor: string | null
    hasNextPage: boolean
  }
}

interface AuditFilters {
  userId?: string
  action?: string
  entity?: string
  from?: string
  to?: string
  limit?: number
  cursor?: string
  page?: number
  pageSize?: number
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: AuditFilters): Promise<PaginatedResult<any>> {
    const { userId, action, entity, from, to, limit = 50, cursor, page, pageSize } = filters

    const where: Record<string, unknown> = {}

    if (userId) where.userId = userId
    if (action) where.action = action
    if (entity) where.entity = entity

    if (from || to) {
      where.createdAt = {}
      if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from)
      if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to)
    }

    // Modo offset (panel admin: ?page=N&pageSize=M); el modo cursor de abajo
    // queda intacto para los consumidores existentes
    if (page !== undefined || pageSize !== undefined) {
      const size = Math.min(pageSize ?? 20, 100)
      const currentPage = page ?? 1
      const [pagedLogs, pagedTotal] = await Promise.all([
        this.prisma.auditLog.findMany({
          where,
          take: size,
          skip: (currentPage - 1) * size,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.auditLog.count({ where }),
      ])
      return {
        data: pagedLogs,
        pagination: {
          total: pagedTotal,
          limit: size,
          cursor: null,
          hasNextPage: currentPage * size < pagedTotal,
        },
      }
    }

    const take = Math.min(limit, 100) + 1

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        take,
        orderBy: { createdAt: "desc" },
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      this.prisma.auditLog.count({ where }),
    ])

    const hasMore = logs.length > Math.min(limit, 100)
    const data = hasMore ? logs.slice(0, -1) : logs
    const nextCursor = hasMore ? data[data.length - 1].id : null

    return {
      data,
      pagination: { total, limit: Math.min(limit, 100), cursor: nextCursor, hasNextPage: hasMore },
    }
  }

  async findOne(id: string) {
    const log = await this.prisma.auditLog.findUnique({ where: { id } })

    if (!log) {
      throw new NotFoundException("Registro de auditoria no encontrado")
    }

    return log
  }

  async getByUser(userId: string, limit = 50, cursor?: string): Promise<PaginatedResult<any>> {
    return this.findAll({ userId, limit, cursor })
  }

  async getByEntity(entity: string, entityId: string, limit = 50, cursor?: string): Promise<PaginatedResult<any>> {
    return this.findAll({ entity, limit, cursor })
  }
}
