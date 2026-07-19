import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { Observable } from "rxjs"

const PRIVILEGED_ROLES = ["OWNER", "ADMIN", "FINANCE"]

// Rutas de /auth que un privilegiado SIN MFA verificada puede usar: las
// necesarias para enrolarse y gestionar su propia sesión. Todo lo demás —
// incluido /auth/register (alta de cuentas) y /auth/force-logout — exige MFA.
const AUTH_EXEMPT_SUFFIXES = [
  "/auth/login",
  "/auth/mechanic/login",
  "/auth/mfa/verify",
  "/auth/mfa/generate",
  "/auth/mfa/confirm",
  "/auth/refresh",
  "/auth/logout",
  "/auth/logout-all",
  "/auth/me",
]

// SEC-05-bis: cobertura TOTAL de la regla de negocio #9 ("MFA TOTP obligatorio
// para OWNER/ADMIN/FINANCE"). El MfaRequiredGuard por-ruta sólo cubría ~4
// endpoints; este interceptor global corre tras los guards (req.user presente)
// y bloquea CUALQUIER ruta —lectura o mutación— a un privilegiado cuyo token no
// completó TOTP, dejando accesible únicamente el flujo de enrolamiento y la
// gestión de su propia sesión bajo /auth. Fail-closed y sin wiring por ruta:
// un controller nuevo queda cubierto automáticamente.
@Injectable()
export class MfaEnforcementInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") return next.handle()

    const req = context.switchToHttp().getRequest()
    const user = req.user as { role?: string; mfaVerified?: boolean } | undefined

    if (user && PRIVILEGED_ROLES.includes(String(user.role)) && user.mfaVerified !== true) {
      const path = String(req.originalUrl ?? req.url).split("?")[0]
      const isSessionRoute =
        AUTH_EXEMPT_SUFFIXES.some((s) => path.endsWith(s)) ||
        /\/auth\/sessions(\/[^/]+)?$/.test(path)
      if (!isSessionRoute) {
        throw new ForbiddenException({
          message:
            "Tu rol requiere MFA activa y verificada. Completa el enrolamiento TOTP (/auth/mfa/generate + /auth/mfa/confirm) e inicia sesion con tu codigo.",
          code: "MFA_ENROLLMENT_REQUIRED",
        })
      }
    }

    return next.handle()
  }
}
