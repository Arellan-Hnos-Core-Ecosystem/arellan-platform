import { ExecutionContext, ForbiddenException } from "@nestjs/common"
import { of } from "rxjs"
import { MfaEnforcementInterceptor } from "../mfa-enforcement.interceptor"

function ctx(user: unknown, url: string): ExecutionContext {
  return {
    getType: () => "http",
    switchToHttp: () => ({ getRequest: () => ({ user, originalUrl: url, url }) }),
  } as unknown as ExecutionContext
}

const next = { handle: jest.fn(() => of("ok")) }

describe("MfaEnforcementInterceptor (SEC-05-bis)", () => {
  const interceptor = new MfaEnforcementInterceptor()

  beforeEach(() => next.handle.mockClear())

  it("blocks a privileged user without verified MFA on any business route", () => {
    expect(() =>
      interceptor.intercept(ctx({ role: "OWNER", mfaVerified: false }, "/api/v1/finance/expenses"), next),
    ).toThrow(ForbiddenException)
    expect(() =>
      interceptor.intercept(ctx({ role: "ADMIN", mfaVerified: false }, "/api/v1/orders"), next),
    ).toThrow(ForbiddenException)
  })

  it("blocks reads too (privileged access fully gated)", () => {
    expect(() =>
      interceptor.intercept(ctx({ role: "FINANCE", mfaVerified: false }, "/api/v1/audit"), next),
    ).toThrow(ForbiddenException)
  })

  it("allows the MFA enrollment and session-management routes", () => {
    for (const path of [
      "/api/v1/auth/mfa/generate",
      "/api/v1/auth/mfa/confirm",
      "/api/v1/auth/refresh",
      "/api/v1/auth/logout",
      "/api/v1/auth/logout-all",
      "/api/v1/auth/me",
      "/api/v1/auth/sessions",
      "/api/v1/auth/sessions/abc-123",
    ]) {
      expect(() =>
        interceptor.intercept(ctx({ role: "OWNER", mfaVerified: false }, path), next),
      ).not.toThrow()
    }
  })

  it("does NOT exempt account creation or force-logout under /auth", () => {
    expect(() =>
      interceptor.intercept(ctx({ role: "OWNER", mfaVerified: false }, "/api/v1/auth/register"), next),
    ).toThrow(ForbiddenException)
    expect(() =>
      interceptor.intercept(ctx({ role: "OWNER", mfaVerified: false }, "/api/v1/auth/force-logout"), next),
    ).toThrow(ForbiddenException)
  })

  it("lets a privileged user WITH verified MFA through", () => {
    expect(() =>
      interceptor.intercept(ctx({ role: "OWNER", mfaVerified: true }, "/api/v1/finance/expenses"), next),
    ).not.toThrow()
  })

  it("ignores non-privileged roles and unauthenticated requests", () => {
    expect(() =>
      interceptor.intercept(ctx({ role: "MECHANIC", mfaVerified: true }, "/api/v1/orders/my"), next),
    ).not.toThrow()
    expect(() =>
      interceptor.intercept(ctx(undefined, "/api/v1/public/orders/lookup"), next),
    ).not.toThrow()
  })
})
