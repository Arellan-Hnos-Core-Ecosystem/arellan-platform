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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVehicleDto = exports.CreateVehicleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateVehicleDto {
    plate;
    brand;
    model;
    year;
    color;
    clientId;
}
exports.CreateVehicleDto = CreateVehicleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Placa del vehiculo (formato peruano)", example: "ABC-123", minLength: 3 }),
    (0, class_validator_1.IsString)({ message: "Placa es requerida" }),
    (0, class_validator_1.MinLength)(3, { message: "Placa minimo 3 caracteres" }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "plate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Marca del vehiculo", example: "Toyota" }),
    (0, class_validator_1.IsString)({ message: "Marca es requerida" }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Modelo del vehiculo", example: "Hilux" }),
    (0, class_validator_1.IsString)({ message: "Modelo es requerido" }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Ano de fabricacion", example: 2022, minimum: 1900, maximum: 2099 }),
    (0, class_validator_1.IsInt)({ message: "Ano debe ser un numero entero" }),
    (0, class_validator_1.Min)(1900, { message: "Ano no puede ser menor a 1900" }),
    (0, class_validator_1.Max)(2099, { message: "Ano invalido" }),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Color del vehiculo", example: "Blanco" }),
    (0, class_validator_1.IsString)({ message: "Color es requerido" }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del cliente propietario (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" }),
    (0, class_validator_1.IsUUID)("4", { message: "ID de cliente invalido" }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "clientId", void 0);
class UpdateVehicleDto {
    plate;
    brand;
    model;
    year;
    color;
    clientId;
}
exports.UpdateVehicleDto = UpdateVehicleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Nueva placa", example: "XYZ-999" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Placa invalida" }),
    (0, class_validator_1.MinLength)(3, { message: "Placa minimo 3 caracteres" }),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "plate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Marca", example: "Nissan" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Marca invalida" }),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Modelo", example: "Frontier" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Modelo invalido" }),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Ano de fabricacion", example: 2021 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: "Ano debe ser un numero entero" }),
    (0, class_validator_1.Min)(1900, { message: "Ano no puede ser menor a 1900" }),
    (0, class_validator_1.Max)(2099, { message: "Ano invalido" }),
    __metadata("design:type", Number)
], UpdateVehicleDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Color", example: "Negro" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Color invalido" }),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "ID del nuevo propietario", example: "660e8400-e29b-41d4-a716-446655440001" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4", { message: "ID de cliente invalido" }),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "clientId", void 0);
//# sourceMappingURL=vehicles.dto.js.map