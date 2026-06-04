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
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: "Correo electronico invalido" }),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
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
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MfaVerifyDto.prototype, "token", void 0);
__decorate([
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
    (0, class_validator_1.IsEmail)({}, { message: "Correo electronico invalido" }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: "Contrasena minimo 6 caracteres" }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: "Nombre minimo 2 caracteres" }),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.UserRole, { message: "Rol invalido" }),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
__decorate([
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
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: "Nueva contrasena minimo 6 caracteres" }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class ForceLogoutDto {
    userId;
}
exports.ForceLogoutDto = ForceLogoutDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ForceLogoutDto.prototype, "userId", void 0);
class MechanicLoginDto {
    pin;
}
exports.MechanicLoginDto = MechanicLoginDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: "PIN debe tener 6 digitos" }),
    __metadata("design:type", String)
], MechanicLoginDto.prototype, "pin", void 0);
//# sourceMappingURL=auth.dto.js.map