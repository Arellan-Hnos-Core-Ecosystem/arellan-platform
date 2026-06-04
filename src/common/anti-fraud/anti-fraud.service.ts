import { Injectable, Logger } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { IntegrityHashService } from "../crypto/integrity-hash.service"
import { randomUUID } from "node:crypto"

export interface FraudCheckContext {
  userId: string
  userRole: string
  ipAddress: string
  method: string
  url: string
  body?: Record<string, unknown>
  action: string
  entity: string
  entityId?: string
}

export interface FraudAlert {
  id: string
  type: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  description: string
  details: Record<string, unknown>
  timestamp: string
  userId: string
  ipAddress: string
  immutableHash: string
}

const YAPE_KEYWORDS = ["yape", "plin", "personal", "personal_yape", "numero_personal"]
const INVENTORY_MANIPULATION_PATTERNS = ["ADJUSTMENT", "write_off", "merma", "perdida"]
const HIGH_VALUE_THRESHOLD = 500

@Injectable()
export class AntiFraudService {
  private readonly logger = new Logger(AntiFraudService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrityHash: IntegrityHashService,
  ) {}

  async audit(ctx: FraudCheckContext): Promise<FraudAlert[]> {
    const alerts: FraudAlert[] = []

    alerts.push(...this.checkYapeDiversion(ctx))
    alerts.push(...this.checkInventoryManipulation(ctx))
    alerts.push(...this.checkHighValueMutation(ctx))
    alerts.push(...this.checkSuspiciousAccessPattern(ctx))

    for (const alert of alerts) {
      await this.persistAlert(alert, ctx)
    }

    if (alerts.length > 0) {
      this.logger.warn(
        `[ANTI-FRAUD] ${alerts.length} alert(s) generated for ${ctx.userId} on ${ctx.action}`,
      )
    }

    return alerts
  }

  private checkYapeDiversion(ctx: FraudCheckContext): FraudAlert[] {
    const alerts: FraudAlert[] = []
    const body = ctx.body ?? {}
    const bodyStr = JSON.stringify(body).toLowerCase()

    if (!YAPE_KEYWORDS.some((kw) => bodyStr.includes(kw))) return alerts

    const isPersonalYape =
      body.isPersonalYape === true ||
      (typeof body.yapeAccount === "string" && body.yapeAccount.length > 0)

    if (isPersonalYape) {
      alerts.push(this.buildAlert(ctx, {
        type: "YAPE_DIVERSION",
        severity: "CRITICAL",
        description: "Pago recibido en cuenta Yape personal detectado",
        details: {
          yapeAccount: body.yapeAccount ?? "no especificado",
          amount: body.amount ?? "no especificado",
          orderId: body.orderId ?? body.workOrderId ?? "no especificado",
        },
      }))
    }

    return alerts
  }

  private checkInventoryManipulation(ctx: FraudCheckContext): FraudAlert[] {
    const alerts: FraudAlert[] = []
    const body = ctx.body ?? {}

    if (ctx.entity !== "inventory" && ctx.entity !== "inventory-item") return alerts

    const justification = (body as any).justification as string | undefined
    const isAdjustment =
      (body as any).type === "ADJUSTMENT" ||
      (typeof justification === "string" &&
        INVENTORY_MANIPULATION_PATTERNS.some((p) =>
          justification.toLowerCase().includes(p),
        ))

    if (isAdjustment) {
      alerts.push(this.buildAlert(ctx, {
        type: "INVENTORY_MANIPULATION",
        severity: "HIGH",
        description: "Ajuste de inventario detectado - posible manipulacion",
        details: {
          itemId: (body as any).itemId ?? "no especificado",
          quantity: (body as any).quantity ?? "no especificado",
          justification: (body as any).justification ?? "no especificado",
          type: (body as any).type ?? "no especificado",
        },
      }))
    }

    return alerts
  }

  private checkHighValueMutation(ctx: FraudCheckContext): FraudAlert[] {
    const alerts: FraudAlert[] = []
    const body = ctx.body ?? {}

    const amount = Number(body.amount ?? 0)
    if (amount <= HIGH_VALUE_THRESHOLD) return alerts

    const isExpenseApproval =
      ctx.url.includes("expense") || ctx.url.includes("gasto")
    const isPayment = ctx.url.includes("payment") || ctx.url.includes("pago")

    if (isExpenseApproval || isPayment) {
      alerts.push(this.buildAlert(ctx, {
        type: "HIGH_VALUE_MUTATION",
        severity: "MEDIUM",
        description: `Mutacion financiera de alto valor: S/ ${amount.toFixed(2)}`,
        details: {
          amount,
          entity: ctx.entity,
          action: ctx.action,
          currency: body.currency ?? "PEN",
        },
      }))
    }

    return alerts
  }

  private checkSuspiciousAccessPattern(ctx: FraudCheckContext): FraudAlert[] {
    const alerts: FraudAlert[] = []

    const restrictedEndpoints = ["force-logout", "delete", "hard-delete", "purge"]
    if (restrictedEndpoints.some((ep) => ctx.url.toLowerCase().includes(ep))) {
      alerts.push(this.buildAlert(ctx, {
        type: "RESTRICTED_ACCESS",
        severity: "HIGH",
        description: "Acceso a endpoint restringido detectado",
        details: { url: ctx.url, method: ctx.method },
      }))
    }

    return alerts
  }

  async persistAlert(
    alert: FraudAlert,
    ctx: FraudCheckContext,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: ctx.userId,
          userName: ctx.userId,
          role: ctx.userRole,
          action: `FRAUD_${alert.type}`,
          entity: ctx.entity,
          entityId: ctx.entityId,
          severity: alert.severity === "CRITICAL" || alert.severity === "HIGH"
            ? "SECURITY_ALERT"
            : alert.severity === "MEDIUM"
              ? "WARNING"
              : "INFO",
          ipAddress: ctx.ipAddress,
          metadata: {
            alertId: alert.id,
            timestamp: alert.timestamp,
            type: alert.type,
            description: alert.description,
            details: alert.details,
            correlationId: randomUUID(),
            immutableHash: alert.immutableHash,
          } as any,
          integrityHash: alert.immutableHash,
        },
      })
    } catch (err) {
      this.logger.error(`Failed to persist fraud alert: ${(err as Error).message}`)
    }
  }

  private buildAlert(
    ctx: FraudCheckContext,
    overrides: Partial<FraudAlert>,
  ): FraudAlert {
    const id = randomUUID()
    const timestamp = new Date().toISOString()
    const immutableHash = this.integrityHash.generateMutationHash({
      entity: ctx.entity,
      entityId: ctx.entityId ?? "unknown",
      action: "CREATE",
      before: null,
      after: { alertId: id, type: overrides.type, timestamp },
    })

    return {
      id,
      type: overrides.type ?? "UNKNOWN",
      severity: overrides.severity ?? "LOW",
      description: overrides.description ?? "Alerta de fraude generada",
      details: overrides.details ?? {},
      timestamp,
      userId: ctx.userId,
      ipAddress: ctx.ipAddress,
      immutableHash,
    }
  }
}
