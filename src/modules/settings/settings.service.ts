import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { Prisma } from "@prisma/client"

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name)

  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.setting.findMany({
      orderBy: { category: "asc" },
    })
  }

  async getByCategory(category: string) {
    return this.prisma.setting.findMany({
      where: { category },
      orderBy: { key: "asc" },
    })
  }

  async get(key: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    })

    if (!setting) {
      throw new NotFoundException("Configuracion no encontrada")
    }

    return setting
  }

  async set(key: string, value: string, userId?: string) {
    const existing = await this.prisma.setting.findUnique({
      where: { key },
    })

    let setting
    if (existing) {
      setting = await this.prisma.setting.update({
        where: { key },
        data: {
          value,
          updatedBy: userId,
        },
      })
      this.logger.log(`Configuracion actualizada: ${key}`)
    } else {
      setting = await this.prisma.setting.create({
        data: {
          key,
          value,
          category: "GENERAL",
          updatedBy: userId,
        },
      })
      this.logger.log(`Configuracion creada: ${key}`)
    }

    return setting
  }

  async create(key: string, value: string, category = "GENERAL", isPublic = false, userId?: string) {
    const existing = await this.prisma.setting.findUnique({
      where: { key },
    })
    if (existing) {
      throw new ConflictException("Ya existe una configuracion con esa clave")
    }

    const setting = await this.prisma.setting.create({
      data: {
        key,
        value,
        category,
        isPublic,
        updatedBy: userId,
      },
    })

    this.logger.log(`Configuracion creada: ${key}`)
    return setting
  }

  async update(key: string, value: string, userId?: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    })
    if (!setting) {
      throw new NotFoundException("Configuracion no encontrada")
    }

    const updated = await this.prisma.setting.update({
      where: { key },
      data: { value, updatedBy: userId },
    })

    this.logger.log(`Configuracion actualizada: ${key}`)
    return updated
  }

  async delete(key: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    })
    if (!setting) {
      throw new NotFoundException("Configuracion no encontrada")
    }

    await this.prisma.setting.delete({ where: { key } })
    this.logger.log(`Configuracion eliminada: ${key}`)

    return { message: "Configuracion eliminada" }
  }
}
