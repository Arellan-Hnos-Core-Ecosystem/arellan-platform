# arellan-api-gateway — Capa de Entrada y Seguridad Perimetral

Punto de entrada único para todos los requests al ecosistema Arellan Hnos. Maneja rate limiting, CORS, validación de headers, logging perimetral y enrutamiento hacia los módulos del backend.

## Responsabilidades

1. **Rate limiting** — protección contra abuso y DDoS por IP y por usuario
2. **CORS** — solo orígenes de `*.arellan.pe` autorizados explícitamente
3. **Helmet.js** — headers de seguridad HTTP en todos los responses
4. **Logging de entrada** — registro de cada request con IP, user_agent, timestamp
5. **Validación de headers** — Content-Type, Authorization format
6. **Data masking** — campos sensibles eliminados del payload según el rol

## Configuración de Rate Limiting

```typescript
// Límites por contexto
const rateLimits = {
  global: {
    ttl: 60_000,    // 60 segundos
    limit: 100,     // 100 requests/min por IP
  },
  finance: {
    ttl: 60_000,
    limit: 10,      // 10 requests/min por usuario — módulo financiero
  },
  public: {
    ttl: 60_000,
    limit: 30,      // 30 requests/min por IP — endpoints del client-portal
  },
  auth: {
    ttl: 900_000,   // 15 minutos
    limit: 5,       // 5 intentos de login fallidos → bloqueo temporal
  }
}
```

## CORS — Orígenes Permitidos

```typescript
const allowedOrigins = [
  'https://app.arellan.pe',
  'https://mobile.arellan.pe',
  'https://taller.arellan.pe',
  'https://cliente.arellan.pe',
  process.env.NODE_ENV === 'development' && 'http://localhost:3000',
  process.env.NODE_ENV === 'development' && 'http://localhost:3001',
].filter(Boolean)
```

## Headers de Seguridad (Helmet.js)

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*.supabase.co", "https://*.amazonaws.com"],
    }
  },
  crossOriginEmbedderPolicy: false,  // Necesario para imágenes S3
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  }
}))
```

## Data Masking por Rol

Los mecánicos (`MECHANIC`, `TRAINEE`) **no deben** ver datos personales de clientes. El interceptor de masking aplica las siguientes reglas al serializar responses:

```typescript
// Campos eliminados del payload para roles MECHANIC y TRAINEE
const maskedFieldsForMechanic = [
  'client.phone',
  'client.email',
  'client.address',
  'client.dni',
  'vehicle.purchasePrice',
  'order.laborMargin',
]
```

## Logging Perimetral

Cada request que entra al sistema genera un log estructurado:

```json
{
  "timestamp": "2026-05-24T14:30:00.000Z",
  "method": "POST",
  "path": "/api/v1/finance/expenses",
  "ip": "190.123.x.x",
  "user_agent": "Mozilla/5.0...",
  "user_id": "uuid",
  "role": "FINANCE",
  "duration_ms": 145,
  "status_code": 201,
  "request_id": "uuid"
}
```

Los logs se envían a CloudWatch Logs en producción y a Axiom en MVP.

## Manejo Global de Errores

```typescript
// Formato de error estándar
interface ErrorResponse {
  statusCode: number;
  error: string;           // Código de error del negocio
  message: string;         // Mensaje legible
  timestamp: string;
  path: string;
  requestId: string;
}

// Ejemplos de errores del negocio
// 422 INVENTORY_NO_ACTIVE_ORDER — repuesto sin OT activa
// 403 EXPENSE_REQUIRES_OWNER_APPROVAL — gasto >S/.500 sin aprobación
// 409 VEHICLE_UNAUTHORIZED_EXIT — vehículo fuera del perímetro sin autorización
```

## Versionado de API

Todas las rutas están prefijadas con `/api/v1/`. Cuando se introduzcan cambios breaking, se añadirá `/api/v2/` manteniendo v1 activa por 90 días como período de transición.
