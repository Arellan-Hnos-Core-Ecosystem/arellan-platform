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
exports.PersonnelDateRangeDto = exports.VerifyAttendanceDto = exports.CheckOutDto = exports.CheckInDto = exports.AttendanceFilterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class AttendanceFilterDto {
    search;
    type;
    from;
    to;
    page;
    limit;
}
exports.AttendanceFilterDto = AttendanceFilterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttendanceFilterDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AttendanceType),
    __metadata("design:type", String)
], AttendanceFilterDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AttendanceFilterDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AttendanceFilterDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AttendanceFilterDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], AttendanceFilterDto.prototype, "limit", void 0);
class CheckInDto {
    personnelId;
    notes;
}
exports.CheckInDto = CheckInDto;
__decorate([
    (0, class_validator_1.IsUUID)("4", { message: "ID de personal invalido" }),
    __metadata("design:type", String)
], CheckInDto.prototype, "personnelId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckInDto.prototype, "notes", void 0);
class CheckOutDto {
    personnelId;
    notes;
}
exports.CheckOutDto = CheckOutDto;
__decorate([
    (0, class_validator_1.IsUUID)("4", { message: "ID de personal invalido" }),
    __metadata("design:type", String)
], CheckOutDto.prototype, "personnelId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckOutDto.prototype, "notes", void 0);
class VerifyAttendanceDto {
    personnelId;
    date;
    verifiedBy;
}
exports.VerifyAttendanceDto = VerifyAttendanceDto;
__decorate([
    (0, class_validator_1.IsUUID)("4", { message: "ID de personal invalido" }),
    __metadata("design:type", String)
], VerifyAttendanceDto.prototype, "personnelId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], VerifyAttendanceDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsUUID)("4", { message: "ID de verificador invalido" }),
    __metadata("design:type", String)
], VerifyAttendanceDto.prototype, "verifiedBy", void 0);
class PersonnelDateRangeDto {
    personnelId;
    from;
    to;
}
exports.PersonnelDateRangeDto = PersonnelDateRangeDto;
__decorate([
    (0, class_validator_1.IsUUID)("4", { message: "ID de personal invalido" }),
    __metadata("design:type", String)
], PersonnelDateRangeDto.prototype, "personnelId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PersonnelDateRangeDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PersonnelDateRangeDto.prototype, "to", void 0);
//# sourceMappingURL=attendance.dto.js.map