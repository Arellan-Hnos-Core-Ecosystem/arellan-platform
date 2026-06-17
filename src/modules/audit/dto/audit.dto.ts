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

  // Paginacion por offset (el panel admin envia ?page=1&pageSize=5; sin estos
  // campos el whitelist con forbidNonWhitelisted responde 400)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number
}
