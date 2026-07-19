import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { createHmac, timingSafeEqual } from "crypto"

// SEC-03: el webhook de confirmación de pago (POST /webhooks/payment/confirm)
// no tenía autenticación ni firma; cualquiera que conociera un `qrToken` válido
// (viaja al teléfono del cliente en el QR, ventana de 7 min) podía confirmar un
// pago inexistente, marcar la OT como pagada y liberar la entrega.
//
// Como no existe una pasarela real (Culqi) que firme el webhook, se exige una
// firma HMAC-SHA256 del `qrToken` con un secreto compartido
// (`PAYMENT_WEBHOOK_SECRET`). El atacante conoce el token pero no el secreto, por
// lo que no puede forjar la firma. Fail-closed: sin secreto configurado en el
// servidor se rechaza toda petición (nunca se acepta un pago sin verificar).
@Injectable()
export class PaymentWebhookGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()

    const secret = this.config.get<string>("PAYMENT_WEBHOOK_SECRET")
    if (!secret) {
      throw new ForbiddenException(
        "PAYMENT_WEBHOOK_SECRET no configurado en el servidor",
      )
    }

    const provided: unknown = req.headers["x-webhook-signature"]
    const qrToken: unknown = req.body?.qrToken
    if (typeof provided !== "string" || typeof qrToken !== "string" || !qrToken) {
      throw new UnauthorizedException("Firma de webhook ausente o inválida")
    }

    const expected = createHmac("sha256", secret).update(qrToken).digest("hex")
    if (!PaymentWebhookGuard.safeEqual(provided, expected)) {
      throw new UnauthorizedException("Firma de webhook inválida")
    }

    return true
  }

  private static safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if (bufA.length !== bufB.length) return false
    return timingSafeEqual(bufA, bufB)
  }
}
