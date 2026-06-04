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
exports.UpdateClientDto = exports.CreateClientDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateClientDto {
    firstName;
    lastName;
    phone;
    email;
    dni;
}
exports.CreateClientDto = CreateClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Nombre del cliente", example: "Roberto", minLength: 2 }),
    (0, class_validator_1.IsString)({ message: "Nombre es requerido" }),
    (0, class_validator_1.MinLength)(2, { message: "Nombre minimo 2 caracteres" }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Apellido del cliente", example: "Gonzales", minLength: 2 }),
    (0, class_validator_1.IsString)({ message: "Apellido es requerido" }),
    (0, class_validator_1.MinLength)(2, { message: "Apellido minimo 2 caracteres" }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Telefono de contacto (9 digitos)", example: "987654321" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Telefono invalido" }),
    (0, class_validator_1.Matches)(/^\+?[\d\s-]{6,15}$/, { message: "Telefono invalido. Formato: +51999888777 o 999888777" }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Correo electronico", example: "cliente@email.com" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: "Correo electronico invalido" }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "DNI peruano de 8 digitos", example: "71234567" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "DNI invalido" }),
    (0, class_validator_1.Matches)(/^\d{8}$/, { message: "DNI invalido. Debe tener 8 digitos" }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "dni", void 0);
class UpdateClientDto {
    firstName;
    lastName;
    phone;
    email;
    dni;
}
exports.UpdateClientDto = UpdateClientDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Nombre del cliente", example: "Roberto" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Nombre invalido" }),
    (0, class_validator_1.MinLength)(2, { message: "Nombre minimo 2 caracteres" }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Apellido del cliente", example: "Gonzales" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Apellido invalido" }),
    (0, class_validator_1.MinLength)(2, { message: "Apellido minimo 2 caracteres" }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Telefono", example: "987654321" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Telefono invalido" }),
    (0, class_validator_1.Matches)(/^\+?[\d\s-]{6,15}$/, { message: "Telefono invalido" }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Correo electronico", example: "cliente@email.com" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: "Correo electronico invalido" }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "DNI de 8 digitos", example: "71234567" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "DNI invalido" }),
    (0, class_validator_1.Matches)(/^\d{8}$/, { message: "DNI invalido. Debe tener 8 digitos" }),
    __metadata("design:type", String)
], UpdateClientDto.prototype, "dni", void 0);
//# sourceMappingURL=clients.dto.js.map