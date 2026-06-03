import {
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsUrl,
  IsIn,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateIf,
  IsPositive,
} from "class-validator"
import {
  TransactionType,
  PaymentMethod,
  ExpenseCategory,
  Currency,
} from "@prisma/client"

export class OpenCashboxDto {
  @IsNumber({}, { message: "El saldo inicial debe ser un numero" })
  @Min(0, { message: "El saldo inicial no puede ser negativo" })
  openingBalance: number
}

export class CloseCashboxDto {
  @IsNumber({}, { message: "El efectivo real debe ser un numero" })
  @Min(0, { message: "El efectivo real no puede ser negativo" })
  actualCash: number

  @IsOptional()
  @IsString({ message: "Las notas deben ser texto" })
  notes?: string
}

export class CreateTransactionDto {
  @IsEnum(TransactionType, { message: "Tipo de transaccion invalido" })
  type: TransactionType

  @IsNumber({}, { message: "El monto debe ser un numero" })
  @IsPositive({ message: "El monto debe ser positivo" })
  amount: number

  @IsEnum(PaymentMethod, { message: "Metodo de pago invalido" })
  paymentMethod: PaymentMethod

  @IsOptional()
  @IsString({ message: "El orderId debe ser texto" })
  orderId?: string

  @IsOptional()
  @IsString({ message: "La descripcion debe ser texto" })
  description?: string
}

export class CreateExpenseDto {
  @IsNumber({}, { message: "El monto debe ser un numero" })
  @IsPositive({ message: "El monto debe ser positivo" })
  @Max(100000, { message: "El monto maximo es 100,000" })
  amount: number

  @IsOptional()
  @IsEnum(Currency, { message: "Moneda invalida" })
  currency?: Currency = Currency.PEN

  @IsEnum(ExpenseCategory, { message: "Categoria invalida" })
  category: ExpenseCategory

  @IsString({ message: "La descripcion debe ser texto" })
  @MinLength(5, { message: "La descripcion debe tener al menos 5 caracteres" })
  @MaxLength(500, { message: "La descripcion no puede exceder 500 caracteres" })
  description: string

  @IsOptional()
  @IsUrl({}, { message: "La URL de la factura no es valida" })
  invoiceUrl?: string
}

export class ApproveExpenseDto {
  @IsIn(["APPROVED", "REJECTED"], {
    message: "La decision debe ser APPROVED o REJECTED",
  })
  decision: "APPROVED" | "REJECTED"

  @ValidateIf((o: ApproveExpenseDto) => o.decision === "REJECTED")
  @IsString({ message: "El motivo de rechazo es requerido" })
  @MinLength(5, {
    message: "El motivo de rechazo debe tener al menos 5 caracteres",
  })
  rejectionReason?: string
}

export class ExpenseFiltersDto {
  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  requesterId?: string

  @IsOptional()
  @IsString()
  startDate?: string

  @IsOptional()
  @IsString()
  endDate?: string

  @IsOptional()
  @IsNumber({}, { message: "page debe ser numero" })
  @Min(1)
  page?: number = 1

  @IsOptional()
  @IsNumber({}, { message: "size debe ser numero" })
  @Min(1)
  @Max(100)
  size?: number = 20
}
