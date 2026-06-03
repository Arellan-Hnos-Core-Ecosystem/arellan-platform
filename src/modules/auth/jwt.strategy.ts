import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import { AuthUser } from "./auth.service"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get("JWT_ACCESS_SECRET") || "fallback-secret",
    })
  }

  validate(payload: AuthUser): AuthUser {
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      mfaVerified: payload.mfaVerified,
    }
  }
}
