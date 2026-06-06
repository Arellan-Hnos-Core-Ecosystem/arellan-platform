import {
  IsNumber, IsString, IsEnum, IsOptional, IsUrl, IsIn, Min, Max, MinLength, MaxLength, ValidateIf, IsPositive,
} from "class-validator"
import { Type } from "class-transformer"
import { TransactionType, PaymentMethod, ExpenseCategory, Currency } from "@prisma/client"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class OpenCashboxDto {
  @ApiProperty({ description: "Saldo inicial en efectivo al abrir caja (S/.)", example: 500.0, minimum: 0 })
  @IsNumber({}, { message: "El saldo inicial debe ser un numero" })
  @Min(0, { message: "El saldo inicial no puede ser negativo" })
  openingBalance: number
}

export class CloseCashboxDto {
  @ApiProperty({ description: "Efectivo contado fisicamente al cierre (S/.)", example: 2850.5, minimum: 0 })
  @IsNumber({}, { message: "El efectivo real debe ser un numero" })
  @Min(0, { message: "El efectivo real no puede ser negativo" })
  actualCash: number

  @ApiPropertyOptional({ description: "Notas u observaciones del cierre de caja", example: "Cierre de turno manana - sin novedades" })
  @IsOptional()
  @IsString({ message: "Las notas deben ser texto" })
  notes?: string
}

export class CreateTransactionDto {
  @ApiProperty({ description: "Tipo de transaccion", enum: TransactionType, example: TransactionType.PAYMENT })
  @IsEnum(TransactionType, { message: "Tipo de transaccion invalido" })
  type: TransactionType

  @ApiProperty({ description: "Monto de la transaccion en Soles", example: 150.0 })
  @IsNumber({}, { message: "El monto debe ser un numero" })
  @IsPositive({ message: "El monto debe ser positivo" })
  amount: number

  @ApiProperty({ description: "Metodo de pago utilizado", enum: PaymentMethod, example: PaymentMethod.YAPE })
  @IsEnum(PaymentMethod, { message: "Metodo de pago invalido" })
  paymentMethod: PaymentMethod

  @ApiPropertyOptional({ description: "ID de la orden de trabajo asociada (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsString({ message: "El orderId debe ser texto" })
  orderId?: string

  @ApiPropertyOptional({ description: "Descripcion o concepto del movimiento", example: "Pago de OT-2026-0001 - Toyota Hilux ABC-123" })
  @IsOptional()
  @IsString({ message: "La descripcion debe ser texto" })
  description?: string
}

export class CreateExpenseDto {
  @ApiProperty({ description: "Monto del gasto en Soles (max S/ 100,000)", example: 350.0, minimum: 0.01, maximum: 100000 })
  @IsNumber({}, { message: "El monto debe ser un numero" })
  @IsPositive({ message: "El monto debe ser positivo" })
  @Max(100000, { message: "El monto maximo es 100,000" })
  amount: number

  @ApiPropertyOptional({ description: "Moneda del gasto", enum: Currency, example: Currency.PEN, default: Currency.PEN })
  @IsOptional()
  @IsEnum(Currency, { message: "Moneda invalida" })
  currency?: Currency = Currency.PEN

  @ApiProperty({ description: "Categoria del gasto", enum: ExpenseCategory, example: ExpenseCategory.PARTS })
  @IsEnum(ExpenseCategory, { message: "Categoria invalida" })
  category: ExpenseCategory

  @ApiProperty({ description: "Descripcion detallada del gasto (5-500 caracteres)", example: "Compra de filtros de aceite Toyota para stock de inventario", minLength: 5, maxLength: 500 })
  @IsString({ message: "La descripcion debe ser texto" })
  @MinLength(5, { message: "La descripcion debe tener al menos 5 caracteres" })
  @MaxLength(500, { message: "La descripcion no puede exceder 500 caracteres" })
  description: string

  @ApiPropertyOptional({ description: "URL de la factura o comprobante escaneado", example: "https://storage.arellan.pe/facturas/exp-001.pdf" })
  @IsOptional()
  @IsUrl({}, { message: "La URL de la factura no es valida" })
  invoiceUrl?: string
}

export class ApproveExpenseDto {
  @ApiProperty({ description: "Decision sobre el gasto", enum: ["APPROVED", "REJECTED"], example: "APPROVED" })
  @IsIn(["APPROVED", "REJECTED"], { message: "La decision debe ser APPROVED o REJECTED" })
  decision: "APPROVED" | "REJECTED"

  @ApiPropertyOptional({ description: "Motivo de rechazo (requerido si decision=REJECTED, min 5 caracteres)", example: "Gasto no justificado - falta factura del proveedor" })
  @ValidateIf((o: ApproveExpenseDto) => o.decision === "REJECTED")
  @IsString({ message: "El motivo de rechazo es requerido" })
  @MinLength(5, { message: "El motivo de rechazo debe tener al menos 5 caracteres" })
  rejectionReason?: string
}

export class ExpenseFiltersDto {
  @ApiPropertyOptional({ description: "Filtrar por estado del gasto", example: "PENDING_APPROVAL" })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ description: "Filtrar por categoria", example: "PARTS" })
  @IsOptional()
  @IsString()
  category?: string

  @ApiPropertyOptional({ description: "Filtrar por ID del solicitante", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsString()
  requesterId?: string

  @ApiPropertyOptional({ description: "Fecha inicio del rango (ISO 8601)", example: "2026-06-01T00:00:00.000Z" })
  @IsOptional()
  @IsString()
  startDate?: string

  @ApiPropertyOptional({ description: "Fecha fin del rango (ISO 8601)", example: "2026-06-30T23:59:59.000Z" })
  @IsOptional()
  @IsString()
  endDate?: string

  @ApiPropertyOptional({ description: "Numero de pagina (min 1)", example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "page debe ser numero" })
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: "Resultados por pagina (1-100)", example: 20, minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "size debe ser numero" })
  @Min(1)
  @Max(100)
  size?: number = 20
}
