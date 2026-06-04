import { IsString, IsOptional, IsBoolean, IsNotEmpty } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class SettingFilterDto {
  @ApiPropertyOptional({ description: "Filtrar por categoria", example: "BUSINESS" })
  @IsOptional() @IsString() category?: string
}

export class CreateSettingDto {
  @ApiProperty({ description: "Clave unica de configuracion", example: "shop_name" })
  @IsString() @IsNotEmpty() key: string
  @ApiProperty({ description: "Valor de la configuracion", example: "Clinica Automotriz Arellan Hnos" })
  @IsString() @IsNotEmpty() value: string
  @ApiPropertyOptional({ description: "Categoria: GENERAL, BUSINESS, NOTIFICATIONS", example: "GENERAL" })
  @IsOptional() @IsString() category?: string
  @ApiPropertyOptional({ description: "Si es accesible sin autenticacion", example: false })
  @IsOptional() @IsBoolean() isPublic?: boolean
}

export class UpdateSettingDto {
  @ApiProperty({ description: "Nuevo valor de la configuracion", example: "Nuevo valor" })
  @IsString() @IsNotEmpty() value: string
  @ApiPropertyOptional({ description: "ID del usuario que actualiza" }) @IsOptional() @IsString() userId?: string
  @ApiPropertyOptional({ description: "Nueva categoria" }) @IsOptional() @IsString() category?: string
  @ApiPropertyOptional({ description: "Cambiar visibilidad publica" }) @IsOptional() @IsBoolean() isPublic?: boolean
}
