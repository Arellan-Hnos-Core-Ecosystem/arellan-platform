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
exports.ClientsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const clients_service_1 = require("./clients.service");
const clients_dto_1 = require("./dto/clients.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let ClientsController = class ClientsController {
    clientsService;
    constructor(clientsService) {
        this.clientsService = clientsService;
    }
    findAll(search, limit, cursor) {
        return this.clientsService.findAll(search, limit ? parseInt(limit, 10) : undefined, cursor);
    }
    findOne(id) { return this.clientsService.findOne(id); }
    create(dto) { return this.clientsService.create(dto); }
    update(id, dto) { return this.clientsService.update(id, dto); }
    getHistory(id) { return this.clientsService.getHistory(id); }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Listar clientes", description: "Listado paginado de clientes con busqueda por nombre, apellido o DNI. Soporta paginacion por cursor." }),
    (0, swagger_1.ApiQuery)({ name: "search", description: "Busqueda por nombre, apellido o DNI", required: false, example: "Gonzales" }),
    (0, swagger_1.ApiQuery)({ name: "limit", description: "Resultados por pagina (default 20)", required: false }),
    (0, swagger_1.ApiQuery)({ name: "cursor", description: "Cursor para paginacion", required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Listado paginado de clientes" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    __param(0, (0, common_1.Query)("search")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("cursor")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Obtener cliente por ID", description: "Retorna datos completos del cliente incluyendo sus vehiculos registrados." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del cliente (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Datos del cliente con vehiculos" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Cliente no encontrado" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Registrar nuevo cliente", description: "Crea un cliente persona natural con DNI unico. Si el DNI ya existe, retorna conflicto." }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Cliente creado" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Datos invalidos" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "DNI ya registrado" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [clients_dto_1.CreateClientDto]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Actualizar datos del cliente" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del cliente (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Cliente actualizado" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Cliente no encontrado" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "DNI duplicado con otro cliente" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, clients_dto_1.UpdateClientDto]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(":id/history"),
    (0, swagger_1.ApiOperation)({ summary: "Historial de ordenes del cliente", description: "Todas las OT asociadas al cliente, ordenadas por fecha descendente. Incluye datos del vehiculo y mecanico." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del cliente (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Historial de OT del cliente" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Cliente no encontrado" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "getHistory", null);
exports.ClientsController = ClientsController = __decorate([
    (0, swagger_1.ApiTags)("Clients"),
    (0, common_1.Controller)("clients"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    __metadata("design:paramtypes", [clients_service_1.ClientsService])
], ClientsController);
//# sourceMappingURL=clients.controller.js.map