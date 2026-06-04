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
var WsAuthMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsAuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let WsAuthMiddleware = WsAuthMiddleware_1 = class WsAuthMiddleware {
    jwt;
    logger = new common_1.Logger(WsAuthMiddleware_1.name);
    constructor(jwt) {
        this.jwt = jwt;
    }
    async use(socket, next) {
        try {
            const token = socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.replace("Bearer ", "");
            if (!token) {
                return next(new Error("Authentication token required"));
            }
            const payload = this.jwt.verify(token);
            socket.user = payload;
            next();
        }
        catch (err) {
            this.logger.warn(`WS auth failed: ${err.message}`);
            next(new Error("Invalid authentication token"));
        }
    }
};
exports.WsAuthMiddleware = WsAuthMiddleware;
exports.WsAuthMiddleware = WsAuthMiddleware = WsAuthMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], WsAuthMiddleware);
//# sourceMappingURL=ws-auth.middleware.js.map