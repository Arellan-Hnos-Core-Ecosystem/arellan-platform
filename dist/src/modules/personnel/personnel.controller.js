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
const swagger_1 = require("@nestjs/swagger");
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
    findAll(filters) { return this.personnelService.findAll(filters); }
    findOne(id) { return this.personnelService.findOne(id); }
    updateRole(id, dto, user) { return this.personnelService.updateRole(id, dto.role, user.id); }
    updateStatus(id, dto) { return this.personnelService.updateStatus(id, dto.status); }
    checkIn(user, dto) { return this.personnelService.checkInByUser(user.id, dto.notes); }
    checkOut(user, dto) { return this.personnelService.checkOutByUser(user.id, dto.notes); }
    getAttendanceToday() { return this.personnelService.getTodayAttendance(); }
    authorizeVehicleUsage(dto, user) { return this.personnelService.authorizeVehicleUsage(dto, user.id, user.role); }
    getActiveVehicleUsages() { return this.personnelService.getActiveVehicleUsages(); }
    getOverdueVehicleUsages() { return this.personnelService.getOverdueVehicleUsages(); }
};
exports.PersonnelController = PersonnelController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: "Listar personal", description: "Listado paginado del personal con filtros por rol, estado y busqueda por nombre/email." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Listado paginado de personal" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [personnel_dto_1.PersonnelFilterDto]),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE),
    (0, swagger_1.ApiOperation)({ summary: "Perfil del personal", description: "Datos completos: cuenta, asistencia del mes, uso de vehiculos activos." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del personal (UUID v4 de la cuenta)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Perfil completo del personal" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Personal no encontrado" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id/role"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: "Cambiar rol del personal (OWNER)", description: "Modifica el rol de un usuario. No se puede cambiar el rol de un OWNER ni asignar rol OWNER." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la cuenta (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Rol actualizado" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "No se puede cambiar OWNER ni asignar OWNER" }),
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
    (0, swagger_1.ApiOperation)({ summary: "Cambiar estado del personal (OWNER)", description: "Activa, inactiva o termina una cuenta." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la cuenta (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Estado actualizado" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "No se puede cambiar estado de OWNER" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, personnel_dto_1.UpdateAccountStatusDto]),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)("attendance/check-in"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: "Registrar entrada (check-in)", description: "Marca la hora de ingreso del usuario autenticado. Si llega despues de las 9am se registra como LATE." }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Check-in registrado" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "Ya registraste entrada hoy" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, personnel_dto_1.CheckInOutDto]),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)("attendance/check-out"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: "Registrar salida (check-out)", description: "Marca la hora de salida. Requiere haber hecho check-in previamente." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Check-out registrado" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "No hay check-in hoy" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "Ya registraste salida hoy" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, personnel_dto_1.CheckInOutDto]),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Get)("attendance/today"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: "Asistencia del dia", description: "Resumen de asistencias de hoy: presentes, ausentes, tardanzas." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Resumen de asistencia diaria" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "getAttendanceToday", null);
__decorate([
    (0, common_1.Post)("vehicle-usage/authorize"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: "Autorizar uso de vehiculo del taller", description: "OWNER o ADMIN autorizan a un empleado a usar un vehiculo de la flota. Registra kilometraje de salida y proposito." }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Uso de vehiculo autorizado" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo OWNER o ADMIN" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Personal o vehiculo no encontrado" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [personnel_dto_1.AuthorizeVehicleUsageDto, Object]),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "authorizeVehicleUsage", null);
__decorate([
    (0, common_1.Get)("vehicle-usage/active"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: "Usos de vehiculo activos", description: "Vehiculos de la flota actualmente en uso (PENDING_RETURN)." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Lista de usos activos" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "getActiveVehicleUsages", null);
__decorate([
    (0, common_1.Get)("vehicle-usage/overdue"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: "Usos de vehiculo vencidos", description: "Vehiculos no devueltos a tiempo (fecha de retorno esperada superada)." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Lista de usos vencidos" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PersonnelController.prototype, "getOverdueVehicleUsages", null);
exports.PersonnelController = PersonnelController = __decorate([
    (0, swagger_1.ApiTags)("Personnel"),
    (0, common_1.Controller)("personnel"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    __metadata("design:paramtypes", [personnel_service_1.PersonnelService])
], PersonnelController);
//# sourceMappingURL=personnel.controller.js.map