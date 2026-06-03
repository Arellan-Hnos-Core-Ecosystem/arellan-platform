import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
} from "class-validator"

export class SettingFilterDto {
  @IsOptional()
  @IsString()
  category?: string
}

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  key: string

  @IsString()
  @IsNotEmpty()
  value: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}

export class UpdateSettingDto {
  @IsString()
  @IsNotEmpty()
  value: string

  @IsOptional()
  @IsUUID("4")
  userId?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}
