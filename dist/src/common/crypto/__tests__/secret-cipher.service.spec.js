"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const secret_cipher_service_1 = require("../secret-cipher.service");
function buildCipher(key) {
    const config = {
        getOrThrow: jest.fn((name) => {
            if (key === undefined)
                throw new Error(`Missing ${name}`);
            return key;
        }),
    };
    return new secret_cipher_service_1.SecretCipherService(config);
}
describe("SecretCipherService (SEC-06)", () => {
    it("fails closed when MFA_ENC_KEY is missing", () => {
        expect(() => buildCipher(undefined)).toThrow(/MFA_ENC_KEY/);
    });
    it("round-trips a TOTP secret", () => {
        const cipher = buildCipher("unit-test-key");
        const secret = "JBSWY3DPEHPK3PXP";
        const stored = cipher.encrypt(secret);
        expect(stored.startsWith("v1:")).toBe(true);
        expect(stored).not.toContain(secret);
        expect(cipher.decrypt(stored)).toBe(secret);
    });
    it("produces distinct ciphertexts for the same plaintext (unique IV)", () => {
        const cipher = buildCipher("unit-test-key");
        expect(cipher.encrypt("SAME")).not.toBe(cipher.encrypt("SAME"));
    });
    it("rejects tampered ciphertext (GCM auth)", () => {
        const cipher = buildCipher("unit-test-key");
        const stored = cipher.encrypt("JBSWY3DPEHPK3PXP");
        const parts = stored.split(":");
        const ct = Buffer.from(parts[3], "base64");
        ct[0] = ct[0] ^ 0xff;
        parts[3] = ct.toString("base64");
        expect(() => cipher.decrypt(parts.join(":"))).toThrow();
    });
    it("rejects ciphertext encrypted under another key", () => {
        const a = buildCipher("key-a");
        const b = buildCipher("key-b");
        expect(() => b.decrypt(a.encrypt("SECRET"))).toThrow();
    });
    it("passes through legacy plaintext values (pre-SEC-06 rows)", () => {
        const cipher = buildCipher("unit-test-key");
        expect(cipher.decrypt("LEGACYPLAINSECRET")).toBe("LEGACYPLAINSECRET");
    });
});
//# sourceMappingURL=secret-cipher.service.spec.js.map