import { Controller, Get, Post, Param, Query, Body, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiHeader } from "@nestjs/swagger"
import { PrismaService } from "../prisma/prisma.service"
import { DeviceAuthGuard } from "../guards/device-auth.guard"
import { OrdersService } from "../../modules/orders/orders.service"
import { ProcessBiometricAttendanceUseCase } from "../../modules/attendance/use-cases/process-biometric-attendance.use-case"
import { CameraCaptureDto } from "../../modules/orders/dto/orders.dto"
import { BiometricCheckInDto } from "../../modules/attendance/dto/attendance.dto"

@ApiTags("Public")
@Controller("public")
export class PublicController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly processBiometricAttendanceUseCase: ProcessBiometricAttendanceUseCase,
  ) {}

  @Get("orders/lookup")
  @ApiOperation({
    summary: "Consultar estado de orden por placa o codigo (publico)",
    description: "Endpoint de acceso publico sin JWT para que clientes consulten el estado de su vehiculo por placa o codigo OT desde el portal web. Retorna datos del vehiculo y la OT mas reciente con historial de estados.",
  })
  @ApiQuery({ name: "plate", description: "Placa del vehiculo", required: false, example: "ABC-123" })
  @ApiQuery({ name: "code", description: "Codigo de OT", required: false, example: "OT-2026-0001" })
  @ApiResponse({ status: 200, description: "Resultado de busqueda con datos del vehiculo y OT" })
  async lookup(@Query("plate") plate?: string, @Query("code") code?: string) {
    if (plate) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { plate: plate.toUpperCase().trim() }, include: { workOrders: { orderBy: { createdAt: "desc" }, take: 1, include: { statusHistory: { orderBy: { timestamp: "desc" } } } } } })
      if (!vehicle) return { found: false, message: "Vehiculo no encontrado" }
      const order = vehicle.workOrders[0]
      if (!order) return { found: true, vehicle: { plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, color: vehicle.color }, activeOrder: null }
      return { found: true, vehicle: { plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, color: vehicle.color }, order: { id: order.id, number: order.number, status: order.status, description: order.description, receivedAt: order.receivedAt, estimatedDelivery: order.estimatedDelivery, deliveredAt: order.deliveredAt, statusHistory: order.statusHistory.map((h) => ({ status: h.status, timestamp: h.timestamp })) } }
    }
    if (code) {
      const order = await this.prisma.workOrder.findUnique({ where: { number: code.toUpperCase().trim() }, include: { vehicle: true, statusHistory: { orderBy: { timestamp: "desc" } } } })
      if (!order) return { found: false, message: "Orden de trabajo no encontrada" }
      return { found: true, vehicle: { plate: order.vehicle.plate, brand: order.vehicle.brand, model: order.vehicle.model, year: order.vehicle.year, color: order.vehicle.color }, order: { id: order.id, number: order.number, status: order.status, description: order.description, receivedAt: order.receivedAt, estimatedDelivery: order.estimatedDelivery, deliveredAt: order.deliveredAt, statusHistory: order.statusHistory.map((h) => ({ status: h.status, timestamp: h.timestamp })) } }
    }
    return { found: false, message: "Proporciona una placa (plate) o codigo de OT (code)" }
  }

  @Get("orders/:id")
  @ApiOperation({ summary: "Detalle de orden (publico)", description: "Endpoint publico para ver el detalle completo de una OT por su ID, incluyendo diagnostico y costos." })
  @ApiParam({ name: "id", description: "ID de la OT (UUID v4)" })
  @ApiResponse({ status: 200, description: "Detalle de la OT" })
  async getOrder(@Param("id") id: string) {
    const order = await this.prisma.workOrder.findUnique({ where: { id }, include: { vehicle: true, statusHistory: { orderBy: { timestamp: "desc" } } } })
    if (!order) return { found: false, message: "Orden de trabajo no encontrada" }
    return { found: true, vehicle: { plate: order.vehicle.plate, brand: order.vehicle.brand, model: order.vehicle.model, year: order.vehicle.year, color: order.vehicle.color }, order: { id: order.id, number: order.number, status: order.status, description: order.description, diagnosis: order.diagnosis, totalCost: order.totalCost, receivedAt: order.receivedAt, estimatedDelivery: order.estimatedDelivery, deliveredAt: order.deliveredAt, statusHistory: order.statusHistory.map((h) => ({ status: h.status, timestamp: h.timestamp })) } }
  }

  @Get("orders/number/:orderNumber/status")
  @ApiOperation({ summary: "Estado de OT por numero (publico)", description: "Endpoint publico que retorna el estado actual y timeline de una OT por su numero. Incluye datos del vehiculo y cliente." })
  @ApiParam({ name: "orderNumber", description: "Numero de OT", example: "OT-2026-0001" })
  @ApiResponse({ status: 200, description: "Estado actual y timeline de la OT" })
  async getOrderByNumber(@Param("orderNumber") orderNumber: string) {
    const order = await this.prisma.workOrder.findUnique({ where: { number: orderNumber.toUpperCase().trim() }, select: { number: true, status: true, description: true, receivedAt: true, estimatedDelivery: true, deliveredAt: true, vehicle: { select: { plate: true, brand: true, model: true, year: true, color: true } }, client: { select: { firstName: true } }, statusHistory: { select: { status: true, timestamp: true }, orderBy: { timestamp: "asc" } } } })
    if (!order) return { found: false, message: "Orden de trabajo no encontrada" }
    return { found: true, order }
  }

  @Post("iot/attendance/biometric")
  @UseGuards(DeviceAuthGuard)
  @ApiTags("IoT")
  @ApiHeader({ name: "x-device-key", description: "Secreto compartido del bridge IoT (IOT_BRIDGE_SHARED_SECRET)" })
  @ApiOperation({
    summary: "Check-in biometrico ZKTeco (arellan-hardware-iot)",
    description: "Recibe eventos de asistencia sanitizados por ZktecoDeviceAdapter. Compara el timestamp contra Settings.attendance_schedule; si excede la tolerancia, marca el registro como LATE e injerta la penalizacion salarial en AuditLog de forma atomica (ProcessBiometricAttendanceUseCase).",
  })
  @ApiResponse({ status: 201, description: "Asistencia procesada" })
  @ApiResponse({ status: 401, description: "Credencial de dispositivo invalida" })
  @ApiResponse({ status: 404, description: "No existe personal con ese DNI" })
  async biometricAttendance(@Body() dto: BiometricCheckInDto) {
    return this.processBiometricAttendanceUseCase.execute(dto)
  }

  @Post("iot/orders/:id/photos/camera-capture")
  @UseGuards(DeviceAuthGuard)
  @ApiTags("IoT")
  @ApiHeader({ name: "x-device-key", description: "Secreto compartido del bridge IoT (IOT_BRIDGE_SHARED_SECRET)" })
  @ApiOperation({
    summary: "Captura ONVIF vinculada a OT (arellan-hardware-iot)",
    description: "Recibe el snapshot capturado por OnvifCameraClient al validar una placa en arellan-mechanic-ui. Calcula el hash SHA-256 en el servidor y vincula la foto a una posicion de check-in obligatoria de la OT (Regla Anti-Fraude #8).",
  })
  @ApiParam({ name: "id", description: "ID de la OT (UUID v4)" })
  @ApiResponse({ status: 201, description: "Foto vinculada a la OT" })
  @ApiResponse({ status: 400, description: "Posicion invalida" })
  @ApiResponse({ status: 401, description: "Credencial de dispositivo invalida" })
  @ApiResponse({ status: 404, description: "OT no encontrada" })
  async cameraCapture(@Param("id") id: string, @Body() dto: CameraCaptureDto) {
    return this.ordersService.captureCameraPhoto(id, dto)
  }
}
