import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from "class-validator"
import { UserRole } from "@prisma/client"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class LoginDto {
  @ApiProperty({
    description: "Correo electronico corporativo del usuario",
    example: "edgar@arellanautos.pe",
  })
  @IsEmail({}, { message: "Correo electronico invalido" })
  email: string

  @ApiProperty({
    description: "Contrasena de acceso (minimo 6 caracteres)",
    example: "Arellan2026!",
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: "Contrasena minimo 6 caracteres" })
  password: string
}

export class MfaVerifyDto {
  @ApiProperty({
    description: "Codigo TOTP de 6 digitos generado por la app autenticadora",
    example: "482951",
  })
  @IsString()
  token: string

  @ApiProperty({
    description: "Token de sesion temporal obtenido en la respuesta de login cuando MFA esta activo",
    example: "eyJhbGciOiJIUzI1NiIs...",
  })
  @IsString()
  sessionToken: string
}

export class RegisterDto {
  @ApiProperty({
    description: "Correo electronico unico para la nueva cuenta",
    example: "nuevo.mecanico@arellanautos.pe",
  })
  @IsEmail({}, { message: "Correo electronico invalido" })
  email: string

  @ApiProperty({
    description: "Contrasena segura (minimo 6 caracteres)",
    example: "Taller2026!",
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: "Contrasena minimo 6 caracteres" })
  password: string

  @ApiProperty({
    description: "Nombre completo del nuevo usuario",
    example: "Ricardo Lopez",
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: "Nombre minimo 2 caracteres" })
  name: string

  @ApiProperty({
    description: "Rol asignado: OWNER, ADMIN, FINANCE, MECHANIC, TRAINEE",
    enum: UserRole,
    example: UserRole.MECHANIC,
  })
  @IsEnum(UserRole, { message: "Rol invalido" })
  role: UserRole

  @ApiPropertyOptional({
    description: "PIN de 6 digitos para acceso de mecanicos desde tablet",
    example: "147258",
  })
  @IsOptional()
  @IsString()
  pin?: string
}

export class ChangePasswordDto {
  @ApiProperty({
    description: "Contrasena actual para verificacion",
    example: "Arellan2026!",
  })
  @IsString()
  currentPassword: string

  @ApiProperty({
    description: "Nueva contrasena (minimo 6 caracteres, distinta a la actual)",
    example: "NuevoTaller2026!",
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: "Nueva contrasena minimo 6 caracteres" })
  newPassword: string
}

export class ForceLogoutDto {
  @ApiProperty({
    description: "ID del usuario al que se le forzara el cierre de sesion",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsString()
  userId: string
}

export class MechanicLoginDto {
  @ApiProperty({
    description: "PIN numerico de 6 digitos asignado al mecanico o practicante",
    example: "147258",
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @MinLength(6, { message: "PIN debe tener 6 digitos" })
  pin: string
}
