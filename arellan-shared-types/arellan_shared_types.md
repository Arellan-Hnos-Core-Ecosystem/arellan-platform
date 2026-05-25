# arellan-shared-types — Tipos TypeScript Compartidos

Tipos, interfaces, enums y schemas Zod compartidos entre el backend (`arellan-platform`) y todos los frontends del ecosistema Arellan Hnos. Garantizan type-safety end-to-end.

## Propósito

- Única fuente de verdad para tipos del dominio
- Eliminar duplicación de tipos entre backend y frontends
- Validación en tiempo de compilación en toda la cadena

## Enums del Dominio

```typescript
// Roles de usuario
export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  FINANCE = 'FINANCE',
  MECHANIC = 'MECHANIC',
  TRAINEE = 'TRAINEE',
  CLIENT = 'CLIENT',
}

// Estados de Orden de Trabajo
export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  DIAGNOSING = 'DIAGNOSING',
  QUOTE_SENT = 'QUOTE_SENT',
  QUOTE_APPROVED = 'QUOTE_APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  QA = 'QA',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// Estados de solicitud de gasto
export enum ExpenseStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  VERIFIED_WITH_INVOICE = 'VERIFIED_WITH_INVOICE',
}

// Métodos de pago
export enum PaymentMethod {
  DYNAMIC_QR = 'DYNAMIC_QR',
  POS_CARD = 'POS_CARD',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  YAPE_BUSINESS = 'YAPE_BUSINESS',  // Fase 3
}

// Estados de vehículo en taller
export enum VehicleInTallerStatus {
  AUTHORIZED_USE = 'AUTHORIZED_USE',
  ROAD_TEST = 'ROAD_TEST',
  ALERT_JOYRIDE = 'ALERT_JOYRIDE',
  RETURNED = 'RETURNED',
}

// Categorías de gasto
export enum ExpenseCategory {
  LOCAL_PARTS = 'LOCAL_PARTS',
  IMPORT_PARTS = 'IMPORT_PARTS',
  TOOLS = 'TOOLS',
  SERVICES = 'SERVICES',
  UTILITIES = 'UTILITIES',
  OTHER = 'OTHER',
}
```

## Interfaces Principales

```typescript
// Usuario autenticado (payload del JWT + datos del request)
export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  iat: number
  exp: number
}

// Orden de Trabajo
export interface WorkOrder {
  id: string
  number: string          // 'OT-2026-001'
  vehicleId: string
  clientId: string
  mechanicId: string
  status: OrderStatus
  description: string
  diagnosis?: string
  laborCost?: number
  partsCost?: number
  totalCost?: number
  receivedAt: Date
  estimatedDelivery?: Date
  deliveredAt?: Date
  photos: WorkOrderPhoto[]
  parts: WorkOrderPart[]
}

// Ítem de inventario
export interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  stock: number
  minStock: number
  unitPrice: number
  supplier?: string
  lastMovement?: Date
}

// Solicitud de gasto
export interface ExpenseRequest {
  id: string
  requesterId: string
  requesterName: string
  amount: number
  currency: 'PEN' | 'USD'
  category: ExpenseCategory
  description: string
  supplierId?: string
  invoiceUrl?: string
  status: ExpenseStatus
  approvalLevel: 'NONE' | 'ADMIN' | 'OWNER'
  approverId?: string
  approvalReason?: string
  createdAt: Date
  approvedAt?: Date
}
```

## Schemas Zod (Validación Compartida)

```typescript
import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  totpCode: z.string().length(6, 'Código de 6 dígitos').optional(),
})

export const CreateOrderSchema = z.object({
  vehiclePlate: z.string().regex(/^[A-Z]{3}-\d{3}$/, 'Formato de placa inválido (ABC-123)'),
  clientId: z.string().uuid(),
  mechanicId: z.string().uuid(),
  description: z.string().min(10, 'Descripción demasiado corta').max(500),
})

export const CreateExpenseSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  currency: z.enum(['PEN', 'USD']),
  category: z.nativeEnum(ExpenseCategory),
  description: z.string().min(5).max(255),
  supplierId: z.string().uuid().optional(),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>
```

## Paginación y Respuestas API

```typescript
// Respuesta paginada estándar
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// Respuesta de error estándar
export interface ApiError {
  statusCode: number
  error: string
  message: string
  timestamp: string
  path: string
  requestId: string
}
```

## Instalación

```bash
# Desde los repos que consumen estos tipos
npm install @arellan/types --registry=https://npm.pkg.github.com
```
