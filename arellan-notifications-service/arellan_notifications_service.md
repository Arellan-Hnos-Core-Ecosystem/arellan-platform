# arellan-notifications-service — Notificaciones Multi-Canal

Servicio de notificaciones del ecosistema Arellan Hnos. Gestiona push notifications (Web Push API), emails transaccionales y mensajes WhatsApp Business por eventos críticos del negocio.

## Canales de Notificación

| Canal | Proveedor MVP | Proveedor Producción | Costo |
|-------|--------------|---------------------|-------|
| Push Web/PWA | Web Push API (VAPID) | Web Push API | $0 |
| Email | Resend.com | Resend.com | $0 hasta 3k/mes |
| WhatsApp Business | Meta Business API (Fase 2) | Meta Business API | Variable |
| In-app (tiempo real) | Polling TanStack Query | WebSocket Socket.io | $0 |

## Eventos que Disparan Notificaciones

### Alta Prioridad (push inmediato a owner)
| Evento | Destinatarios | Canal |
|--------|--------------|-------|
| Gasto >S/.100 pendiente de aprobación | Edgar, Juan | Push + WhatsApp |
| Gasto >S/.500 pendiente de aprobación | Edgar, Juan | Push + WhatsApp + Email |
| Vehículo fuera del perímetro sin autorización | Edgar, Juan | Push urgente |
| Descuadre de caja al cierre | Edgar, Juan, Finance | Push + Email |
| Login desde dispositivo inusual | Owner afectado | Push + Email |
| Acceso a módulo financiero fuera de horario | Edgar, Juan | Push |
| Stock crítico bajo nivel mínimo | Admin, Edgar/Juan | Push |

### Media Prioridad (notificación normal)
| Evento | Destinatarios | Canal |
|--------|--------------|-------|
| Nueva OT creada | Admin, mecánico asignado | In-app |
| OT lista para recoger | Cliente | WhatsApp (Fase 2) / Email |
| Cotización enviada al cliente | Cliente | Email + WhatsApp |
| Repuesto aprobado / rechazado | Mecánico solicitante | Push in-app |
| Vehículo devuelto al taller | Edgar, Juan | In-app |

## Implementación Push (VAPID)

```typescript
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:tech@arellan.pe',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
) {
  await webpush.sendNotification(
    subscription,
    JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: '/icons/arellan-192.png',
      badge: '/icons/badge-72.png',
      data: {
        url: payload.actionUrl,
        type: payload.type,
        entityId: payload.entityId,
      },
      actions: payload.actions,  // e.g., [{ action: 'approve', title: 'Aprobar' }]
      requireInteraction: payload.priority === 'HIGH',
    })
  )
}
```

## Implementación Email (Resend)

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Email de aprobación de gasto
await resend.emails.send({
  from: 'no-reply@arellan.pe',
  to: ['edgar@arellan.pe', 'juan@arellan.pe'],
  subject: `[APROBACIÓN REQUERIDA] Gasto S/.${amount} — ${description}`,
  react: ExpenseApprovalEmail({ amount, requester, justification, approveUrl }),
})
```

## Queue de Notificaciones (BullMQ)

Las notificaciones no se envían de forma síncrona en el request. Se encolan en Redis para garantizar entrega y reintento:

```typescript
// Cola de notificaciones con prioridades
const notificationQueue = new Queue('notifications', {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,  // Mantener logs de fallos
  }
})

// Worker procesando la cola
const worker = new Worker('notifications', async (job) => {
  switch (job.data.channel) {
    case 'PUSH': return sendPushNotification(job.data)
    case 'EMAIL': return sendEmail(job.data)
    case 'WHATSAPP': return sendWhatsApp(job.data)
  }
})
```

## Subscripciones Push — Almacenamiento

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  device_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMPTZ
);
```

## Gestión de Preferencias

Cada usuario puede configurar qué notificaciones recibir y por qué canal desde `arellan-frontend-web > Configuración > Notificaciones`. Sin embargo, las alertas de **alta prioridad** (fraude, descuadre de caja, vehículo fuera del perímetro) son **siempre enviadas y no pueden desactivarse** para el rol `OWNER`.
