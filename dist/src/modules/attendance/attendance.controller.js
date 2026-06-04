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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const attendance_service_1 = require("./attendance.service");
const attendance_dto_1 = require("./dto/attendance.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let AttendanceController = class AttendanceController {
    attendanceService;
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    findAll(filters) { return this.attendanceService.findAll(filters); }
    getTodayStats() { return this.attendanceService.getTodayStats(); }
    getByPersonnel(personnelId, from, to) { return this.attendanceService.getByPersonnel(personnelId, from, to); }
    checkIn(dto) { return this.attendanceService.checkIn(dto.personnelId, dto.notes); }
    checkOut(dto) { return this.attendanceService.checkOut(dto.personnelId, dto.notes); }
    verify(dto) { return this.attendanceService.verify(dto.personnelId, dto.date, dto.verifiedBy); }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Listar asistencias", description: "Registros de asistencia con filtros por tipo (PRESENT, ABSENT, LATE, etc.) y rango de fechas." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Listado de asistencias" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_dto_1.AttendanceFilterDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("today"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Resumen de asistencia del dia", description: "Estadisticas de hoy: total de personal, presentes, ausentes, tardanzas." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Resumen de asistencia diaria" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getTodayStats", null);
__decorate([
    (0, common_1.Get)(":personnelId"),
    (0, swagger_1.ApiOperation)({ summary: "Asistencia de un empleado", description: "Historial de asistencia de un empleado en un rango de fechas." }),
    (0, swagger_1.ApiParam)({ name: "personnelId", description: "ID del personal (UUID v4)" }),
    (0, swagger_1.ApiQuery)({ name: "from", required: false }),
    (0, swagger_1.ApiQuery)({ name: "to", required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Historial de asistencia" }),
    __param(0, (0, common_1.Param)("personnelId")),
    __param(1, (0, common_1.Query)("from")),
    __param(2, (0, common_1.Query)("to")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getByPersonnel", null);
__decorate([
    (0, common_1.Post)("check-in"),
    (0, swagger_1.ApiOperation)({ summary: "Registrar entrada", description: "Marca la hora de ingreso. Si es despues de las 9am se marca como LATE." }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Check-in registrado" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "Ya tiene check-in hoy" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_dto_1.CheckInDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)("check-out"),
    (0, swagger_1.ApiOperation)({ summary: "Registrar salida" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Check-out registrado" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "No hay check-in hoy" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_dto_1.CheckOutDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Post)("verify"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Verificar asistencia", description: "ADMIN/OWNER verifican manualmente un registro de asistencia." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Asistencia verificada" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_dto_1.VerifyAttendanceDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "verify", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)("Attendance"),
    (0, common_1.Controller)("attendance"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map