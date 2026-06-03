import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  Matches,
} from "class-validator"

export class CreateClientDto {
  @IsString({ message: "Nombre es requerido" })
  @MinLength(2, { message: "Nombre minimo 2 caracteres" })
  firstName!: string

  @IsString({ message: "Apellido es requerido" })
  @MinLength(2, { message: "Apellido minimo 2 caracteres" })
  lastName!: string

  @IsOptional()
  @IsString({ message: "Telefono invalido" })
  @Matches(/^\+?[\d\s-]{6,15}$/, {
    message: "Telefono invalido. Formato: +51999888777 o 999888777",
  })
  phone?: string

  @IsOptional()
  @IsEmail({}, { message: "Correo electronico invalido" })
  email?: string

  @IsOptional()
  @IsString({ message: "DNI invalido" })
  @Matches(/^\d{8}$/, {
    message: "DNI invalido. Debe tener 8 digitos",
  })
  dni?: string
}

export class UpdateClientDto {
  @IsOptional()
  @IsString({ message: "Nombre invalido" })
  @MinLength(2, { message: "Nombre minimo 2 caracteres" })
  firstName?: string

  @IsOptional()
  @IsString({ message: "Apellido invalido" })
  @MinLength(2, { message: "Apellido minimo 2 caracteres" })
  lastName?: string

  @IsOptional()
  @IsString({ message: "Telefono invalido" })
  @Matches(/^\+?[\d\s-]{6,15}$/, {
    message: "Telefono invalido. Formato: +51999888777 o 999888777",
  })
  phone?: string

  @IsOptional()
  @IsEmail({}, { message: "Correo electronico invalido" })
  email?: string

  @IsOptional()
  @IsString({ message: "DNI invalido" })
  @Matches(/^\d{8}$/, {
    message: "DNI invalido. Debe tener 8 digitos",
  })
  dni?: string
}
