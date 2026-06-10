import { Injectable, NotFoundException, ConflictException, HttpException, HttpStatus } from "@nestjs/common"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import { PrismaService } from "../../../common/prisma/prisma.service"
import { RedisService } from "../../../common/redis/redis.service"
import { QueueName } from "../../../queues/queue-names.enum"

const CACHE_PREFIX = "inventory"

@Injectable()
export class DispatchPartsToOrderUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectQueue(QueueName.ALERT_DISPATCHER) private readonly alertQueue: Queue,
  ) {}

  async execute(orderId: string, params: {
    items: Array<{ itemId: string; quantity: number }>
    requestedBy: string
    requestedByName: string
  }) {
    const order = await this.prisma.workOrder.findUnique({
      where: { id: orderId },
      select: { id: true, number: true, status: true },
    })
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")

    if (order.status !== "IN_PROGRESS") {
      throw new HttpException(
        {
          statusCode: 422,
          error: "INVENTORY_NO_ACTIVE_ORDER",
          message: `Solo se puede despachar repuestos a OT en estado IN_PROGRESS. OT ${order.number} está en estado ${order.status}.`,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      )
    }

    const lowStockItems: Array<{ itemId: string; itemName: string; sku: string; currentStock: number; minStock: number }> = []

    const parts = await this.prisma.$transaction(async (tx) => {
      const created = []

      for (const req of params.items) {
        const item = await tx.inventoryItem.findUnique({ where: { id: req.itemId } })
        if (!item) throw new NotFoundException(`Repuesto ${req.itemId} no encontrado en inventario`)
        if (item.stock < req.quantity) {
          throw new ConflictException(
            `Stock insuficiente para ${item.name}. Disponible: ${item.stock}, solicitado: ${req.quantity}`,
          )
        }

        const newStock = item.stock - req.quantity

        const part = await tx.workOrderPart.create({
          data: { orderId, itemId: req.itemId, quantity: req.quantity, unitPrice: item.unitPrice },
        })

        await tx.inventoryMovement.create({
          data: {
            itemId: req.itemId,
            type: "OUT",
            quantity: req.quantity,
            orderId,
            authorizedBy: params.requestedBy,
            unitCost: item.costPrice,
            justification: `Despacho para OT ${order.number}`,
          },
        })

        await tx.inventoryItem.update({
          where: { id: req.itemId },
          data: { stock: newStock },
        })

        await tx.workOrderEvent.create({
          data: {
            workOrderId: orderId,
            event: "PART_REQUESTED",
            description: `${params.requestedByName} despachó: ${item.name} x${req.quantity} → OT ${order.number}`,
            metadata: { itemId: item.id, sku: item.sku, quantity: req.quantity, newStock },
            userId: params.requestedBy,
          },
        })

        if (newStock < item.minStock) {
          lowStockItems.push({
            itemId: item.id,
            itemName: item.name,
            sku: item.sku,
            currentStock: newStock,
            minStock: item.minStock,
          })
        }

        created.push(part)
      }

      return created
    })

    // Redis: invalidate per-item caches
    await Promise.allSettled(
      params.items.map((req) => this.redis.del(`${CACHE_PREFIX}:item:${req.itemId}`)),
    )
    await Promise.allSettled([
      this.redis.del(`${CACHE_PREFIX}:valuation`),
      this.redis.del(`${CACHE_PREFIX}:critical`),
    ])

    // BullMQ: enqueue low-stock alerts (post-transaction, non-blocking)
    await Promise.allSettled(
      lowStockItems.map((alert) =>
        this.alertQueue.add("low-stock-alert", {
          ...alert,
          workOrderId: orderId,
          workOrderNumber: order.number,
          triggeredAt: new Date().toISOString(),
        }),
      ),
    )

    return { success: true, parts, lowStockAlerts: lowStockItems.length }
  }
}
