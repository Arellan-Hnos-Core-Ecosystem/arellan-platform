import { NestFactory } from "@nestjs/core"
import { ValidationPipe, Logger } from "@nestjs/common"
import type { Request, Response } from "express"
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

  const isProduction = config.get("NODE_ENV") === "production"

  app.use(
    helmet({
      // CSP estricto solo en produccion; en desarrollo local se desactiva para
      // no interferir con las herramientas de inspeccion del navegador
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", "data:"],
              connectSrc: ["'self'"],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
      frameguard: { action: "deny" },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      referrerPolicy: { policy: "no-referrer" },
      noSniff: true,
    }),
  )

  const defaultCorsOrigins =
    config.get("NODE_ENV") === "production"
      ? "https://app.arellan.pe"
      : "http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005,http://localhost:3006,http://localhost:3007"

  app.enableCors({
    origin: config.get<string>("CORS_ORIGINS", defaultCorsOrigins).split(","),
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  })

  app.setGlobalPrefix("api/v1")

  // Raiz fuera del prefijo api/v1: micro-documento HTML valido (lang/title/
  // viewport) para que los DevTools del navegador no auditen el status como
  // documento defectuoso. El JSON de salud para monitores vive en /api/v1/health.
  app
    .getHttpAdapter()
    .getInstance()
    .get("/", (_req: Request, res: Response) =>
      res.type("html").send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Arellan Core API - Status</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: monospace;
      background-color: #0f172a;
      color: #38bdf8;
      padding: 20px;
    }
    #json-response {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <pre id="json-response">{"status":"online","service":"arellan-core-api","timestamp":"${new Date().toISOString()}"}</pre>
</body>
</html>
`),
    )

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
    .addTag("IoT", "Integracion con hardware (arellan-hardware-iot): biometria ZKTeco y camaras ONVIF")
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
