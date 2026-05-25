# arellan-platform

Backend unificado (API REST) de la Clínica Automotriz Arellan Hnos. Concentra toda la lógica de negocio, control de acceso, auditoría forense y reglas de autorización del ecosistema digital.

## Descripción

`arellan-platform` es el núcleo transaccional del ecosistema. Todos los frontends (`arellan-frontend-web`, `arellan-mobile-app`, `arellan-mechanic-ui`, `arellan-client-portal`) consumen exclusivamente este backend. Ningún frontend accede directamente a la base de datos.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 20 LTS |
| Framework | NestJS + TypeScript (strict) |
| ORM | Prisma 5.x |
| Base de datos | PostgreSQL 15 (Supabase MVP → AWS RDS producción) |
| Caché / Colas | Redis + BullMQ (Upstash MVP → ElastiCache producción) |
| Autenticación | Supabase Auth (MVP) → JWT RS256 + Passport (producción) |
| Validación | class-validator + class-transformer |
| Documentación API | @nestjs/swagger (OpenAPI 3.0 automático) |
| Testing | Jest + Supertest |
| Contenedores | Docker + Docker Compose |

## Estructura de Módulos

```
src/
├── modules/
│   ├── auth/               # JWT, refresh tokens, RBAC, guards
│   ├── orders/             # Órdenes de trabajo (OT) — ciclo completo
│   ├── inventory/          # Kardex, stock, reservas por OT, alertas
│   ├── finance/            # Caja, ingresos, egresos, autorizaciones
│   ├── clients/            # Registro, historial, vehículos asociados
│   ├── vehicles/           # Ficha técnica, historial, control de uso
│   ├── personnel/          # Asistencia, roles, movimientos, incidencias
│   ├── audit/              # Log append-only inmutable (sin DELETE/UPDATE)
│   ├── notifications/      # Push, email, WhatsApp por eventos críticos
│   ├── quotes/             # Cotizaciones + conversión a OT (Fase 2)
│   ├── purchases/          # Proveedores, comparativo precios (Fase 2)
│   ├── imports/            # Control de importaciones + comisiones (Fase 2)
│   └── reports/            # Reportes exportables PDF/Excel (Fase 2)
├── shared/
│   ├── decorators/         # @CurrentUser, @Roles, @AuditLog
│   ├── filters/            # HTTP exception filters globales
│   ├── interceptors/       # AuditInterceptor (auto-log en cada request)
│   ├── pipes/              # ValidationPipe global
│   └── utils/              # Helpers de fecha, hash, moneda
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts
└── infrastructure/
    ├── database/           # Prisma schema + migrations
    ├── cache/              # Redis adapter
    ├── storage/            # Supabase Storage / AWS S3 adapter
    └── queue/              # BullMQ workers y jobs
```

## Submódulos (carpetas dentro de este repo)

| Subcarpeta | Propósito |
|-----------|-----------|
| `arellan-backend-api` | Core API — módulos principales de negocio |
| `arellan-auth-service` | Servicio de autenticación, tokens, MFA y RBAC |
| `arellan-api-gateway` | Capa de entrada, rate limiting, CORS, validación |
| `arellan-notifications-service` | Push, email y WhatsApp por eventos |
| `arellan-reports-engine` | Generador de reportes PDF/Excel |
| `arellan-workers` | Jobs BullMQ: backups, reportes programados, alertas |
| `arellan-integrations-hub` | SUNAT, Culqi/Niubiz, ZKTeco, WhatsApp |
| `arellan-event-schemas` | Contratos de eventos compartidos entre servicios |
| `arellan-shared-types` | Tipos TypeScript compartidos con frontends |
| `arellan-sdk-core` | SDK base para consumo desde frontends |

## Variables de Entorno

Ver `.env.example` en la raíz. Las variables de producción se gestionan en **AWS Secrets Manager** (nunca en código ni en git).

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@host:5432/arellan_db

# Auth
JWT_SECRET=...
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# Redis
REDIS_URL=redis://...

# Storage
AWS_S3_BUCKET=arellan-files
AWS_REGION=us-east-1

# Notificaciones
RESEND_API_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

## Scripts de Desarrollo

```bash
# Instalar dependencias
npm install

# Levantar entorno local (PostgreSQL + Redis)
docker compose up -d

# Ejecutar migraciones
npx prisma migrate dev

# Seed de datos iniciales
npx prisma db seed

# Iniciar servidor en modo desarrollo
npm run start:dev

# Correr tests unitarios
npm run test

# Correr tests e2e
npm run test:e2e

# Build de producción
npm run build

# Generar OpenAPI spec
npm run swagger:export
```

## RBAC — Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| `owner` | Edgar, Juan — acceso total, aprobaciones sin límite |
| `admin` | Ana — operaciones sin finanzas sensibles |
| `finance` | Hija — módulo financiero completo con doble firma |
| `mechanic` | Sus propias OTs, solicitar repuestos, fotos |
| `trainee` | Como mechanic con restricciones adicionales |
| `client` | Solo lectura de su vehículo en client-portal |

## Auditoría

Cada acción sensible se registra automáticamente en `audit_logs` (tabla append-only). El interceptor `AuditInterceptor` captura: `user_id`, `action`, `entity`, `before`, `after`, `ip`, `user_agent`, `timestamp`. No existe endpoint de DELETE ni UPDATE sobre esta tabla.

## Dominios

- **API:** `api.arellan.pe`
- **Docs OpenAPI:** `api.arellan.pe/api/docs`

## Repos Relacionados

- `arellan-infrastructure` — CI/CD, Terraform, Docker configs
- `arellan-design-system` — tipos compartidos con frontends
- `arellan-docs-governance` — ADRs, runbooks, estándares
- `arellan-security-compliance` — políticas de seguridad

## Licencia

Privado — © 2026 Arellan Hnos. Todos los derechos reservados.
