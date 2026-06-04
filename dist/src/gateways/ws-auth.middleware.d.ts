import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";
import type { AuthUser } from "../modules/auth/auth.service";
export interface AuthenticatedSocket extends Socket {
    user: AuthUser;
}
export declare class WsAuthMiddleware {
    private readonly jwt;
    private readonly logger;
    constructor(jwt: JwtService);
    use(socket: Socket, next: (err?: Error) => void): Promise<void>;
}
