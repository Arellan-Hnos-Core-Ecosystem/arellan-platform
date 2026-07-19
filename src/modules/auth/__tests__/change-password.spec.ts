import { UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import * as bcrypt from "bcryptjs"
import { AuthService } from "../auth.service"
import { PrismaService } from "../../../common/prisma/prisma.service"
import { RedisService } from "../../../common/redis/redis.service"
import { SecretCipherService } from "../../../common/crypto/secret-cipher.service"
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway"

const USER_ID = "user-1"
const CURRENT = "OldPassw0rd!"

function buildService(accountOverride: Record<string, unknown> = {}) {
  const account = {
    id: USER_ID,
    name: "Test User",
    role: "FINANCE",
    passwordHash: bcrypt.hashSync(CURRENT, 12),
    ...accountOverride,
  }
  const prisma = {
    account: { findUnique: jest.fn().mockResolvedValue(account), update: jest.fn().mockResolvedValue({}) },
    refreshToken: { updateMany: jest.fn().mockResolvedValue({ count: 2 }) },
    auditLog: { create: jest.fn().mockResolvedValue({}) },
  }
  const redis = { client: { scan: jest.fn().mockResolvedValue(["0", []]), del: jest.fn() } }
  const cipher = { encrypt: jest.fn((v: string) => `v1:enc:${v}`), decrypt: jest.fn((v: string) => v) }
  const gateway = { disconnectUser: jest.fn() }
  const service = new AuthService(
    prisma as unknown as PrismaService,
    {} as unknown as JwtService,
    {} as unknown as ConfigService,
    redis as unknown as RedisService,
    cipher as unknown as SecretCipherService,
    gateway as unknown as RealtimeGateway,
  )
  return { service, prisma, gateway }
}

describe("AuthService.changePassword (SEC-19 / SEC-15)", () => {
  it("rejects when the current password is wrong", async () => {
    const { service, prisma } = buildService()
    await expect(
      service.changePassword(USER_ID, { currentPassword: "wrong", newPassword: "BrandNew1!" }),
    ).rejects.toThrow(UnauthorizedException)
    expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled()
  })

  it("rejects when the new password equals the current one (SEC-15)", async () => {
    const { service, prisma } = buildService()
    await expect(
      service.changePassword(USER_ID, { currentPassword: CURRENT, newPassword: CURRENT }),
    ).rejects.toThrow(UnauthorizedException)
    expect(prisma.account.update).not.toHaveBeenCalled()
  })

  it("revokes all refresh tokens, disconnects sockets and audits on a successful change (SEC-19/SEC-24)", async () => {
    const { service, prisma, gateway } = buildService()
    await service.changePassword(USER_ID, { currentPassword: CURRENT, newPassword: "BrandNew1!" })

    expect(prisma.account.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: USER_ID }, data: expect.objectContaining({ passwordHash: expect.any(String) }) }),
    )
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { accountId: USER_ID, revoked: false }, data: { revoked: true } }),
    )
    expect(gateway.disconnectUser).toHaveBeenCalledWith(USER_ID)
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: "PASSWORD_CHANGED" }) }),
    )
  })
})
