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
exports.PersonnelController = void 0;
const common_1 = require("@nestjs/common");
const personnel_service_1 = require("./personnel.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const personnel_dto_1 = require("./dto/personnel.dto");
let PersonnelController = class PersonnelController {
    personnelService;
    constructor(personnelService) {
        this.personnelService = personnelService;
    }
    findAll(filters) {
        return this.personnelService.findAll(filters);
    }
    findOne(id) {
        return this.personnelService.findOne(id);
    }
    updateRole(id, dto, user) {
        return this.personnelService.updateRole(id, dto.role, user.id);
    }
    updateStatus(id, dto) {
        return this.personnelService.updateStatus(id, dto.status);
    }
    checkIn(user, dto) {
        return this.personnelService.checkInByUser(user.id, dto.notes);
    }
    checkOut(user, dto) {
        return this.personnelService.checkOutByUser(user.id, dto.notes);
    }
    getAttendanceToday() {
        return this.personnelService.getTodayAttendance();
    }
    authorizeVehicleUsage(dto, user) {
        return this.personnelService.authorizeVehicleUsage(dto, user.id, user.role);
    }
    getActiveVehicleUsages() {
        return this.personnelService.getActiveVehicleUsages();
    }
    getOverdueVehicleUsages() {
        return this.personnelService.getOverdueVehicleUsages();
    }
};
exports.PersonnelController = PersonnelController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [personnel_dto_1.PersonnelFilterDto]),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id/role"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, personnel_dto_1.UpdateRoleDto, Object]),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Patch)(":id/status"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, personnel_dto_1.UpdateStatusDto]),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)("attendance/check-in"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, personnel_dto_1.CheckInOutDto]),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)("attendance/check-out"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, personnel_dto_1.CheckInOutDto]),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Get)("attendance/today"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "getAttendanceToday", null);
__decorate([
    (0, common_1.Post)("vehicle-usage/authorize"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [personnel_dto_1.AuthorizeVehicleUsageDto, Object]),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "authorizeVehicleUsage", null);
__decorate([
    (0, common_1.Get)("vehicle-usage/active"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "getActiveVehicleUsages", null);
__decorate([
    (0, common_1.Get)("vehicle-usage/overdue"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "getOverdueVehicleUsages", null);
exports.PersonnelController = PersonnelController = __decorate([
    (0, common_1.Controller)("personnel"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [personnel_service_1.PersonnelService])
], PersonnelController);
//# sourceMappingURL=personnel.controller.js.map