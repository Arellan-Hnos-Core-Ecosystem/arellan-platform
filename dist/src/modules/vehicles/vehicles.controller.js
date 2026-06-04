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
exports.VehiclesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vehicles_service_1 = require("./vehicles.service");
const vehicles_dto_1 = require("./dto/vehicles.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let VehiclesController = class VehiclesController {
    vehiclesService;
    constructor(vehiclesService) {
        this.vehiclesService = vehiclesService;
    }
    findByPlate(plate) { return this.vehiclesService.findByPlate(plate); }
    getWorkshopFleet() { return this.vehiclesService.getWorkshopFleet(); }
    findAll(search, limit, cursor) {
        return this.vehiclesService.findAll(search, limit ? parseInt(limit, 10) : undefined, cursor);
    }
    findOne(id) { return this.vehiclesService.findOne(id); }
    create(dto) { return this.vehiclesService.create(dto); }
    update(id, dto) { return this.vehiclesService.update(id, dto); }
};
exports.VehiclesController = VehiclesController;
__decorate([
    (0, common_1.Get)("lookup/:plate"),
    (0, swagger_1.ApiOperation)({
        summary: "Buscar vehiculo por placa (publico con cache)",
        description: "Busqueda express por numero de placa. Utiliza Redis Cache-Aside con TTL de 300s para responder en milisegundos a consultas concurrentes desde tablets y portal del cliente. Acceso sin JWT requerido.",
    }),
    (0, swagger_1.ApiParam)({ name: "plate", description: "Numero de placa del vehiculo (formato peruano)", example: "ABC-123" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Vehiculo encontrado con datos del propietario" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Vehiculo no encontrado" }),
    __param(0, (0, common_1.Param)("plate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "findByPlate", null);
__decorate([
    (0, common_1.Get)("workshop-fleet"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({ summary: "Flota interna del taller", description: "Vehiculos sin cliente asignado (uso interno del taller)." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Lista de vehiculos de flota" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "getWorkshopFleet", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({ summary: "Listar vehiculos", description: "Listado paginado con busqueda por placa o marca." }),
    (0, swagger_1.ApiQuery)({ name: "search", required: false, example: "Toyota" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false }),
    (0, swagger_1.ApiQuery)({ name: "cursor", required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Listado paginado de vehiculos" }),
    __param(0, (0, common_1.Query)("search")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("cursor")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({ summary: "Detalle de vehiculo", description: "Datos completos del vehiculo con sus ultimas 10 OT." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del vehiculo (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Vehiculo con historial de OT" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Vehiculo no encontrado" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({ summary: "Registrar nuevo vehiculo" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Vehiculo creado" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Datos invalidos" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Cliente no encontrado" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "Placa ya registrada" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vehicles_dto_1.CreateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({ summary: "Actualizar datos del vehiculo", description: "Invalida cache Redis de placa y listados al modificar." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del vehiculo (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Vehiculo actualizado" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Vehiculo no encontrado" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "Placa duplicada" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vehicles_dto_1.UpdateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "update", null);
exports.VehiclesController = VehiclesController = __decorate([
    (0, swagger_1.ApiTags)("Vehicles"),
    (0, common_1.Controller)("vehicles"),
    __metadata("design:paramtypes", [vehicles_service_1.VehiclesService])
], VehiclesController);
//# sourceMappingURL=vehicles.controller.js.map