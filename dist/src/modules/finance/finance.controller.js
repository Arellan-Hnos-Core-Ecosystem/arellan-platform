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
const finance_service_1 = require("./finance.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const mfa_required_guard_1 = require("../../common/guards/mfa-required.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const finance_dto_1 = require("./dto/finance.dto");
let FinanceController = class FinanceController {
    financeService;
    constructor(financeService) {
        this.financeService = financeService;
    }
    openCashbox(user, dto) {
        return this.financeService.openCashbox(user.id, dto);
    }
    closeCashbox(user, dto) {
        return this.financeService.closeCashbox(user.id, dto);
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
    getCashboxHistory(limit, cursor) {
        return this.financeService.getCashboxHistory(limit, cursor);
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Post)("cashbox/open"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, mfa_required_guard_1.MfaRequiredGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getTodaySession", null);
__decorate([
    (0, common_1.Post)("cashbox/transactions"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.FINANCE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("sessionId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [finance_dto_1.CreateTransactionDto, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "addTransaction", null);
__decorate([
    (0, common_1.Post)("expenses"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, mfa_required_guard_1.MfaRequiredGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.FINANCE, client_1.UserRole.ADMIN),
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
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getPendingExpenses", null);
__decorate([
    (0, common_1.Post)("expenses/:id/approve"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, mfa_required_guard_1.MfaRequiredGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
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
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [finance_dto_1.ExpenseFiltersDto]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getExpenses", null);
__decorate([
    (0, common_1.Get)("cashbox/history"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    __param(0, (0, common_1.Query)("limit")),
    __param(1, (0, common_1.Query)("cursor")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getCashboxHistory", null);
exports.FinanceController = FinanceController = __decorate([
    (0, common_1.Controller)("finance"),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map