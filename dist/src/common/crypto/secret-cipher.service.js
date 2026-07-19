"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SecretCipherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretCipherService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
let SecretCipherService = SecretCipherService_1 = class SecretCipherService {
    logger = new common_1.Logger(SecretCipherService_1.name);
    key;
    constructor(config) {
        const raw = config.getOrThrow("MFA_ENC_KEY");
        this.key = (0, crypto_1.scryptSync)(raw, "arellan-mfa-cipher-v1", 32);
    }
    encrypt(plaintext) {
        const iv = (0, crypto_1.randomBytes)(12);
        const cipher = (0, crypto_1.createCipheriv)("aes-256-gcm", this.key, iv);
        const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
        const tag = cipher.getAuthTag();
        return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
    }
    decrypt(stored) {
        if (!stored.startsWith("v1:")) {
            this.logger.warn("Secreto MFA legacy sin cifrar detectado; se re-cifrará en la próxima escritura");
            return stored;
        }
        const [, ivB64, tagB64, ctB64] = stored.split(":");
        const decipher = (0, crypto_1.createDecipheriv)("aes-256-gcm", this.key, Buffer.from(ivB64, "base64"));
        decipher.setAuthTag(Buffer.from(tagB64, "base64"));
        return Buffer.concat([
            decipher.update(Buffer.from(ctB64, "base64")),
            decipher.final(),
        ]).toString("utf8");
    }
};
exports.SecretCipherService = SecretCipherService;
exports.SecretCipherService = SecretCipherService = SecretCipherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SecretCipherService);
//# sourceMappingURL=secret-cipher.service.js.map