"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let SettingsService = SettingsService_1 = class SettingsService {
    prisma;
    logger = new common_1.Logger(SettingsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAll() {
        return this.prisma.setting.findMany({
            orderBy: { category: "asc" },
        });
    }
    async getByCategory(category) {
        return this.prisma.setting.findMany({
            where: { category },
            orderBy: { key: "asc" },
        });
    }
    async get(key) {
        const setting = await this.prisma.setting.findUnique({
            where: { key },
        });
        if (!setting) {
            throw new common_1.NotFoundException("Configuracion no encontrada");
        }
        return setting;
    }
    async set(key, value, userId) {
        const existing = await this.prisma.setting.findUnique({
            where: { key },
        });
        let setting;
        if (existing) {
            setting = await this.prisma.setting.update({
                where: { key },
                data: {
                    value,
                    updatedBy: userId,
                },
            });
            this.logger.log(`Configuracion actualizada: ${key}`);
        }
        else {
            setting = await this.prisma.setting.create({
                data: {
                    key,
                    value,
                    category: "GENERAL",
                    updatedBy: userId,
                },
            });
            this.logger.log(`Configuracion creada: ${key}`);
        }
        return setting;
    }
    async create(key, value, category = "GENERAL", isPublic = false, userId) {
        const existing = await this.prisma.setting.findUnique({
            where: { key },
        });
        if (existing) {
            throw new common_1.ConflictException("Ya existe una configuracion con esa clave");
        }
        const setting = await this.prisma.setting.create({
            data: {
                key,
                value,
                category,
                isPublic,
                updatedBy: userId,
            },
        });
        this.logger.log(`Configuracion creada: ${key}`);
        return setting;
    }
    async update(key, value, userId) {
        const setting = await this.prisma.setting.findUnique({
            where: { key },
        });
        if (!setting) {
            throw new common_1.NotFoundException("Configuracion no encontrada");
        }
        const updated = await this.prisma.setting.update({
            where: { key },
            data: { value, updatedBy: userId },
        });
        this.logger.log(`Configuracion actualizada: ${key}`);
        return updated;
    }
    async delete(key) {
        const setting = await this.prisma.setting.findUnique({
            where: { key },
        });
        if (!setting) {
            throw new common_1.NotFoundException("Configuracion no encontrada");
        }
        await this.prisma.setting.delete({ where: { key } });
        this.logger.log(`Configuracion eliminada: ${key}`);
        return { message: "Configuracion eliminada" };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map