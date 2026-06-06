import { Controller, Post, Body, BadRequestException } from "@nestjs/common"
import { FinanceService } from "./finance.service"

@Controller("webhooks")
export class PaymentWebhookController {
  constructor(private readonly financeService: FinanceService) {}

  @Post("payment/confirm")
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
