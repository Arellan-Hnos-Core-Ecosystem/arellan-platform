import { IsString, IsInt, IsOptional, IsUUID, Min, Max, MinLength } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateVehicleDto {
  @ApiProperty({ description: "Placa del vehiculo (formato peruano)", example: "ABC-123", minLength: 3 })
  @IsString({ message: "Placa es requerida" })
  @MinLength(3, { message: "Placa minimo 3 caracteres" })
  plate!: string

  @ApiProperty({ description: "Marca del vehiculo", example: "Toyota" })
  @IsString({ message: "Marca es requerida" })
  brand!: string

  @ApiProperty({ description: "Modelo del vehiculo", example: "Hilux" })
  @IsString({ message: "Modelo es requerido" })
  model!: string

  @ApiProperty({ description: "Ano de fabricacion", example: 2022, minimum: 1900, maximum: 2099 })
  @IsInt({ message: "Ano debe ser un numero entero" })
  @Min(1900, { message: "Ano no puede ser menor a 1900" })
  @Max(2099, { message: "Ano invalido" })
  year!: number

  @ApiProperty({ description: "Color del vehiculo", example: "Blanco" })
  @IsString({ message: "Color es requerido" })
  color!: string

  @ApiProperty({ description: "ID del cliente propietario (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID("4", { message: "ID de cliente invalido" })
  clientId!: string
}

export class UpdateVehicleDto {
  @ApiPropertyOptional({ description: "Nueva placa", example: "XYZ-999" })
  @IsOptional()
  @IsString({ message: "Placa invalida" })
  @MinLength(3, { message: "Placa minimo 3 caracteres" })
  plate?: string

  @ApiPropertyOptional({ description: "Marca", example: "Nissan" })
  @IsOptional()
  @IsString({ message: "Marca invalida" })
  brand?: string

  @ApiPropertyOptional({ description: "Modelo", example: "Frontier" })
  @IsOptional()
  @IsString({ message: "Modelo invalido" })
  model?: string

  @ApiPropertyOptional({ description: "Ano de fabricacion", example: 2021 })
  @IsOptional()
  @IsInt({ message: "Ano debe ser un numero entero" })
  @Min(1900, { message: "Ano no puede ser menor a 1900" })
  @Max(2099, { message: "Ano invalido" })
  year?: number

  @ApiPropertyOptional({ description: "Color", example: "Negro" })
  @IsOptional()
  @IsString({ message: "Color invalido" })
  color?: string

  @ApiPropertyOptional({ description: "ID del nuevo propietario", example: "660e8400-e29b-41d4-a716-446655440001" })
  @IsOptional()
  @IsUUID("4", { message: "ID de cliente invalido" })
  clientId?: string
}
