"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const path_1 = require("path");
const fs_1 = require("fs");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const frontendDir = process.env.FRONTEND_DIR
        ? (0, path_1.resolve)(process.cwd(), process.env.FRONTEND_DIR)
        : (0, path_1.join)(__dirname, '../../../../frontend/dist');
    const hasFrontend = (0, fs_1.existsSync)(frontendDir);
    if (hasFrontend) {
        app.useStaticAssets(frontendDir);
    }
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            process.env.CORS_ORIGIN || '',
        ].filter(Boolean),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const port = process.env.PORT || 3000;
    await app.listen(port);
    if (hasFrontend) {
        app.getHttpAdapter().getInstance().get('*', (_req, res) => {
            res.sendFile((0, path_1.join)(frontendDir, 'index.html'));
        });
        console.log(`🚀 HiCAD running on http://localhost:${port}`);
    }
    else {
        console.log(`🚀 HiCAD Backend running on http://localhost:${port}/api`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map