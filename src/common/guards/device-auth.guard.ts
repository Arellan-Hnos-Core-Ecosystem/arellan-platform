import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { timingSafeEqual } from "crypto"

// Guarda los endpoints de integracion IoT (arellan-hardware-iot): el bridge
// no tiene JWT de usuario, se autentica con un secreto compartido por header.
@Injectable()
export class DeviceAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const provided: string | undefined = request.headers["x-device-key"]
    const expected = this.config.get<string>("IOT_BRIDGE_SHARED_SECRET")

    if (!expected) {
      throw new ForbiddenException("IOT_BRIDGE_SHARED_SECRET no configurado en el servidor")
    }

    if (!provided || !DeviceAuthGuard.safeCompare(provided, expected)) {
      throw new UnauthorizedException("Credencial de dispositivo IoT invalida")
    }

    return true
  }

  private static safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if (bufA.length !== bufB.length) return false
    return timingSafeEqual(bufA, bufB)
  }
}
