import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common"
import { Observable } from "rxjs"
import { AntiFraudService, FraudCheckContext } from "./anti-fraud.service"

// SEC-01: reemplaza a AntiFraudMiddleware. El middleware corría ANTES de los
// guards, por lo que `req.user` (poblado por JwtAuthGuard/Passport) siempre
// era undefined → los chequeos anti-fraude nunca se ejecutaban. Un interceptor
// global corre DESPUÉS de los guards, por lo que sí dispone de la identidad
// autenticada del usuario.
@Injectable()
export class AntiFraudInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AntiFraudInterceptor.name)

  constructor(private readonly antiFraudService: AntiFraudService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") return next.handle()

    const req = context.switchToHttp().getRequest()
    const method: string = req.method
    const user = req.user

    // Sólo mutaciones autenticadas: las lecturas no mutan estado.
    if (user && !["GET", "HEAD", "OPTIONS"].includes(method)) {
      const url = String(req.originalUrl ?? req.url)
      const params = (req.params ?? {}) as Record<string, string>

      const ctx: FraudCheckContext = {
        userId: String(user.id ?? "unknown"),
        userName: typeof user.name === "string" ? user.name : undefined,
        userRole: String(user.role ?? "unknown"),
        ipAddress: req.ip ?? "unknown",
        method,
        url,
        body: (req.body ?? undefined) as Record<string, unknown> | undefined,
        action: method === "POST" ? "CREATED" : method === "DELETE" ? "DELETED" : "UPDATED",
        entity: AntiFraudInterceptor.extractEntity(url),
        entityId: params.id ?? undefined,
      }

      // No bloquea la respuesta: la auditoría anti-fraude es best-effort.
      this.antiFraudService.audit(ctx).catch((err) => {
        this.logger.error(`AntiFraud audit failed: ${(err as Error).message}`)
      })
    }

    return next.handle()
  }

  private static extractEntity(url: string): string {
    const parts = url.split("/").filter(Boolean)
    const apiIndex = parts.findIndex((p) => p === "api")
    return parts[apiIndex + 2] || "unknown"
  }
}
