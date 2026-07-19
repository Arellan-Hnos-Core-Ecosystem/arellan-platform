"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const auth_service_1 = require("../auth.service");
const USER_ID = "user-1";
const CURRENT = "OldPassw0rd!";
function buildService(accountOverride = {}) {
    const account = {
        id: USER_ID,
        name: "Test User",
        role: "FINANCE",
        passwordHash: bcrypt.hashSync(CURRENT, 12),
        ...accountOverride,
    };
    const prisma = {
        account: { findUnique: jest.fn().mockResolvedValue(account), update: jest.fn().mockResolvedValue({}) },
        refreshToken: { updateMany: jest.fn().mockResolvedValue({ count: 2 }) },
        auditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    const redis = { client: { scan: jest.fn().mockResolvedValue(["0", []]), del: jest.fn() } };
    const service = new auth_service_1.AuthService(prisma, {}, {}, redis);
    return { service, prisma };
}
describe("AuthService.changePassword (SEC-19 / SEC-15)", () => {
    it("rejects when the current password is wrong", async () => {
        const { service, prisma } = buildService();
        await expect(service.changePassword(USER_ID, { currentPassword: "wrong", newPassword: "BrandNew1!" })).rejects.toThrow(common_1.UnauthorizedException);
        expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
    });
    it("rejects when the new password equals the current one (SEC-15)", async () => {
        const { service, prisma } = buildService();
        await expect(service.changePassword(USER_ID, { currentPassword: CURRENT, newPassword: CURRENT })).rejects.toThrow(common_1.UnauthorizedException);
        expect(prisma.account.update).not.toHaveBeenCalled();
    });
    it("revokes all refresh tokens and audits on a successful change (SEC-19)", async () => {
        const { service, prisma } = buildService();
        await service.changePassword(USER_ID, { currentPassword: CURRENT, newPassword: "BrandNew1!" });
        expect(prisma.account.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: USER_ID }, data: expect.objectContaining({ passwordHash: expect.any(String) }) }));
        expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { accountId: USER_ID, revoked: false }, data: { revoked: true } }));
        expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: "PASSWORD_CHANGED" }) }));
    });
});
//# sourceMappingURL=change-password.spec.js.map