import { Injectable, ExecutionContext, UnauthorizedException, Logger } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  private readonly logger = new Logger(JwtAuthGuard.name)

  handleRequest(err: any, user: any, info: any, _context: ExecutionContext) {
    if (err || !user) {
      this.logger.warn(`Auth failed: ${info?.message || "no user"}`)
      throw err || new UnauthorizedException("Token invalido o expirado")
    }
    return user
  }
}
