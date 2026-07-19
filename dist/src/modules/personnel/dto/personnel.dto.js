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
exports.CheckInOutDto = exports.AttendanceQueryDto = exports.AuthorizeVehicleUsageDto = exports.UpdateAccountStatusDto = exports.UpdateRoleDto = exports.UpdatePersonnelDto = exports.CreatePersonnelDto = exports.PersonnelFilterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class PersonnelFilterDto {
    role;
    status;
    search;
    page;
    limit;
    pageSize;
}
exports.PersonnelFilterDto = PersonnelFilterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserRole, { message: "Rol invalido" }),
    __metadata("design:type", String)
], PersonnelFilterDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AccountStatus, { message: "Estado invalido" }),
    __metadata("design:type", String)
], PersonnelFilterDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PersonnelFilterDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PersonnelFilterDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PersonnelFilterDto.prototype, "limit", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PersonnelFilterDto.prototype, "pageSize", void 0);
class CreatePersonnelDto {
    firstName;
    lastName;
    dni;
    email;
    password;
    role;
    position;
    phone;
    emergencyPhone;
    address;
    birthDate;
    nationality;
    contractType;
    department;
    salary;
    salaryType;
    startDate;
    notes;
}
exports.CreatePersonnelDto = CreatePersonnelDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "dni", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.UserRole, { message: "Rol invalido" }),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "emergencyPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "nationality", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ContractType),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "contractType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "department", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    __metadata("design:type", Number)
], CreatePersonnelDto.prototype, "salary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SalaryType),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "salaryType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "notes", void 0);
class UpdatePersonnelDto {
    firstName;
    lastName;
    dni;
    phone;
    emergencyPhone;
    address;
    birthDate;
    nationality;
    contractType;
    position;
    department;
    salary;
    salaryType;
    notes;
}
exports.UpdatePersonnelDto = UpdatePersonnelDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "dni", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "emergencyPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "nationality", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ContractType),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "contractType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "department", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    __metadata("design:type", Number)
], UpdatePersonnelDto.prototype, "salary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SalaryType),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "salaryType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "notes", void 0);
class UpdateRoleDto {
    role;
}
exports.UpdateRoleDto = UpdateRoleDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.UserRole, { message: "Rol invalido" }),
    __metadata("design:type", String)
], UpdateRoleDto.prototype, "role", void 0);
class UpdateAccountStatusDto {
    status;
}
exports.UpdateAccountStatusDto = UpdateAccountStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AccountStatus, { message: "Estado invalido" }),
    __metadata("design:type", String)
], UpdateAccountStatusDto.prototype, "status", void 0);
class AuthorizeVehicleUsageDto {
    personnelId;
    vehicleId;
    purpose;
    destination;
    odometerOut;
    expectedReturn;
    notes;
}
exports.AuthorizeVehicleUsageDto = AuthorizeVehicleUsageDto;
__decorate([
    (0, class_validator_1.IsUUID)("4", { message: "ID de personal invalido" }),
    __metadata("design:type", String)
], AuthorizeVehicleUsageDto.prototype, "personnelId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)("4", { message: "ID de vehiculo invalido" }),
    __metadata("design:type", String)
], AuthorizeVehicleUsageDto.prototype, "vehicleId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthorizeVehicleUsageDto.prototype, "purpose", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthorizeVehicleUsageDto.prototype, "destination", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AuthorizeVehicleUsageDto.prototype, "odometerOut", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AuthorizeVehicleUsageDto.prototype, "expectedReturn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthorizeVehicleUsageDto.prototype, "notes", void 0);
class AttendanceQueryDto {
    month;
    year;
}
exports.AttendanceQueryDto = AttendanceQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], AttendanceQueryDto.prototype, "month", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2000),
    (0, class_validator_1.Max)(2100),
    __metadata("design:type", Number)
], AttendanceQueryDto.prototype, "year", void 0);
class CheckInOutDto {
    notes;
}
exports.CheckInOutDto = CheckInOutDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckInOutDto.prototype, "notes", void 0);
//# sourceMappingURL=personnel.dto.js.map