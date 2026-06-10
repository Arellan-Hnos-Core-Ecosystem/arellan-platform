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
var DeviceAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
let DeviceAuthGuard = DeviceAuthGuard_1 = class DeviceAuthGuard {
    config;
    constructor(config) {
        this.config = config;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const provided = request.headers["x-device-key"];
        const expected = this.config.get("IOT_BRIDGE_SHARED_SECRET");
        if (!expected) {
            throw new common_1.ForbiddenException("IOT_BRIDGE_SHARED_SECRET no configurado en el servidor");
        }
        if (!provided || !DeviceAuthGuard_1.safeCompare(provided, expected)) {
            throw new common_1.UnauthorizedException("Credencial de dispositivo IoT invalida");
        }
        return true;
    }
    static safeCompare(a, b) {
        const bufA = Buffer.from(a);
        const bufB = Buffer.from(b);
        if (bufA.length !== bufB.length)
            return false;
        return (0, crypto_1.timingSafeEqual)(bufA, bufB);
    }
};
exports.DeviceAuthGuard = DeviceAuthGuard;
exports.DeviceAuthGuard = DeviceAuthGuard = DeviceAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DeviceAuthGuard);
//# sourceMappingURL=device-auth.guard.js.map