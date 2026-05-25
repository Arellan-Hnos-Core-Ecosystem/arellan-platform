# arellan-sdk-core — SDK Base para Consumo del API

Cliente HTTP tipado para consumir `arellan-platform` desde los frontends del ecosistema. Maneja autenticación, refresh automático de tokens, manejo de errores y retry logic.

## Propósito

Centralizar la lógica de comunicación con el API para que los frontends no repitan código de fetch, manejo de tokens ni error handling.

## Instalación

```bash
npm install @arellan/sdk --registry=https://npm.pkg.github.com
```

## Configuración

```typescript
import { ArellanSDK } from '@arellan/sdk'

export const api = new ArellanSDK({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  onTokenExpired: () => {
    // Redirigir al login cuando el refresh falla
    window.location.href = '/auth/login'
  },
  onUnauthorized: () => {
    toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
  },
})
```

## Módulos del SDK

```typescript
// Auth
await api.auth.login({ email, password, totpCode })
await api.auth.logout()
await api.auth.refreshToken()
await api.auth.getMe()

// Órdenes de trabajo
await api.orders.getAll({ page: 1, limit: 20, status: 'IN_PROGRESS' })
await api.orders.getById(orderId)
await api.orders.create(data)
await api.orders.updateStatus(orderId, 'QA')
await api.orders.addPhoto(orderId, file)

// Inventario
await api.inventory.getAll({ lowStock: true })
await api.inventory.requestPart({ itemId, quantity, orderId })
await api.inventory.adjustStock(itemId, { quantity, justification })

// Finanzas
await api.finance.openCashbox({ openingBalance })
await api.finance.closeCashbox({ actualCash })
await api.finance.createExpense(data)
await api.finance.approveExpense(expenseId)
await api.finance.rejectExpense(expenseId, reason)
await api.finance.getDailySummary()

// Vehículos
await api.vehicles.getAll()
await api.vehicles.getById(vehicleId)
await api.vehicles.checkIn(vehicleId, { authorizedTo, reason, estimatedReturn })

// Personal
await api.personnel.getAll()
await api.personnel.getAttendance(employeeId, { startDate, endDate })
await api.personnel.deactivate(employeeId)

// Auditoría (solo OWNER)
await api.audit.getLogs({ page: 1, limit: 50, userId, action, startDate })
```

## Manejo de Tokens (Auto-refresh)

```typescript
// El SDK gestiona automáticamente la renovación del access token
// antes de que expire, sin que el frontend tenga que manejarlo

class ArellanSDK {
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      return await this.http.request(config)
    } catch (error) {
      if (error.response?.status === 401) {
        // Intentar renovar el token
        const refreshed = await this.auth.refreshToken()
        if (refreshed) {
          // Reintentar el request original con el nuevo token
          return await this.http.request(config)
        }
        this.onUnauthorized()
      }
      throw error
    }
  }
}
```

## Manejo de Errores

```typescript
import { ArellanApiError, isArellanError } from '@arellan/sdk'

try {
  await api.inventory.requestPart({ itemId, quantity, orderId })
} catch (error) {
  if (isArellanError(error)) {
    switch (error.code) {
      case 'INVENTORY_NO_ACTIVE_ORDER':
        toast.error('No puedes solicitar repuestos sin una OT activa')
        break
      case 'STOCK_INSUFFICIENT':
        toast.error(`Stock insuficiente. Disponible: ${error.meta.available}`)
        break
      default:
        toast.error(error.message)
    }
  }
}
```
