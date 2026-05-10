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
exports.UserService = void 0;
exports.computeQuotaDisplay = computeQuotaDisplay;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../../database/json-db.service");
const TIER_LIMITS = {
    free: { type: 'daily', limit: 1 },
    basic: { type: 'total', limit: 6 },
    pro: { type: 'monthly', limit: 100 },
    enterprise: { type: 'unlimited', limit: -1 },
};
function computeQuotaDisplay(user) {
    const cfg = TIER_LIMITS[user.tier] ?? TIER_LIMITS.free;
    const thisMonth = new Date().toISOString().substring(0, 7);
    switch (cfg.type) {
        case 'unlimited':
            return { aiUsed: user.quota.totalAiUsage, aiLimit: -1, limitType: 'unlimited' };
        case 'monthly': {
            const mUsage = user.quota.lastMonthlyReset?.substring(0, 7) === thisMonth
                ? (user.quota.monthlyAiUsage ?? 0) : 0;
            return { aiUsed: mUsage, aiLimit: cfg.limit, limitType: 'monthly' };
        }
        case 'total':
            return { aiUsed: user.quota.totalAiUsage, aiLimit: cfg.limit, limitType: 'total' };
        default:
            return { aiUsed: user.quota.dailyAiUsage, aiLimit: cfg.limit, limitType: 'daily' };
    }
}
let UserService = class UserService {
    constructor(db) {
        this.db = db;
    }
    findById(id) {
        const store = this.db.get('users');
        return store.users.find((u) => u.id === id);
    }
    getProfile(id) {
        const user = this.findById(id);
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        const today = new Date().toISOString().split('T')[0];
        if (user.quota.lastResetDate !== today) {
            const store = this.db.get('users');
            const idx = store.users.findIndex((u) => u.id === id);
            store.users[idx].quota.dailyAiUsage = 0;
            store.users[idx].quota.lastResetDate = today;
            this.db.set('users', store);
        }
        const qDisplay = computeQuotaDisplay(user);
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            tier: user.tier,
            quota: {
                dailyAiUsage: user.quota.dailyAiUsage,
                maxDailyAiUsage: TIER_LIMITS[user.tier]?.limit ?? 1,
                ...qDisplay,
            },
            createdAt: user.createdAt,
        };
    }
    checkAndDecrementQuota(userId) {
        const store = this.db.get('users');
        const idx = store.users.findIndex((u) => u.id === userId);
        if (idx === -1)
            return { allowed: false, remaining: 0 };
        const user = store.users[idx];
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = today.substring(0, 7);
        if (user.quota.lastResetDate !== today) {
            user.quota.dailyAiUsage = 0;
            user.quota.lastResetDate = today;
        }
        if (user.tier === 'pro' && user.quota.lastMonthlyReset?.substring(0, 7) !== thisMonth) {
            user.quota.monthlyAiUsage = 0;
            user.quota.lastMonthlyReset = thisMonth;
        }
        let allowed = false;
        let remaining = 0;
        switch (user.tier) {
            case 'enterprise':
                allowed = true;
                remaining = -1;
                break;
            case 'pro': {
                const used = user.quota.monthlyAiUsage ?? 0;
                if (used >= 100)
                    return { allowed: false, remaining: 0 };
                user.quota.monthlyAiUsage = used + 1;
                allowed = true;
                remaining = 100 - user.quota.monthlyAiUsage;
                break;
            }
            case 'basic':
                if (user.quota.totalAiUsage >= 6)
                    return { allowed: false, remaining: 0 };
                allowed = true;
                remaining = 6 - user.quota.totalAiUsage - 1;
                break;
            default:
                if (user.quota.dailyAiUsage >= 1)
                    return { allowed: false, remaining: 0 };
                allowed = true;
                remaining = 0;
                break;
        }
        user.quota.dailyAiUsage++;
        user.quota.totalAiUsage++;
        store.users[idx] = { ...user, updatedAt: new Date().toISOString() };
        this.db.set('users', store);
        return { allowed, remaining };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], UserService);
//# sourceMappingURL=user.service.js.map