import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { Prisma, ApprovalStatus, UserRole } from "@prisma/client"
import { CommissionFilterDto, CreateCommissionDto } from "./dto/commissions.dto"

@Injectable()
export class CommissionsService {
  private readonly logger = new Logger(CommissionsService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: CommissionFilterDto) {
    const { status, personnelId, supplierId, from, to, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where: Prisma.CommissionWhereInput = {}
    if (status) where.status = status
    if (personnelId) where.personnelId = personnelId
    if (supplierId) where.supplierId = supplierId
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.commission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          personnel: { select: { id: true, firstName: true, lastName: true, position: true } },
          supplier: { select: { id: true, name: true } },
          purchase: { select: { id: true, number: true } },
        },
      }),
      this.prisma.commission.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async create(dto: CreateCommissionDto, requestingUserRole: string, requestingUserId: string) {
    if (requestingUserRole !== "OWNER") {
      throw new ForbiddenException("Solo el OWNER puede crear comisiones")
    }

    const personnel = await this.prisma.personnel.findUnique({
      where: { id: dto.personnelId },
    })
    if (!personnel) {
      throw new NotFoundException("Personal no encontrado")
    }

    if (dto.purchaseId) {
      const purchase = await this.prisma.purchase.findUnique({
        where: { id: dto.purchaseId },
      })
      if (!purchase) {
        throw new NotFoundException("Compra no encontrada")
      }
    }

    if (dto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: dto.supplierId },
      })
      if (!supplier) {
        throw new NotFoundException("Proveedor no encontrado")
      }
    }

    const commission = await this.prisma.commission.create({
      data: {
        personnelId: dto.personnelId,
        supplierId: dto.supplierId,
        purchaseId: dto.purchaseId,
        type: dto.type,
        amount: dto.amount,
        percentage: dto.percentage,
        status: ApprovalStatus.PENDING,
        notes: dto.notes,
      },
      include: {
        personnel: { select: { id: true, firstName: true, lastName: true } },
        supplier: { select: { id: true, name: true } },
      },
    })

    this.logger.log(`Comision creada: ${commission.id} para ${personnel.firstName} ${personnel.lastName}`)
    return commission
  }

  async approve(id: string, approverId: string) {
    const commission = await this.prisma.commission.findUnique({ where: { id } })
    if (!commission) {
      throw new NotFoundException("Comision no encontrada")
    }

    if (commission.status !== ApprovalStatus.PENDING) {
      throw new ConflictException(`La comision ya fue ${commission.status}`)
    }

    const approver = await this.prisma.account.findUnique({
      where: { id: approverId },
    })
    if (!approver) {
      throw new NotFoundException("Aprobador no encontrado")
    }

    if (!([UserRole.OWNER, UserRole.ADMIN] as UserRole[]).includes(approver.role)) {
      throw new ForbiddenException("Solo OWNER o ADMIN pueden aprobar comisiones")
    }

    const updated = await this.prisma.commission.update({
      where: { id },
      data: {
        status: ApprovalStatus.APPROVED,
      },
      include: {
        personnel: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    this.logger.log(`Comision aprobada: ${id} por ${approverId}`)
    return updated
  }

  async pay(id: string) {
    const commission = await this.prisma.commission.findUnique({ where: { id } })
    if (!commission) {
      throw new NotFoundException("Comision no encontrada")
    }

    if (commission.status !== ApprovalStatus.APPROVED) {
      throw new ConflictException("Solo se pueden pagar comisiones aprobadas")
    }

    if (commission.paidAt) {
      throw new ConflictException("Esta comision ya fue pagada")
    }

    const updated = await this.prisma.commission.update({
      where: { id },
      data: { paidAt: new Date() },
      include: {
        personnel: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    this.logger.log(`Comision pagada: ${id}`)
    return updated
  }

  async getByPersonnel(personnelId: string) {
    const personnel = await this.prisma.personnel.findUnique({
      where: { id: personnelId },
    })
    if (!personnel) {
      throw new NotFoundException("Personal no encontrado")
    }

    return this.prisma.commission.findMany({
      where: { personnelId },
      orderBy: { createdAt: "desc" },
      include: {
        supplier: { select: { id: true, name: true } },
        purchase: { select: { id: true, number: true } },
      },
    })
  }

  async getBySupplier(supplierId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    })
    if (!supplier) {
      throw new NotFoundException("Proveedor no encontrado")
    }

    return this.prisma.commission.findMany({
      where: { supplierId },
      orderBy: { createdAt: "desc" },
      include: {
        personnel: { select: { id: true, firstName: true, lastName: true } },
      },
    })
  }
}

