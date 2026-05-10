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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const json_db_service_1 = require("../../database/json-db.service");
const user_service_1 = require("../user/user.service");
const FIXED_ACTIVATION_CODE = 'Jitword_pxcharts';
let AuthService = class AuthService {
    constructor(db, jwt, config) {
        this.db = db;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        const store = this.db.get('users');
        const exists = store.users.find((u) => u.email === dto.email);
        if (exists)
            throw new common_1.ConflictException('该邮箱已注册');
        const rawName = (dto.username || dto.email.split('@')[0])
            .replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '')
            .slice(0, 20) || 'user';
        let username = rawName;
        let suffix = 1;
        while (store.users.find((u) => u.username === username)) {
            username = `${rawName}${suffix++}`;
        }
        if (!dto.activationCode || !dto.activationCode.trim()) {
            throw new common_1.BadRequestException('注册需要填写激活码，请关注「趣谈AI」公众号回复「HiCAD」获取激活码');
        }
        if (dto.activationCode.trim() !== FIXED_ACTIVATION_CODE) {
            throw new common_1.BadRequestException('激活码无效，请关注「趣谈AI」公众号回复「HiCAD」获取正确的激活码');
        }
        const tier = 'pro';
        const now = new Date().toISOString();
        const userId = (0, uuid_1.v4)();
        const user = {
            id: userId,
            email: dto.email,
            username,
            passwordHash: await bcrypt.hash(dto.password, 10),
            tier: tier,
            quota: {
                dailyAiUsage: 0,
                maxDailyAiUsage: tier === 'free' ? 1 : 999,
                lastResetDate: now.split('T')[0],
                totalAiUsage: 0,
                monthlyAiUsage: 0,
                lastMonthlyReset: now.substring(0, 7),
            },
            createdAt: now,
            updatedAt: now,
        };
        store.users.push(user);
        this.db.set('users', store);
        return this.issueTokens(user);
    }
    async login(dto) {
        const store = this.db.get('users');
        const user = store.users.find((u) => u.email === dto.email);
        if (!user)
            throw new common_1.UnauthorizedException('邮箱或密码错误');
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('邮箱或密码错误');
        return this.issueTokens(user);
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwt.verify(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET') || 'hicad-refresh-secret',
            });
            const store = this.db.get('users');
            const user = store.users.find((u) => u.id === payload.sub);
            if (!user)
                throw new common_1.UnauthorizedException();
            return this.issueTokens(user);
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token 已过期，请重新登录');
        }
    }
    issueTokens(user) {
        const payload = { sub: user.id, email: user.email, tier: user.tier };
        const qDisplay = (0, user_service_1.computeQuotaDisplay)(user);
        return {
            accessToken: this.jwt.sign(payload, {
                secret: this.config.get('JWT_ACCESS_SECRET') || 'hicad-access-secret',
                expiresIn: '24h',
            }),
            refreshToken: this.jwt.sign(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET') || 'hicad-refresh-secret',
                expiresIn: '30d',
            }),
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                tier: user.tier,
                quota: {
                    dailyAiUsage: user.quota.dailyAiUsage,
                    maxDailyAiUsage: user.quota.maxDailyAiUsage,
                    ...qDisplay,
                },
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map