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
exports.MechanicLoginDto = exports.ForceLogoutDto = exports.ChangePasswordDto = exports.RegisterDto = exports.MfaVerifyDto = exports.LoginDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Correo electronico corporativo del usuario",
        example: "edgar@arellanautos.pe",
    }),
    (0, class_validator_1.IsEmail)({}, { message: "Correo electronico invalido" }),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Contrasena de acceso (minimo 6 caracteres)",
        example: "Arellan2026!",
        minLength: 6,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: "Contrasena minimo 6 caracteres" }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class MfaVerifyDto {
    token;
    sessionToken;
}
exports.MfaVerifyDto = MfaVerifyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Codigo TOTP de 6 digitos generado por la app autenticadora",
        example: "482951",
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MfaVerifyDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Token de sesion temporal obtenido en la respuesta de login cuando MFA esta activo",
        example: "eyJhbGciOiJIUzI1NiIs...",
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MfaVerifyDto.prototype, "sessionToken", void 0);
class RegisterDto {
    email;
    password;
    name;
    role;
    pin;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Correo electronico unico para la nueva cuenta",
        example: "nuevo.mecanico@arellanautos.pe",
    }),
    (0, class_validator_1.IsEmail)({}, { message: "Correo electronico invalido" }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Contrasena segura (minimo 6 caracteres)",
        example: "Taller2026!",
        minLength: 6,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: "Contrasena minimo 6 caracteres" }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Nombre completo del nuevo usuario",
        example: "Ricardo Lopez",
        minLength: 2,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: "Nombre minimo 2 caracteres" }),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Rol asignado: OWNER, ADMIN, FINANCE, MECHANIC, TRAINEE",
        enum: client_1.UserRole,
        example: client_1.UserRole.MECHANIC,
    }),
    (0, class_validator_1.IsEnum)(client_1.UserRole, { message: "Rol invalido" }),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "PIN de 6 digitos para acceso de mecanicos desde tablet",
        example: "147258",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "pin", void 0);
class ChangePasswordDto {
    currentPassword;
    newPassword;
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Contrasena actual para verificacion",
        example: "Arellan2026!",
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Nueva contrasena (minimo 6 caracteres, distinta a la actual)",
        example: "NuevoTaller2026!",
        minLength: 6,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: "Nueva contrasena minimo 6 caracteres" }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class ForceLogoutDto {
    userId;
}
exports.ForceLogoutDto = ForceLogoutDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ID del usuario al que se le forzara el cierre de sesion",
        example: "550e8400-e29b-41d4-a716-446655440000",
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ForceLogoutDto.prototype, "userId", void 0);
class MechanicLoginDto {
    pin;
}
exports.MechanicLoginDto = MechanicLoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "PIN numerico de 6 digitos asignado al mecanico o practicante",
        example: "147258",
        minLength: 6,
        maxLength: 6,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: "PIN debe tener 6 digitos" }),
    __metadata("design:type", String)
], MechanicLoginDto.prototype, "pin", void 0);
//# sourceMappingURL=auth.dto.js.map