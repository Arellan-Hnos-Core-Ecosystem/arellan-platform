import {
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  Max,
  MinLength,
} from "class-validator"

export class CreateVehicleDto {
  @IsString({ message: "Placa es requerida" })
  @MinLength(3, { message: "Placa minimo 3 caracteres" })
  plate!: string

  @IsString({ message: "Marca es requerida" })
  brand!: string

  @IsString({ message: "Modelo es requerido" })
  model!: string

  @IsInt({ message: "Ano debe ser un numero entero" })
  @Min(1900, { message: "Ano no puede ser menor a 1900" })
  @Max(2099, { message: "Ano invalido" })
  year!: number

  @IsString({ message: "Color es requerido" })
  color!: string

  @IsUUID("4", { message: "ID de cliente invalido" })
  clientId!: string
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString({ message: "Placa invalida" })
  @MinLength(3, { message: "Placa minimo 3 caracteres" })
  plate?: string

  @IsOptional()
  @IsString({ message: "Marca invalida" })
  brand?: string

  @IsOptional()
  @IsString({ message: "Modelo invalido" })
  model?: string

  @IsOptional()
  @IsInt({ message: "Ano debe ser un numero entero" })
  @Min(1900, { message: "Ano no puede ser menor a 1900" })
  @Max(2099, { message: "Ano invalido" })
  year?: number

  @IsOptional()
  @IsString({ message: "Color invalido" })
  color?: string

  @IsOptional()
  @IsUUID("4", { message: "ID de cliente invalido" })
  clientId?: string
}
