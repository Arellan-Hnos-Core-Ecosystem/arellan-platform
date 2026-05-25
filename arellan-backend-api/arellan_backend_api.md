# arellan-backend-api — Core API NestJS

Módulo principal del backend de Arellan Hnos. Contiene todos los módulos de negocio del monolito modular: autenticación, órdenes de trabajo, inventario, finanzas, clientes, vehículos, personal y auditoría.

## Arquitectura

Monolito modular con separación por dominios (Clean Architecture / DDD light). Cada módulo es completamente autocontenido: controller → service → repository → prisma entity. La comunicación entre módulos se realiza exclusivamente a través de interfaces de servicio inyectadas, nunca acceso directo a repositorios de otro módulo.

```
arellan-platform/src/modules/
│
├── auth/               ← Tokens JWT, guards, estrategias Passport
├── orders/             ← Órdenes de trabajo (OT) — ciclo de vida completo
├── inventory/          ← Kardex, stock, reservas vinculadas a OT
├── finance/            ← Caja, ingresos, egresos, autorizaciones por umbral
├── clients/            ← Clientes, historial, vehículos asociados
├── vehicles/           ← Ficha técnica, control de uso del taller
├── personnel/          ← Asistencia, roles, incidencias disciplinarias
├── audit/              ← Log inmutable append-only
└── notifications/      ← Push, email, WhatsApp por eventos críticos
```

## Módulos MVP — Detalle

### `auth`
- Login con email/password + MFA (TOTP RFC 6238)
- JWT RS256 access token (1h) + refresh token (7 días, revocable)
- Guards: `JwtAuthGuard`, `RolesGuard`, `AuditGuard`
- Estrategias Passport: `jwt`, `local`
- Logout forzoso desde owner (revoca refresh token en BD)
- Sesión única configurable (nuevo login invalida sesiones anteriores)

### `orders` — Órdenes de Trabajo
- Estados: `RECEIVED → DIAGNOSING → QUOTE_SENT → IN_PROGRESS → QA → READY → DELIVERED`
- Asignación de mecánico responsable
- Timestamps automáticos por cambio de estado
- Vinculación obligatoria con cliente y vehículo
- Evidencias fotográficas (upload a S3, hash SHA-256 inmutable)
- Firma digital del cliente al recoger

### `inventory` — Kardex
- Stock actual por ítem con nivel mínimo configurable
- **Regla crítica:** salida de repuesto SOLO si existe OT activa vinculada
- Sin OT activa → HTTP 422 `INVENTORY_NO_ACTIVE_ORDER`
- Ajustes manuales solo para `owner`/`admin` con justificación en BD
- Alerta automática cuando stock < nivel mínimo (notificación push)
- Auditoría mensual: reporte automático de discrepancias teórico vs. físico

### `finance` — Control Financiero
- Apertura y cierre de caja diaria
- Registro de ingresos por método de pago (QR dinámico, POS, efectivo)
- Flujo de autorización de gastos por umbral:
  - ≤ S/.100: `finance` autoriza directamente
  - S/.100–S/.500: requiere aprobación de `admin`
  - >S/.500 o importaciones: requiere aprobación explícita de `owner`
- Gastos en estado `PENDING_APPROVAL` bloqueados hasta firma digital
- Conciliación automática al cierre de caja
- Descuadre >S/.5 genera flag `CLOSED_WITH_DISCREPANCY` + alerta forense

### `clients` — Gestión de Clientes
- Registro con DNI/RUC opcional
- Historial completo de visitas y servicios
- Vehículos asociados por cliente
- Preferencias de contacto

### `vehicles` — Control de Vehículos
- Ficha técnica por matrícula (marca, modelo, año, motor)
- Historial de servicios con timestamps
- **Control de uso de vehículos del taller:**
  - Registro obligatorio al sacar vehículo: quién, motivo, km salida, foto tablero
  - Requiere aprobación previa de `owner` via push
  - Geofence 200m radio del local
  - Alerta automática si no regresa en tiempo autorizado
  - Estado `ALERT_JOYRIDE` si sale sin autorización

### `personnel` — Personal
- Asistencia (integración con ZKTeco vía `arellan-hardware-iot`)
- Registro de incidencias disciplinarias trazables
- Desactivación de cuenta al finalizar contrato (sin eliminación)
- Historial completo de acciones por empleado

### `audit` — Log Forense Inmutable
```sql
-- Esta tabla solo acepta INSERT. No existe DELETE ni UPDATE en ningún endpoint.
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES accounts(id),
  user_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100),
  entity_id UUID,
  before_state JSONB,
  after_state JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

El `AuditInterceptor` registra automáticamente cada request que muta datos. Las acciones críticas adicionales usan el decorador `@AuditLog('ACTION_NAME')`.

## Endpoints Base

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Login con credenciales |
| POST | `/auth/refresh` | Renovar access token |
| POST | `/auth/logout` | Invalidar refresh token |
| GET | `/orders` | Listar OTs (filtros por estado, fecha, mecánico) |
| POST | `/orders` | Crear nueva OT |
| PATCH | `/orders/:id/status` | Cambiar estado de OT |
| GET | `/inventory` | Stock actual con alertas |
| POST | `/finance/expenses` | Registrar gasto |
| PATCH | `/finance/expenses/:id/approve` | Aprobar gasto |
| GET | `/audit` | Ver audit log (solo `owner`) |

Documentación completa en: `https://api.arellan.pe/api/docs` (OpenAPI generado por `@nestjs/swagger`).

## Seguridad

- Rate limiting global: `@nestjs/throttler` (60 req/min por IP)
- Rate limiting específico en módulo financiero: 10 req/min por usuario
- CORS restrictivo: solo orígenes de `*.arellan.pe` listados explícitamente
- Helmet.js: headers de seguridad HTTP
- Variables de entorno: AWS Secrets Manager, nunca en código
- Dependabot activo para parches de seguridad automáticos

## Dependencias Clave

```json
{
  "@nestjs/core": "^10.x",
  "@nestjs/passport": "^10.x",
  "@nestjs/swagger": "^7.x",
  "@nestjs/throttler": "^5.x",
  "@prisma/client": "^5.x",
  "passport-jwt": "^4.x",
  "class-validator": "^0.14.x",
  "bullmq": "^5.x",
  "ioredis": "^5.x"
}
```
