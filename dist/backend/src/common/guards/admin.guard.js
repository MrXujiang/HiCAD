"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let AdminGuard = class AdminGuard {
    constructor(jwtService, config) {
        this.jwtService = jwtService;
        this.config = config;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const auth = request.headers.authorization;
        if (!auth?.startsWith('Bearer '))
            throw new common_1.UnauthorizedException('请先登录');
        try {
            const token = auth.slice(7);
            const payload = this.jwtService.verify(token, {
                secret: this.config.get('JWT_ACCESS_SECRET') || 'hicad-access-secret',
            });
            request.user = payload;
            if (payload.email !== (this.config.get('ADMIN_EMAIL') || 'hicad@jitword.com')) {
                throw new common_1.ForbiddenException('无管理员权限');
            }
            return true;
        }
        catch (e) {
            if (e instanceof common_1.ForbiddenException)
                throw e;
            throw new common_1.UnauthorizedException('Token 无效或已过期');
        }
    }
};
exports.AdminGuard = AdminGuard;
exports.AdminGuard = AdminGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], AdminGuard);
//# sourceMappingURL=admin.guard.js.map