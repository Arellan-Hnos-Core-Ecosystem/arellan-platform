# arellan-auth-service — Autenticación, Sesiones y RBAC

Módulo de autenticación y autorización del ecosistema Arellan Hnos. Gestiona tokens JWT, MFA, sesiones, roles y permisos granulares para todos los frontends.

## Responsabilidades

1. **Autenticación** — login con email/password + MFA TOTP
2. **Emisión de tokens** — JWT access token (RS256) + refresh token revocable
3. **Autorización** — RBAC (Role-Based Access Control) con guards en cada endpoint
4. **Gestión de sesiones** — sesión única, expiración automática, logout forzoso
5. **Auditoría de acceso** — cada login/logout registrado en `audit_logs`

## Flujo de Autenticación

```
[Cliente envía email + password + código MFA]
          ↓
[AuthService.login() valida credenciales en BD]
          ↓
[Verifica código TOTP (si rol requiere MFA)]
          ↓
[Genera access_token (JWT RS256, 1h) + refresh_token (UUID, 7 días)]
          ↓
[Almacena refresh_token en tabla refresh_tokens (hash bcrypt)]
          ↓
[Retorna { access_token, refresh_token, user: { id, role, name } }]
```

## Roles del Sistema

| Rol | Código | MFA | Módulos con acceso |
|-----|--------|-----|-------------------|
| Owner | `OWNER` | Obligatorio | Todo |
| Admin | `ADMIN` | Obligatorio | OTs, clientes, inventario, personal (sin finanzas sensibles) |
| Finance | `FINANCE` | Obligatorio | Módulo financiero completo |
| Mechanic | `MECHANIC` | No | Sus OTs, inventario (solo solicitar), fotos |
| Trainee | `TRAINEE` | No | Como MECHANIC con restricciones adicionales |
| Client | `CLIENT` | No | client-portal (solo lectura de su vehículo) |

## Implementación JWT

```typescript
// Configuración del token
const jwtConfig = {
  algorithm: 'RS256',
  accessToken: {
    expiresIn: '1h',
    issuer: 'arellan-platform',
    audience: 'arellan-apps',
  },
  refreshToken: {
    expiresIn: '7d',
    single: true,  // Un solo refresh token por usuario (configurable)
  }
}

// Payload del access token
interface JwtPayload {
  sub: string;        // user UUID
  role: UserRole;     // OWNER | ADMIN | FINANCE | MECHANIC | TRAINEE | CLIENT
  name: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}
```

## MFA — Autenticación Multifactor

Implementado con TOTP (Time-based One-Time Password — RFC 6238).

- Obligatorio para roles: `OWNER`, `ADMIN`, `FINANCE`
- Configuración inicial: el usuario escanea un QR en `arellan-frontend-web` con Google Authenticator o Authy
- Código de 6 dígitos válido por 30 segundos
- Códigos de recuperación: 10 códigos de un solo uso generados al activar MFA

```typescript
// Verificación de TOTP
import { authenticator } from 'otplib'

const isValid = authenticator.verify({
  token: dto.totpCode,
  secret: user.mfaSecret  // Almacenado cifrado en BD (AES-256)
})
```

## Guards y Decoradores

```typescript
// Proteger un endpoint con JWT + Rol específico
@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {

  @Get('cashbox')
  @Roles(UserRole.OWNER, UserRole.FINANCE)
  getCashbox() { ... }

  @Post('expenses/approve/:id')
  @Roles(UserRole.OWNER)  // Solo owners pueden aprobar gastos altos
  approveExpense() { ... }
}

// Decorador para obtener el usuario del request
@Get('me')
getProfile(@CurrentUser() user: AuthUser) {
  return user
}
```

## Tabla de Sesiones

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,           -- bcrypt hash del refresh token
  device_info JSONB,                  -- user_agent, ip, device fingerprint
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,             -- NULL si está activo
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_expires ON refresh_tokens(expires_at);
```

## Políticas de Sesión por Rol

| Rol | Duración access token | Timeout inactividad | Sesión única |
|-----|----------------------|--------------------|----|
| `OWNER`, `ADMIN` | 60 min | 180 min absoluto | Configurable |
| `FINANCE` | 60 min | 120 min absoluto | Sí |
| `MECHANIC`, `TRAINEE` | 12h (tablet compartida) | 30 min inactividad | No |
| `CLIENT` | 24h | Sin timeout | No |

## Logout Forzoso

Los `owner` pueden invalidar la sesión de cualquier usuario desde `arellan-frontend-web`:

```typescript
// Endpoint: DELETE /auth/sessions/:userId
// Guard: JwtAuthGuard + Roles(OWNER)
async forceLogout(targetUserId: string) {
  await this.prisma.refreshTokens.updateMany({
    where: { userId: targetUserId, revokedAt: null },
    data: { revokedAt: new Date() }
  })
  // El próximo request del usuario fallará con 401
}
```

## Alertas de Seguridad

El sistema envía notificación push a `owner` cuando:
- Login desde IP o dispositivo inusual (diferente al histórico del usuario)
- Múltiples intentos de login fallidos (>5 en 15 minutos)
- Acceso al módulo financiero fuera de horario laboral (configurado por owner)
- Cambio de contraseña o MFA de cualquier cuenta

## Rotación de Claves

- Las claves RS256 (privada/pública) se rotan cada 90 días
- La rotación se gestiona a través de AWS Secrets Manager
- Script automatizado en `arellan-infrastructure/scripts/rotate-jwt-keys.sh`
- Al rotar: los tokens anteriores siguen válidos durante su vida útil (1h máximo)
