# arellan-integrations-hub — Hub de Integraciones Externas

Módulo central de integración con sistemas y servicios externos: SUNAT (facturación electrónica), Culqi/Niubiz (pagos), Meta Business API (WhatsApp), ZKTeco (biometría) y otros proveedores del ecosistema Arellan Hnos.

## Integraciones por Fase

### Fase 1 (MVP)
| Sistema | Propósito | Prioridad |
|---------|-----------|-----------|
| Supabase Auth | Autenticación + MFA | Crítica |
| Supabase Storage | Almacenamiento de fotos de vehículos | Crítica |
| ZKTeco ADMS | Asistencia biométrica de personal | Alta |
| Resend | Email transaccional | Alta |
| Web Push VAPID | Push notifications a owners | Alta |

### Fase 2
| Sistema | Propósito |
|---------|-----------|
| Meta Business API (WhatsApp) | Notificaciones a owners y clientes |
| Culqi / Niubiz | Pagos con tarjeta (POS y online) |
| SUNAT API | Validación de comprobantes electrónicos |

### Fase 3
| Sistema | Propósito |
|---------|-----------|
| Yape Business | Cobros QR corporativo |
| PagoEfectivo | Cobros en efectivo con código |
| SUNAT OSE | Emisión de facturas electrónicas |
| AWS Rekognition / OCR local | Lectura automática de placa de vehículos |

## Integración ZKTeco — Asistencia Biométrica

Los terminales ZKTeco en el taller envían eventos de marcado por ADMS (HTTP POST) al endpoint del gateway.

```typescript
// Endpoint: POST /api/v1/iot/biometric-punch
// No requiere auth JWT (viene del hardware, verificado por device secret)

interface BiometricPunchPayload {
  device_metadata: {
    serial_number: string;      // 'ZK-TERMINAL-SURQUILLO-01'
    firmware_version: string;
    mac_address: string;
  };
  punch_payload: {
    employee_hardware_id: string;  // 'MEC-007' (mapeado a user en BD)
    timestamp: string;             // ISO 8601 del hardware
    punch_type: 'CHECK_IN' | 'CHECK_OUT';
    verification_mode: 'FINGERPRINT' | 'FACE' | 'CARD';
  };
}

// Regla crítica: si CHECK_OUT con OT activa sin cerrar → CRITICAL_OPERATIONAL_ANOMALY
async processBiometricPunch(payload: BiometricPunchPayload) {
  const employee = await this.personnelService.findByHardwareId(
    payload.punch_payload.employee_hardware_id
  )

  if (payload.punch_payload.punch_type === 'CHECK_OUT') {
    const activeOrders = await this.ordersService.getActiveByMechanic(employee.id)
    if (activeOrders.length > 0) {
      await this.alertsService.triggerOperationalAnomaly({
        type: 'CHECKOUT_WITH_ACTIVE_ORDERS',
        employeeId: employee.id,
        activeOrderIds: activeOrders.map(o => o.id),
      })
    }
  }

  await this.personnelService.recordAttendance({
    employeeId: employee.id,
    type: payload.punch_payload.punch_type,
    timestamp: new Date(payload.punch_payload.timestamp),  // Usar timestamp del hardware
  })
}
```

## Integración SUNAT — Validación de Comprobantes

```typescript
// Consulta de validez de comprobante electrónico
async validateComprobante(ruc: string, tipoDoc: string, serie: string, numero: string) {
  const response = await this.httpService.get(
    `https://api.sunat.gob.pe/v1/contribuyente/contribuyentes/${ruc}/validarcomprobante`,
    {
      params: { tipoDoc, serie, numero },
      headers: { Authorization: `Bearer ${this.sunatToken}` },
    }
  )
  return response.data
}

// Se usa en: validación de facturas de proveedores dentro de 48h de gasto aprobado
```

## Integración Culqi — Pagos con Tarjeta (Fase 2)

```typescript
// Webhook de confirmación de pago
// POST /api/v1/payments/webhooks/culqi
// Firmado criptográficamente, verificación con HMAC-SHA256

async handleCulqiWebhook(payload: CulqiWebhookPayload, signature: string) {
  // Verificar firma del webhook
  const isValid = this.culqiService.verifySignature(payload, signature)
  if (!isValid) throw new UnauthorizedException('Invalid webhook signature')

  // Idempotencia: verificar si ya procesamos este payment_id
  const existing = await this.paymentsService.findByExternalId(payload.data.id)
  if (existing) return { status: 'already_processed' }

  // Cerrar OT y liberar vehículo
  await this.ordersService.markAsPaid(payload.data.metadata.orderId, {
    amount: payload.data.amount / 100,  // Culqi usa centavos
    method: 'CARD',
    externalId: payload.data.id,
  })
}
```

## Variables de Entorno Requeridas

```env
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# ZKTeco
ZKTECO_DEVICE_SECRET=
ZKTECO_WEBHOOK_ENDPOINT=/api/v1/iot/biometric-punch

# SUNAT (Fase 2)
SUNAT_CLIENT_ID=
SUNAT_CLIENT_SECRET=
SUNAT_RUC=

# Culqi (Fase 2)
CULQI_PUBLIC_KEY=
CULQI_PRIVATE_KEY=
CULQI_WEBHOOK_SECRET=

# WhatsApp Business (Fase 2)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
```
