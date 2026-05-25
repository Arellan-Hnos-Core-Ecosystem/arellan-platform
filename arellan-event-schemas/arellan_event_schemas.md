# arellan-event-schemas — Contratos de Eventos del Sistema

Esquemas y tipos TypeScript para todos los eventos del dominio Arellan Hnos. Fuente de verdad única para la comunicación entre módulos del backend y entre el backend y los frontends (via WebSocket/polling).

## Propósito

- Garantizar consistencia de payload entre emisores y consumidores de eventos
- Documentar todos los eventos del sistema en un solo lugar
- Facilitar el tipado estricto en workers BullMQ y handlers de WebSocket
- Base para la futura migración a un message broker (si se escala a microservicios)

## Eventos por Dominio

### Auth Events
```typescript
export interface UserLoggedInEvent {
  type: 'USER_LOGGED_IN'
  userId: string
  role: UserRole
  ip: string
  userAgent: string
  isUnusualDevice: boolean  // true → dispara alerta a owner
  timestamp: Date
}

export interface UserLoggedOutEvent {
  type: 'USER_LOGGED_OUT'
  userId: string
  reason: 'MANUAL' | 'TIMEOUT' | 'FORCED_BY_OWNER'
  timestamp: Date
}

export interface LoginFailedEvent {
  type: 'LOGIN_FAILED'
  email: string
  ip: string
  attemptCount: number
  timestamp: Date
}
```

### Finance Events
```typescript
export interface ExpenseCreatedEvent {
  type: 'EXPENSE_CREATED'
  expenseId: string
  requesterId: string
  amount: number
  currency: 'PEN' | 'USD'
  category: ExpenseCategory
  supplierId?: string
  requiresApproval: boolean
  approvalLevel: 'NONE' | 'ADMIN' | 'OWNER'
  timestamp: Date
}

export interface ExpenseApprovedEvent {
  type: 'EXPENSE_APPROVED' | 'EXPENSE_REJECTED'
  expenseId: string
  approverId: string
  approverRole: 'OWNER' | 'ADMIN'
  reason?: string  // Obligatorio en rechazo
  timestamp: Date
}

export interface CashboxDiscrepancyEvent {
  type: 'CASHBOX_DISCREPANCY'
  sessionId: string
  expectedAmount: number
  actualAmount: number
  difference: number
  reportedBy: string
  timestamp: Date
}
```

### Orders Events
```typescript
export interface OrderStatusChangedEvent {
  type: 'ORDER_STATUS_CHANGED'
  orderId: string
  vehiclePlate: string
  previousStatus: OrderStatus
  newStatus: OrderStatus
  changedBy: string
  timestamp: Date
}

export interface OrderReadyEvent {
  type: 'ORDER_READY_FOR_PICKUP'
  orderId: string
  clientId: string
  vehiclePlate: string
  totalAmount: number
  timestamp: Date
}
```

### Inventory Events
```typescript
export interface StockBelowMinimumEvent {
  type: 'STOCK_BELOW_MINIMUM'
  itemId: string
  itemName: string
  currentStock: number
  minimumStock: number
  timestamp: Date
}

export interface InventoryMovementEvent {
  type: 'INVENTORY_MOVEMENT'
  itemId: string
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  orderId?: string  // Obligatorio para movimientos OUT
  authorizedBy: string
  timestamp: Date
}
```

### Vehicle Events
```typescript
export interface VehicleExitEvent {
  type: 'VEHICLE_EXIT'
  vehicleId: string
  plate: string
  authorizedBy: string
  assignedTo: string
  estimatedReturn: Date
  odometer: number
  status: 'AUTHORIZED' | 'UNAUTHORIZED'
  timestamp: Date
}

export interface VehicleGeofenceViolationEvent {
  type: 'VEHICLE_GEOFENCE_VIOLATION'
  vehicleId: string
  plate: string
  currentLat: number
  currentLon: number
  assignedEmployeeId: string
  timestamp: Date
}
```

## Uso en Workers BullMQ

```typescript
// Enqueue de un evento
await notificationsQueue.add(
  'expense-approval-needed',
  {
    type: 'EXPENSE_CREATED',
    expenseId: expense.id,
    amount: expense.amount,
    requiresApproval: true,
    approvalLevel: 'OWNER',
  } satisfies ExpenseCreatedEvent,
  { priority: expense.amount > 500 ? 1 : 5 }
)
```

## Uso en WebSocket (Tiempo Real)

```typescript
// Emisión desde el backend
this.wsGateway.emit('order:status_changed', {
  type: 'ORDER_STATUS_CHANGED',
  orderId: order.id,
  vehiclePlate: order.vehicle.plate,
  newStatus: order.status,
} satisfies OrderStatusChangedEvent)

// Escucha desde arellan-mobile-app
socket.on('order:status_changed', (event: OrderStatusChangedEvent) => {
  queryClient.invalidateQueries(['orders', event.orderId])
})
```
