import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from "class-validator"
import { UserRole } from "@prisma/client"

export class LoginDto {
  @IsEmail({}, { message: "Correo electronico invalido" })
  email: string

  @IsString()
  @MinLength(6, { message: "Contrasena minimo 6 caracteres" })
  password: string
}

export class MfaVerifyDto {
  @IsString()
  token: string

  @IsString()
  sessionToken: string
}

export class RegisterDto {
  @IsEmail({}, { message: "Correo electronico invalido" })
  email: string

  @IsString()
  @MinLength(6, { message: "Contrasena minimo 6 caracteres" })
  password: string

  @IsString()
  @MinLength(2, { message: "Nombre minimo 2 caracteres" })
  name: string

  @IsEnum(UserRole, { message: "Rol invalido" })
  role: UserRole

  @IsOptional()
  @IsString()
  pin?: string
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string

  @IsString()
  @MinLength(6, { message: "Nueva contrasena minimo 6 caracteres" })
  newPassword: string
}

export class ForceLogoutDto {
  @IsString()
  userId: string
}
