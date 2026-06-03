import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as crypto from "node:crypto"

@Injectable()
export class IntegrityHashService {
  private readonly secretKey: Buffer

  constructor(private readonly config: ConfigService) {
    const raw = this.config.getOrThrow<string>("INTEGRITY_HASH_SECRET")
    this.secretKey = crypto.scryptSync(raw, "arellan-salt-v2", 32)
  }

  generateMutationHash(params: {
    entity: string
    entityId: string
    action: "CREATE" | "UPDATE" | "DELETE"
    before: Record<string, unknown> | null
    after: Record<string, unknown> | null
  }): string {
    const canonical = JSON.stringify(
      {
        e: params.entity,
        id: params.entityId,
        a: params.action,
        b: params.before ?? null,
        f: params.after ?? null,
      },
      Object.keys({ ...params.before, ...params.after }).sort(),
    )

    return crypto.createHmac("sha256", this.secretKey).update(canonical).digest("hex")
  }

  verifyAuditLogIntegrity(log: {
    entity: string
    entityId: string
    action: string
    beforeState: Record<string, unknown> | null
    afterState: Record<string, unknown> | null
    integrityHash: string
  }): boolean {
    const expected = this.generateMutationHash({
      entity: log.entity,
      entityId: log.entityId,
      action: log.action as "CREATE" | "UPDATE" | "DELETE",
      before: log.beforeState,
      after: log.afterState,
    })
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(log.integrityHash, "hex"),
    )
  }

  generatePaymentHash(params: {
    orderId: string
    amount: number
    method: string
    referenceToken: string | null
  }): string {
    const payload = `${params.orderId}:${params.amount}:${params.method}:${params.referenceToken ?? "CASH"}`
    return crypto.createHmac("sha256", this.secretKey).update(payload).digest("hex")
  }
}
