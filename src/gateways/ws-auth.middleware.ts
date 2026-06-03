import { Injectable, Logger } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Socket } from "socket.io"
import type { AuthUser } from "../modules/auth/auth.service"

export interface AuthenticatedSocket extends Socket {
  user: AuthUser
}

@Injectable()
export class WsAuthMiddleware {
  private readonly logger = new Logger(WsAuthMiddleware.name)

  constructor(private readonly jwt: JwtService) {}

  async use(socket: Socket, next: (err?: Error) => void) {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "")

      if (!token) {
        return next(new Error("Authentication token required"))
      }

      const payload = this.jwt.verify(token) as AuthUser
      ;(socket as AuthenticatedSocket).user = payload
      next()
    } catch (err) {
      this.logger.warn(`WS auth failed: ${(err as Error).message}`)
      next(new Error("Invalid authentication token"))
    }
  }
}
