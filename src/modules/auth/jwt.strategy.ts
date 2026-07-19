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
      // SEC-02: sin fallback predecible. Si falta el secreto, el arranque falla
      // (getOrThrow) en vez de aceptar tokens firmados con "fallback-secret".
      secretOrKey: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
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
