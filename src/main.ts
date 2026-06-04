import { NestFactory } from "@nestjs/core"
import { ValidationPipe, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import helmet from "helmet"
import { IoAdapter } from "@nestjs/platform-socket.io"
import { AppModule } from "./app.module"
import { HttpExceptionFilter } from "./common/filters/http-exception.filter"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const logger = new Logger("Bootstrap")

  app.use(helmet())

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

  app.useWebSocketAdapter(new IoAdapter(app))

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Clinica Automotriz Arellan Hnos -- API")
    .setDescription("API REST para gestion de taller automotriz. Modulos: Auth, Ordenes de Trabajo, Finanzas, Inventario, Personal, Asistencia, Compras, Comisiones, Cotizaciones, Facturacion, Pagos, Auditoria, Configuraciones")
    .setVersion("2.0.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" }, "access-token")
    .addTag("Auth", "Autenticacion y sesiones")
    .addTag("Orders", "Ordenes de trabajo")
    .addTag("Finance", "Caja, transacciones, gastos")
    .addTag("Inventory", "Inventario y movimientos")
    .addTag("Clients", "Clientes")
    .addTag("Vehicles", "Vehiculos")
    .addTag("Personnel", "Personal y perfil")
    .addTag("Attendance", "Asistencia")
    .addTag("Payments", "Pagos y metodos")
    .addTag("Invoices", "Facturacion")
    .addTag("Purchases", "Compras a proveedores")
    .addTag("Quotes", "Cotizaciones")
    .addTag("Commissions", "Comisiones")
    .addTag("Audit", "Auditoria y logs")
    .addTag("Settings", "Configuraciones")
    .addServer("http://localhost:3001", "Desarrollo Local")
    .build()

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup("api/docs", app, swaggerDocument, {
    swaggerOptions: { persistAuthorization: true, docExpansion: "list", filter: true }
  })

  const port = config.get("PORT", 3001)
  await app.listen(port)
  logger.log(`Arellan Platform v2.0 running on http://localhost:${port}`)
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`)
  logger.log(`WebSocket available on ws://localhost:${port}`)
}

bootstrap()
