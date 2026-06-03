import { IsOptional, IsString, IsInt, IsDateString, Min } from "class-validator"
import { Type } from "class-transformer"

export class AuditFilterDto {
  @IsOptional()
  @IsString()
  userId?: string

  @IsOptional()
  @IsString()
  action?: string

  @IsOptional()
  @IsString()
  entity?: string

  @IsOptional()
  @IsDateString()
  from?: string

  @IsOptional()
  @IsDateString()
  to?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number

  @IsOptional()
  @IsString()
  cursor?: string
}
