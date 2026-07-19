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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const finance_service_1 = require("./finance.service");
const close_cashbox_session_use_case_1 = require("./use-cases/close-cashbox-session.use-case");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const mfa_required_guard_1 = require("../../common/guards/mfa-required.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const finance_dto_1 = require("./dto/finance.dto");
let FinanceController = class FinanceController {
    financeService;
    closeCashboxSessionUseCase;
    constructor(financeService, closeCashboxSessionUseCase) {
        this.financeService = financeService;
        this.closeCashboxSessionUseCase = closeCashboxSessionUseCase;
    }
    openCashbox(user, dto) {
        return this.financeService.openCashbox(user.id, dto);
    }
    closeCashbox(user, dto) {
        return this.closeCashboxSessionUseCase.execute(user.id, {
            actualCash: dto.actualCash,
            justificationText: dto.justificationText,
        });
    }
    getTodaySession() {
        return this.financeService.getTodaySession();
    }
    addTransaction(dto, sessionId) {
        return this.financeService.addTransaction(sessionId, dto);
    }
    createExpense(user, dto) {
        return this.financeService.createExpense(user.id, dto);
    }
    getPendingExpenses(user) {
        return this.financeService.getPendingExpenses(user.id);
    }
    approveExpense(id, user, dto) {
        return this.financeService.approveExpense(id, user.id, dto);
    }
    getExpenses(filters) {
        return this.financeService.getExpenses(filters);
    }
    getDashboard(period = "month") {
        return this.financeService.getDashboard(period);
    }
    getCashflow(from, to) {
        return this.financeService.getCashflow(from ? new Date(from) : undefined, to ? new Date(to) : undefined);
    }
    getCashboxHistory(limit, cursor) {
        return this.financeService.getCashboxHistory(limit, cursor);
    }
    async overrideCashbox(user, dto) {
        const { authenticator } = await Promise.resolve().then(() => require("otplib"));
        const owner = await this.financeService["prisma"].account.findUnique({
            where: { id: user.id },
            select: { mfaSecret: true, mfaEnabled: true },
        });
        if (!owner?.mfaEnabled || !owner?.mfaSecret) {
            throw new common_1.BadRequestException("El OWNER no tiene MFA configurado. Configure Google Authenticator primero.");
        }
        const isValid = authenticator.verify({ token: dto.totpCode, secret: owner.mfaSecret });
        if (!isValid) {
            throw new common_1.BadRequestException("Código TOTP inválido o expirado.");
        }
        const session = await this.financeService["prisma"].cashboxSession.findUnique({
            where: { id: dto.sessionId },
        });
        if (!session || session.status !== "BLOCKED") {
            throw new common_1.BadRequestException("La sesión de caja no existe o no está en estado BLOCKED.");
        }
        const unblocked = await this.financeService["prisma"].cashboxSession.update({
            where: { id: dto.sessionId },
            data: {
                status: "CLOSED_WITH_DISCREPANCY",
                closedAt: new Date(),
                notes: `OVERRIDE por OWNER ${user.id} con TOTP. ${dto.overrideReason ?? ""}`.trim(),
            },
        });
        await this.financeService["prisma"].auditLog.create({
            data: {
                userId: user.id,
                userName: "owner-override",
                role: "OWNER",
                action: "CASHBOX_OVERRIDE_TOTP",
                entity: "CashboxSession",
                entityId: dto.sessionId,
                severity: "WARNING",
                ipAddress: "system",
                metadata: { overrideReason: dto.overrideReason ?? null },
            },
        });
        return {
            success: true,
            sessionId: dto.sessionId,
            newStatus: unblocked.status,
            overriddenBy: user.id,
            overriddenAt: new Date().toISOString(),
        };
    }
    async generatePaymentQR(user, body) {
        return this.financeService.generatePaymentQR(body.workOrderId, user.id);
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Post)("cashbox/open"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, mfa_required_guard_1.MfaRequiredGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Abrir caja del dia",
        description: "Inicia una sesion de caja con saldo inicial. Solo una caja puede estar abierta por dia. Requiere MFA para prevenir aperturas no autorizadas.",
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Caja abierta exitosamente" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido o MFA no verificado" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo ADMIN u OWNER" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "Ya existe una caja abierta hoy" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, finance_dto_1.OpenCashboxDto]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "openCashbox", null);
__decorate([
    (0, common_1.Post)("cashbox/close"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Cerrar caja del dia",
        description: "Cierra la sesion de caja activa. Calcula automaticamente la discrepancia entre el efectivo esperado (apertura + ingresos - gastos) y el efectivo real contado. Discrepancia > S/50 dispara alerta antifraude via BullMQ.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Caja cerrada - incluye calculo de discrepancia" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo ADMIN u OWNER" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "No hay caja abierta para cerrar" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, finance_dto_1.CloseCashboxDto]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "closeCashbox", null);
__decorate([
    (0, common_1.Get)("cashbox/today"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.FINANCE, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({ summary: "Consultar estado de caja actual", description: "Retorna la sesion de caja abierta hoy con todas las transacciones registradas. Si no hay caja abierta, retorna open: false." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Estado de la caja (abierta o cerrada)" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Roles: ADMIN, FINANCE, OWNER" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getTodaySession", null);
__decorate([
    (0, common_1.Post)("cashbox/transactions"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.FINANCE),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({ summary: "Registrar transaccion en caja", description: "Agrega un pago o gasto a la sesion de caja activa. La caja debe estar abierta." }),
    (0, swagger_1.ApiQuery)({ name: "sessionId", description: "ID de la sesion de caja", example: "550e8400-e29b-41d4-a716-446655440000" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Transaccion registrada" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo ADMIN o FINANCE" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Sesion de caja no encontrada" }),
    (0, swagger_1.ApiResponse)({ status: 422, description: "La caja no esta abierta" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("sessionId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [finance_dto_1.CreateTransactionDto, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "addTransaction", null);
__decorate([
    (0, common_1.Post)("expenses"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, mfa_required_guard_1.MfaRequiredGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.FINANCE, client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Crear solicitud de gasto",
        description: "Registra un gasto pendiente de aprobacion con nivel segun monto: <=S/100 FINANCE, <=S/500 ADMIN, <=S/2000 OWNER, >S/2000 DUAL_OWNER. Gastos >=S/200 o categoria SERVICIOS/OTHER disparan alerta BullMQ.",
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Gasto creado - pendiente de aprobacion" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Datos invalidos" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido o MFA no verificado" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Roles: FINANCE, ADMIN, OWNER" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, finance_dto_1.CreateExpenseDto]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createExpense", null);
__decorate([
    (0, common_1.Get)("expenses/pending"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.FINANCE, client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({ summary: "Listar gastos pendientes de aprobacion", description: "Retorna todos los gastos en estado PENDING_APPROVAL. Excluye los del usuario consultante para evitar auto-aprobacion." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Lista de gastos pendientes" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getPendingExpenses", null);
__decorate([
    (0, common_1.Post)("expenses/:id/approve"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, mfa_required_guard_1.MfaRequiredGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Aprobar o rechazar gasto",
        description: "Procesa la decision sobre un gasto pendiente. No se permite auto-aprobacion. Valida nivel jerarquico del aprobador vs nivel requerido por el gasto. Al aprobar se marca como DISBURSED.",
    }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del gasto (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Gasto aprobado (DISBURSED) o rechazado (REJECTED)" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Auto-aprobacion prohibida, nivel insuficiente, o rol no autorizado" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Gasto no encontrado" }),
    (0, swagger_1.ApiResponse)({ status: 422, description: "Gasto ya fue procesado" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, finance_dto_1.ApproveExpenseDto]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "approveExpense", null);
__decorate([
    (0, common_1.Get)("expenses"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.FINANCE, client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({ summary: "Listar gastos con filtros", description: "Listado paginado de gastos con filtros por estado, categoria, solicitante y rango de fechas." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Listado paginado de gastos" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [finance_dto_1.ExpenseFiltersDto]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getExpenses", null);
__decorate([
    (0, common_1.Get)("dashboard"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.FINANCE),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({ summary: "Dashboard financiero", description: "KPIs financieros: ingresos, gastos, ganancia neta, transacciones, ordenes activas, aprobaciones pendientes. Periodo: day, week, month." }),
    (0, swagger_1.ApiQuery)({ name: "period", description: "Periodo de analisis", enum: ["day", "week", "month"], example: "month", required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Resumen financiero del periodo" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    __param(0, (0, common_1.Query)("period")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)("cashflow"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({ summary: "Flujo de caja", description: "Analisis de entradas y salidas de efectivo agrupadas por metodo de pago en un rango de fechas." }),
    (0, swagger_1.ApiQuery)({ name: "from", description: "Fecha inicio (ISO 8601)", example: "2026-06-01", required: false }),
    (0, swagger_1.ApiQuery)({ name: "to", description: "Fecha fin (ISO 8601)", example: "2026-06-30", required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Flujo de caja detallado con totales" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    __param(0, (0, common_1.Query)("from")),
    __param(1, (0, common_1.Query)("to")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getCashflow", null);
__decorate([
    (0, common_1.Get)("cashbox/history"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({ summary: "Historial de cierres de caja", description: "Listado paginado de sesiones de caja cerradas con sus transacciones y usuarios responsables." }),
    (0, swagger_1.ApiQuery)({ name: "limit", description: "Resultados por pagina", example: "20", required: false }),
    (0, swagger_1.ApiQuery)({ name: "cursor", description: "Cursor de paginacion", example: "550e8400-e29b-41d4-a716-446655440000", required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Historial de cajas cerradas" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    __param(0, (0, common_1.Query)("limit")),
    __param(1, (0, common_1.Query)("cursor")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getCashboxHistory", null);
__decorate([
    (0, common_1.Post)("cashbox/override"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Override de caja bloqueada (OWNER + TOTP)",
        description: "Desbloquea una sesión de caja en estado BLOCKED. Requiere código TOTP de 6 dígitos del OWNER via Google Authenticator. Anti-Fraude #2: solo OWNER puede desbloquear.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Caja desbloqueada y cerrada con discrepancia" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Código TOTP inválido o sesión no está BLOCKED" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo OWNER" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, finance_dto_1.CashboxOverrideDto]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "overrideCashbox", null);
__decorate([
    (0, common_1.Post)("qr/generate"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({ summary: "Generar QR dinamico de cobro", description: "Genera QR de pago para una OT con expiracion de 7 minutos." }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "generatePaymentQR", null);
exports.FinanceController = FinanceController = __decorate([
    (0, swagger_1.ApiTags)("Finance"),
    (0, common_1.Controller)("finance"),
    __metadata("design:paramtypes", [finance_service_1.FinanceService,
        close_cashbox_session_use_case_1.CloseCashboxSessionUseCase])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map