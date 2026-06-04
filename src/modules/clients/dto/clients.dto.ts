import { IsString, IsOptional, IsEmail, MinLength, Matches } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateClientDto {
  @ApiProperty({ description: "Nombre del cliente", example: "Roberto", minLength: 2 })
  @IsString({ message: "Nombre es requerido" })
  @MinLength(2, { message: "Nombre minimo 2 caracteres" })
  firstName!: string

  @ApiProperty({ description: "Apellido del cliente", example: "Gonzales", minLength: 2 })
  @IsString({ message: "Apellido es requerido" })
  @MinLength(2, { message: "Apellido minimo 2 caracteres" })
  lastName!: string

  @ApiPropertyOptional({ description: "Telefono de contacto (9 digitos)", example: "987654321" })
  @IsOptional()
  @IsString({ message: "Telefono invalido" })
  @Matches(/^\+?[\d\s-]{6,15}$/, { message: "Telefono invalido. Formato: +51999888777 o 999888777" })
  phone?: string

  @ApiPropertyOptional({ description: "Correo electronico", example: "cliente@email.com" })
  @IsOptional()
  @IsEmail({}, { message: "Correo electronico invalido" })
  email?: string

  @ApiPropertyOptional({ description: "DNI peruano de 8 digitos", example: "71234567" })
  @IsOptional()
  @IsString({ message: "DNI invalido" })
  @Matches(/^\d{8}$/, { message: "DNI invalido. Debe tener 8 digitos" })
  dni?: string
}

export class UpdateClientDto {
  @ApiPropertyOptional({ description: "Nombre del cliente", example: "Roberto" })
  @IsOptional()
  @IsString({ message: "Nombre invalido" })
  @MinLength(2, { message: "Nombre minimo 2 caracteres" })
  firstName?: string

  @ApiPropertyOptional({ description: "Apellido del cliente", example: "Gonzales" })
  @IsOptional()
  @IsString({ message: "Apellido invalido" })
  @MinLength(2, { message: "Apellido minimo 2 caracteres" })
  lastName?: string

  @ApiPropertyOptional({ description: "Telefono", example: "987654321" })
  @IsOptional()
  @IsString({ message: "Telefono invalido" })
  @Matches(/^\+?[\d\s-]{6,15}$/, { message: "Telefono invalido" })
  phone?: string

  @ApiPropertyOptional({ description: "Correo electronico", example: "cliente@email.com" })
  @IsOptional()
  @IsEmail({}, { message: "Correo electronico invalido" })
  email?: string

  @ApiPropertyOptional({ description: "DNI de 8 digitos", example: "71234567" })
  @IsOptional()
  @IsString({ message: "DNI invalido" })
  @Matches(/^\d{8}$/, { message: "DNI invalido. Debe tener 8 digitos" })
  dni?: string
}
