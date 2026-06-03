"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const helmet = require("helmet");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const logger = new common_1.Logger("Bootstrap");
    app.use(helmet.default());
    app.enableCors({
        origin: config.get("NODE_ENV") === "production"
            ? ["https://app.arellan.pe", "https://taller.arellan.pe", "https://mobile.arellan.pe", "https://cliente.arellan.pe"]
            : true,
        credentials: true,
    });
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const port = config.get("PORT", 3000);
    await app.listen(port);
    logger.log(`Arellan Platform running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map