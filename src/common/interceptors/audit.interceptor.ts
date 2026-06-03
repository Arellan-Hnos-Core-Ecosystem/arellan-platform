import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Optional,
  Logger,
} from "@nestjs/common"
import { Observable } from "rxjs"
import { tap } from "rxjs/operators"
import { PrismaService } from "../prisma/prisma.service"
import { IntegrityHashService } from "../crypto/integrity-hash.service"
import { randomUUID } from "node:crypto"

const SENSITIVE_FIELDS = [
  "password",
  "token",
  "mfaSecret",
  "passwordHash",
  "refreshToken",
  "accessToken",
  "secret",
  "pin",
  "ssn",
]

const FINANCIAL_KEYWORDS = [
  "payment",
  "pago",
  "transaction",
  "transaccion",
  "invoice",
  "factura",
  "billing",
  "facturacion",
  "refund",
  "reembolso",
  "charge",
  "cobro",
]

type MutationAction = "CREATE" | "UPDATE" | "DELETE"

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name)

  constructor(
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly integrityHash?: IntegrityHashService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const method = request.method
    const url = request.url

    if (!user || !this.prisma || ["GET", "HEAD", "OPTIONS"].includes(method)) {
      return next.handle()
    }

    const correlationId =
      request.headers["x-correlation-id"] ?? randomUUID()

    const beforeState = this.captureBeforeState(method, request)

    return next.handle().pipe(
      tap(async (responseBody) => {
        const action = this.buildAction(method, url)
        const severity = this.detectSeverity(method, action, url)
        const entity = this.extractEntity(url)
        const entityId = this.extractEntityId(request)

        const afterState = method === "POST"
          ? this.sanitize(request.body)
          : undefined

        const mutationAction = this.toMutationAction(method)

        const integrityHash = this.integrityHash
          ? this.integrityHash.generateMutationHash({
              entity,
              entityId: entityId ?? "unknown",
              action: mutationAction,
              before: beforeState ?? null,
              after: afterState ?? null,
            })
          : undefined

        try {
          await this.prisma!.auditLog.create({
            data: {
              userId: user.id,
              userName: user.name || user.email,
              role: user.role,
              action,
              entity,
              entityId,
              beforeState: (beforeState as any) ?? undefined,
              afterState: (afterState as any) ?? undefined,
              integrityHash,
              ipAddress: request.ip || "unknown",
              userAgent: request.headers["user-agent"] || undefined,
              severity,
              metadata: {
                method,
                path: url,
                correlationId,
                statusCode: responseBody?.statusCode ?? 200,
              },
            },
          })
        } catch {
          // Audit failure should not break the request
        }
      }),
    )
  }

  // ---------------------------------------------------------------
  // Action builder
  // ---------------------------------------------------------------
  private buildAction(method: string, url: string): string {
    const entity = this.extractEntity(url).toUpperCase()
    switch (method) {
      case "POST":
        return `${entity}_CREATED`
      case "PATCH":
      case "PUT":
        return `${entity}_UPDATED`
      case "DELETE":
        return `${entity}_DELETED`
      default:
        return `${entity}_MODIFIED`
    }
  }

  // ---------------------------------------------------------------
  // Severity detection
  // ---------------------------------------------------------------
  private detectSeverity(
    method: string,
    action: string,
    url: string,
  ): string {
    if (url.toLowerCase().includes("force-logout")) {
      return "SECURITY_ALERT"
    }

    const isFinancial = FINANCIAL_KEYWORDS.some(
      (k) =>
        url.toLowerCase().includes(k) || action.toLowerCase().includes(k),
    )
    if (isFinancial) {
      return "CRITICAL"
    }

    if (method === "DELETE" || action.includes("LOGOUT")) {
      return "WARNING"
    }

    if (action.includes("CANCEL")) {
      return "WARNING"
    }

    return "INFO"
  }

  // ---------------------------------------------------------------
  // Before/after state capture
  // ---------------------------------------------------------------
  private captureBeforeState(
    method: string,
    request: any,
  ): Record<string, unknown> | undefined {
    if (method === "PATCH" || method === "PUT") {
      return this.sanitize(request.body)
    }

    if (method === "DELETE") {
      const params = { ...request.params }
      if (Object.keys(params).length > 0) {
        return this.sanitize(params)
      }
    }

    return undefined
  }

  // ---------------------------------------------------------------
  // Sanitization – strip sensitive fields recursively
  // ---------------------------------------------------------------
  private sanitize(
    obj: Record<string, unknown> | undefined | null,
  ): Record<string, unknown> | undefined {
    if (!obj || typeof obj !== "object") return undefined

    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_FIELDS.some((f) => key.toLowerCase() === f.toLowerCase())) {
        sanitized[key] = "***REDACTED***"
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitize(value as Record<string, unknown>)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  // ---------------------------------------------------------------
  // Entity helpers
  // ---------------------------------------------------------------
  private extractEntity(url: string): string {
    const parts = url.split("/").filter(Boolean)
    const apiIndex = parts.findIndex((p) => p === "api")
    return parts[apiIndex + 2] || "unknown"
  }

  private extractEntityId(request: any): string | undefined {
    return request.params?.id ?? undefined
  }

  // ---------------------------------------------------------------
  // Map HTTP method → mutation action for integrity hash
  // ---------------------------------------------------------------
  private toMutationAction(method: string): MutationAction {
    switch (method) {
      case "POST":
        return "CREATE"
      case "PATCH":
      case "PUT":
        return "UPDATE"
      case "DELETE":
        return "DELETE"
      default:
        return "UPDATE"
    }
  }
}
