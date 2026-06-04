import { Injectable, NestMiddleware, Logger } from "@nestjs/common"
import { Request, Response, NextFunction } from "express"
import { AntiFraudService, FraudCheckContext } from "./anti-fraud.service"

@Injectable()
export class AntiFraudMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AntiFraudMiddleware.name)

  constructor(private readonly antiFraudService: AntiFraudService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const user = (req as any).user
    const method = req.method
    const url = String(req.originalUrl ?? req.url)
    const ip = req.ip ?? "unknown"
    const params = req.params as Record<string, string>

    if (!user || ["GET", "HEAD", "OPTIONS"].includes(method)) {
      next()
      return
    }

    const ctx: FraudCheckContext = {
      userId: String(user.id ?? "unknown"),
      userRole: String(user.role ?? "unknown"),
      ipAddress: ip,
      method,
      url,
      body: (req.body ?? undefined) as Record<string, unknown> | undefined,
      action: method === "POST" ? "CREATED" : method === "DELETE" ? "DELETED" : "UPDATED",
      entity: this.extractEntity(url),
      entityId: params.id ?? undefined,
    }

    this.antiFraudService.audit(ctx).catch((err) => {
      this.logger.error(`AntiFraud audit failed: ${(err as Error).message}`)
    })

    next()
  }

  private extractEntity(url: string): string {
    const parts = url.split("/").filter(Boolean)
    const apiIndex = parts.findIndex((p) => p === "api")
    return parts[apiIndex + 2] || "unknown"
  }
}
