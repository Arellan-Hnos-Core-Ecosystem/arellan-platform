"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const auth_service_1 = require("../auth.service");
const RAW_TOKEN = "raw-refresh-token";
const TOKEN_HASH = (0, crypto_1.createHash)("sha256").update(RAW_TOKEN).digest("hex");
const ACCOUNT = { id: "acc-1", email: "sofia@x.pe", role: "FINANCE", name: "Sofía", mfaEnabled: true };
function buildService(stored, jwtPayload = { sub: "acc-1", mfaVerified: true }) {
    const prisma = {
        refreshToken: {
            findUnique: jest.fn().mockResolvedValue(stored),
            update: jest.fn().mockResolvedValue({}),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            create: jest.fn().mockResolvedValue({}),
        },
        auditLog: { create: jest.fn().mockResolvedValue({}) },
        client: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    const jwt = {
        verify: jest.fn().mockReturnValue(jwtPayload),
        sign: jest.fn().mockReturnValue("signed-token"),
    };
    const config = { get: jest.fn((_k, d) => d ?? "secret") };
    const redis = {
        set: jest.fn().mockResolvedValue("OK"),
        del: jest.fn().mockResolvedValue(1),
        client: { scan: jest.fn().mockResolvedValue(["0", []]), del: jest.fn(), mget: jest.fn() },
    };
    const gateway = { disconnectUser: jest.fn() };
    const service = new auth_service_1.AuthService(prisma, jwt, config, redis, { encrypt: (v) => v, decrypt: (v) => v }, gateway);
    return { service, prisma, jwt, gateway };
}
describe("AuthService.refreshToken (SEC-06 hash + reuse detection, FUN-19 MFA claim)", () => {
    it("looks up the stored token by SHA-256 hash, not raw value", async () => {
        const { service, prisma } = buildService({
            id: "rt-1", token: TOKEN_HASH, revoked: false,
            expiresAt: new Date(Date.now() + 86400000), account: ACCOUNT,
            ipAddress: null, deviceInfo: null,
        });
        await service.refreshToken(RAW_TOKEN);
        expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { token: TOKEN_HASH } }));
    });
    it("preserves the signed mfaVerified claim across rotation (FUN-19)", async () => {
        const { service, jwt } = buildService({
            id: "rt-1", token: TOKEN_HASH, revoked: false,
            expiresAt: new Date(Date.now() + 86400000), account: ACCOUNT,
            ipAddress: null, deviceInfo: null,
        });
        await service.refreshToken(RAW_TOKEN);
        const accessPayload = jwt.sign.mock.calls[0][0];
        expect(accessPayload.mfaVerified).toBe(true);
        const refreshPayload = jwt.sign.mock.calls[1][0];
        expect(refreshPayload.mfaVerified).toBe(true);
    });
    it("downgrades mfaVerified when the refresh JWT does not carry the claim", async () => {
        const { service, jwt } = buildService({
            id: "rt-1", token: TOKEN_HASH, revoked: false,
            expiresAt: new Date(Date.now() + 86400000), account: ACCOUNT,
            ipAddress: null, deviceInfo: null,
        }, { sub: "acc-1" });
        await service.refreshToken(RAW_TOKEN);
        const accessPayload = jwt.sign.mock.calls[0][0];
        expect(accessPayload.mfaVerified).toBe(false);
    });
    it("rejects an unknown token (hash mismatch = altered or fabricated)", async () => {
        const { service } = buildService(null);
        await expect(service.refreshToken(RAW_TOKEN)).rejects.toThrow(common_1.UnauthorizedException);
    });
    it("treats reuse of a rotated token as theft: revokes ALL sessions + SECURITY_ALERT", async () => {
        const { service, prisma, gateway } = buildService({
            id: "rt-1", token: TOKEN_HASH, revoked: true,
            expiresAt: new Date(Date.now() + 86400000),
            account: { ...ACCOUNT }, accountId: "acc-1", ipAddress: "1.2.3.4", deviceInfo: null,
        });
        await expect(service.refreshToken(RAW_TOKEN)).rejects.toThrow(common_1.UnauthorizedException);
        expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { revoked: true } }));
        expect(gateway.disconnectUser).toHaveBeenCalled();
        expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ action: "REFRESH_TOKEN_REUSE_DETECTED", severity: "SECURITY_ALERT" }),
        }));
    });
});
//# sourceMappingURL=refresh-rotation.spec.js.map