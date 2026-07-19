import { Controller, Post, Body, UseGuards, BadRequestException } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger"
import { FinanceService } from "./finance.service"
import { PaymentWebhookGuard } from "./guards/payment-webhook.guard"

@ApiTags("Finance")
@Controller("webhooks")
export class PaymentWebhookController {
  constructor(private readonly financeService: FinanceService) {}

  @Post("payment/confirm")
  // SEC-03: exige firma HMAC-SHA256 del qrToken (header x-webhook-signature)
  // verificada contra PAYMENT_WEBHOOK_SECRET. Fail-closed sin secreto.
  @UseGuards(PaymentWebhookGuard)
  @ApiHeader({
    name: "x-webhook-signature",
    description: "HMAC-SHA256 hex del qrToken firmado con PAYMENT_WEBHOOK_SECRET",
    required: true,
  })
  @ApiOperation({
    summary: "Confirmar pago (webhook firmado)",
    description:
      "Confirma un pago asociado a un qrToken vigente. Requiere firma HMAC-SHA256 del qrToken en el header x-webhook-signature. Idempotente por qrToken.",
  })
  @ApiResponse({ status: 201, description: "Pago confirmado o ya procesado" })
  @ApiResponse({ status: 400, description: "qrToken ausente, expirado o inválido" })
  @ApiResponse({ status: 401, description: "Firma de webhook ausente o inválida" })
  @ApiResponse({ status: 403, description: "PAYMENT_WEBHOOK_SECRET no configurado" })
  async confirmPayment(
    @Body() body: { qrToken: string; paymentMethod?: string; reference?: string },
  ) {
    if (!body.qrToken) throw new BadRequestException("qrToken es requerido")
    return this.financeService.confirmPaymentWebhook(
      body.qrToken,
      body.paymentMethod || "DYNAMIC_QR",
      body.reference,
    )
  }
}
