"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    process.env.TZ = process.env.TZ ?? "America/Lima";
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const logger = new common_1.Logger("Bootstrap");
    const isProduction = config.get("NODE_ENV") === "production";
    config.getOrThrow("JWT_REFRESH_SECRET");
    app.use((0, helmet_1.default)({
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
    }));
    const defaultCorsOrigins = config.get("NODE_ENV") === "production"
        ? "https://app.arellan.pe"
        : "http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005,http://localhost:3006,http://localhost:3007";
    app.enableCors({
        origin: config.get("CORS_ORIGINS", defaultCorsOrigins).split(","),
        credentials: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    });
    app.setGlobalPrefix("api/v1");
    app
        .getHttpAdapter()
        .getInstance()
        .get("/", (_req, res) => res.type("html").send(`<!DOCTYPE html>
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
`));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    const swaggerEnabled = !isProduction || config.get("SWAGGER_ENABLED") === "true";
    if (swaggerEnabled) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
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
            .build();
        const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup("api/docs", app, swaggerDocument, {
            swaggerOptions: { persistAuthorization: true, docExpansion: "list", filter: true }
        });
    }
    const port = config.get("PORT", 3001);
    await app.listen(port);
    logger.log(`Arellan Platform v2.0 running on http://localhost:${port}`);
    if (swaggerEnabled)
        logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
    logger.log(`WebSocket available on ws://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map