import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { Prisma } from "@prisma/client"
import { WorkSchedule } from "../../domain/personnel"
import { AttendanceFilterDto } from "./dto/attendance.dto"

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: AttendanceFilterDto) {
    const { search, type, from, to, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where: Prisma.AttendanceWhereInput = {}

    if (type) {
      where.type = type
    }
    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from)
      if (to) where.date.lte = new Date(to)
    }
    if (search) {
      where.personnel = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          personnel: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              position: true,
              account: { select: { id: true, email: true, role: true } },
            },
          },
        },
      }),
      this.prisma.attendance.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async getByPersonnel(personnelId: string, from?: string, to?: string) {
    const personnel = await this.prisma.personnel.findUnique({
      where: { id: personnelId },
    })
    if (!personnel) {
      throw new NotFoundException("Personal no encontrado")
    }

    const where: Prisma.AttendanceWhereInput = { personnelId }

    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from)
      if (to) where.date.lte = new Date(to)
    }

    const records = await this.prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        personnel: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    return records
  }

  async getTodayStats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const records = await this.prisma.attendance.findMany({
      where: { date: today },
      select: { type: true, checkIn: true, checkOut: true },
    })

    const present = records.filter((r) => r.checkIn && !r.checkOut).length
    const absent = records.filter((r) => !r.checkIn).length
    const late = records.filter((r) => r.type === "LATE").length
    const completed = records.filter((r) => r.checkOut).length

    return {
      today: today.toISOString().split("T")[0],
      present,
      absent,
      late,
      completed,
      total: records.length,
    }
  }

  async checkIn(personnelId: string, notes?: string) {
    const personnel = await this.prisma.personnel.findUnique({
      where: { id: personnelId },
    })
    if (!personnel) {
      throw new NotFoundException("Personal no encontrado")
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await this.prisma.attendance.findUnique({
      where: { personnelId_date: { personnelId, date: today } },
    })

    if (existing) {
      if (existing.checkIn) {
        throw new ConflictException("Ya se registro la entrada hoy")
      }

      const updated = await this.prisma.attendance.update({
        where: { id: existing.id },
        data: { checkIn: new Date(), notes: notes ?? existing.notes },
      })

      this.logger.log(`Check-in actualizado: personal=${personnelId}`)
      return updated
    }

    const scheduleSetting = await this.prisma.setting.findUnique({
      where: { key: "attendance_schedule" },
    })
    const schedule = WorkSchedule.parse(scheduleSetting?.value ?? null)
    const isLate = WorkSchedule.evaluate(new Date(), schedule).isLate

    const record = await this.prisma.attendance.create({
      data: {
        personnelId,
        date: today,
        checkIn: new Date(),
        type: isLate ? "LATE" : "PRESENT",
        notes,
      },
      include: {
        personnel: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    this.logger.log(`Check-in creado: personal=${personnelId}`)
    return record
  }

  async checkOut(personnelId: string, notes?: string) {
    const personnel = await this.prisma.personnel.findUnique({
      where: { id: personnelId },
    })
    if (!personnel) {
      throw new NotFoundException("Personal no encontrado")
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const record = await this.prisma.attendance.findUnique({
      where: { personnelId_date: { personnelId, date: today } },
    })

    if (!record) {
      throw new NotFoundException("No hay check-in registrado para hoy")
    }

    if (!record.checkIn) {
      throw new BadRequestException("No tienes hora de entrada registrada")
    }

    if (record.checkOut) {
      throw new ConflictException("Ya se registro la salida hoy")
    }

    const updated = await this.prisma.attendance.update({
      where: { id: record.id },
      data: { checkOut: new Date(), notes: notes ?? record.notes },
      include: {
        personnel: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    this.logger.log(`Check-out registrado: personal=${personnelId}`)
    return updated
  }

  async verify(personnelId: string, date: string, verifiedBy: string) {
    const parsedDate = new Date(date)
    parsedDate.setHours(0, 0, 0, 0)

    const record = await this.prisma.attendance.findUnique({
      where: {
        personnelId_date: { personnelId, date: parsedDate },
      },
    })

    if (!record) {
      throw new NotFoundException("No se encontro registro de asistencia para esa fecha")
    }

    const updated = await this.prisma.attendance.update({
      where: { id: record.id },
      data: { verifiedBy },
      include: {
        personnel: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    this.logger.log(`Asistencia verificada: personal=${personnelId}, fecha=${date}, por=${verifiedBy}`)
    return updated
  }
}
