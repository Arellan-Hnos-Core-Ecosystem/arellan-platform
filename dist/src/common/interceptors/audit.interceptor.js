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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditInterceptor = class AuditInterceptor {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const method = request.method;
        const url = request.url;
        if (!user || !this.prisma || ["GET", "HEAD", "OPTIONS"].includes(method)) {
            return next.handle();
        }
        return next.handle().pipe((0, operators_1.tap)(async () => {
            const action = this.buildAction(method, url);
            try {
                await this.prisma.auditLog.create({
                    data: {
                        userId: user.id,
                        userName: user.name || user.email,
                        role: user.role,
                        action,
                        entity: this.extractEntity(url),
                        ipAddress: request.ip || "unknown",
                        userAgent: request.headers["user-agent"] || undefined,
                        metadata: { method, path: url, statusCode: 200 },
                    },
                });
            }
            catch {
            }
        }));
    }
    buildAction(method, url) {
        const entity = this.extractEntity(url).toUpperCase();
        switch (method) {
            case "POST": return `${entity}_CREATED`;
            case "PATCH": return `${entity}_UPDATED`;
            case "PUT": return `${entity}_UPDATED`;
            case "DELETE": return `${entity}_DELETED`;
            default: return `${entity}_MODIFIED`;
        }
    }
    extractEntity(url) {
        const parts = url.split("/").filter(Boolean);
        const apiIndex = parts.findIndex((p) => p === "api");
        return parts[apiIndex + 2] || "unknown";
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map