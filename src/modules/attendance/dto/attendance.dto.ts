import { IsOptional, IsString, IsInt, Min, Max, IsDateString, IsUUID, IsEnum } from "class-validator"
import { Type } from "class-transformer"
import { AttendanceType } from "@prisma/client"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class AttendanceFilterDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string
  @ApiPropertyOptional({ enum: AttendanceType }) @IsOptional() @IsEnum(AttendanceType) type?: AttendanceType
  @ApiPropertyOptional() @IsOptional() @IsDateString() from?: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() to?: string
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number
  @ApiPropertyOptional({ example: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number
}

export class CheckInDto {
  @ApiProperty({ description: "ID del personal (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID("4", { message: "ID de personal invalido" }) personnelId: string
  @ApiPropertyOptional({ description: "Notas del registro", example: "Llegada puntual" })
  @IsOptional() @IsString() notes?: string
}

export class CheckOutDto {
  @ApiProperty({ description: "ID del personal (UUID v4)" })
  @IsUUID("4", { message: "ID de personal invalido" }) personnelId: string
  @ApiPropertyOptional({ description: "Notas de salida" })
  @IsOptional() @IsString() notes?: string
}

export class VerifyAttendanceDto {
  @ApiProperty({ description: "ID del personal a verificar (UUID v4)" })
  @IsUUID("4", { message: "ID de personal invalido" }) personnelId: string
  @ApiProperty({ description: "Fecha a verificar (ISO)", example: "2026-06-03" })
  @IsDateString() date: string
  @ApiProperty({ description: "ID del verificador (UUID v4)" })
  @IsUUID("4", { message: "ID de verificador invalido" }) verifiedBy: string
}
