import { ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { createHmac } from "crypto"
import { PaymentWebhookGuard } from "../payment-webhook.guard"

const SECRET = "test-webhook-secret"

function ctx(headers: Record<string, unknown>, body: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers, body }) }),
  } as unknown as ExecutionContext
}

function sign(token: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(token).digest("hex")
}

function guardWith(secret?: string): PaymentWebhookGuard {
  const config = { get: jest.fn().mockReturnValue(secret) } as unknown as ConfigService
  return new PaymentWebhookGuard(config)
}

describe("PaymentWebhookGuard (SEC-03)", () => {
  it("fails closed (Forbidden) when PAYMENT_WEBHOOK_SECRET is not configured", () => {
    expect(() =>
      guardWith(undefined).canActivate(ctx({ "x-webhook-signature": "abc" }, { qrToken: "t" })),
    ).toThrow(ForbiddenException)
  })

  it("rejects a request with no signature header", () => {
    expect(() =>
      guardWith(SECRET).canActivate(ctx({}, { qrToken: "tok-1" })),
    ).toThrow(UnauthorizedException)
  })

  it("rejects a request with no qrToken in the body", () => {
    expect(() =>
      guardWith(SECRET).canActivate(ctx({ "x-webhook-signature": sign("tok-1") }, {})),
    ).toThrow(UnauthorizedException)
  })

  it("rejects a forged signature (wrong secret)", () => {
    expect(() =>
      guardWith(SECRET).canActivate(
        ctx({ "x-webhook-signature": sign("tok-1", "wrong-secret") }, { qrToken: "tok-1" }),
      ),
    ).toThrow(UnauthorizedException)
  })

  it("rejects a valid signature bound to a different token (no cross-token replay)", () => {
    expect(() =>
      guardWith(SECRET).canActivate(
        ctx({ "x-webhook-signature": sign("other-token") }, { qrToken: "tok-1" }),
      ),
    ).toThrow(UnauthorizedException)
  })

  it("accepts a correctly signed qrToken", () => {
    expect(
      guardWith(SECRET).canActivate(
        ctx({ "x-webhook-signature": sign("tok-1") }, { qrToken: "tok-1" }),
      ),
    ).toBe(true)
  })
})
