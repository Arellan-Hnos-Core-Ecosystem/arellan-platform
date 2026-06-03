import { NestFactory } from "@nestjs/core"
import { ValidationPipe, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import * as helmet from "helmet"
import { AppModule } from "./app.module"
import { HttpExceptionFilter } from "./common/filters/http-exception.filter"
import { WsAuthMiddleware } from "./gateways/ws-auth.middleware"
import { OrdersGateway } from "./gateways/orders.gateway"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const logger = new Logger("Bootstrap")

  app.use(helmet.default())

  app.enableCors({
    origin:
      config.get("NODE_ENV") === "production"
        ? config
            .get<string>("CORS_ORIGINS", "https://app.arellan.pe")
            .split(",")
        : true,
    credentials: true,
  })

  app.setGlobalPrefix("api/v1")

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  app.useGlobalFilters(new HttpExceptionFilter())

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Clínica Automotriz Arellan Hnos — API")
    .setDescription("API REST para gestión de taller automotriz. Módulos: Auth, Órdenes de Trabajo, Finanzas, Inventario, Personal, Asistencia, Compras, Comisiones, Cotizaciones, Facturación, Pagos, Auditoría, Configuraciones")
    .setVersion("2.0.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" }, "access-token")
    .addTag("Auth", "Autenticación y sesiones")
    .addTag("Orders", "Órdenes de trabajo")
    .addTag("Finance", "Caja, transacciones, gastos")
    .addTag("Inventory", "Inventario y movimientos")
    .addTag("Clients", "Clientes")
    .addTag("Vehicles", "Vehículos")
    .addTag("Personnel", "Personal y perfil")
    .addTag("Attendance", "Asistencia")
    .addTag("Payments", "Pagos y métodos")
    .addTag("Invoices", "Facturación")
    .addTag("Purchases", "Compras a proveedores")
    .addTag("Quotes", "Cotizaciones")
    .addTag("Commissions", "Comisiones")
    .addTag("Audit", "Auditoría y logs")
    .addTag("Settings", "Configuraciones")
    .addServer("http://localhost:3000", "Desarrollo Local")
    .build()

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup("api/docs", app, swaggerDocument, {
    swaggerOptions: { persistAuthorization: true, docExpansion: "list", filter: true }
  })

  const wsAdapter = app.getHttpAdapter()
  if (wsAdapter && typeof (wsAdapter as any).getHttpServer === "function") {
    const httpServer = (wsAdapter as any).getHttpServer()
    const ordersGateway = app.get(OrdersGateway)
    const wsAuthMiddleware = app.get(WsAuthMiddleware)

    ordersGateway.server.use((socket: any, next: (err?: Error) => void) =>
      wsAuthMiddleware.use(socket, next),
    )
  }

  const port = config.get("PORT", 3001)
  await app.listen(port)
  logger.log(`Arellan Platform v2.0 running on http://localhost:${port}`)
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`)
  logger.log(`WebSocket Gateway ready on ws://localhost:${port}/ws/orders`)
}

bootstrap()
