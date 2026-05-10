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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs/promises");
const path = require("path");
const uuid_1 = require("uuid");
const json_db_service_1 = require("../../database/json-db.service");
const user_service_1 = require("../user/user.service");
let AdminService = class AdminService {
    constructor(db) {
        this.db = db;
    }
    getStats() {
        const users = this.db.get('users').users;
        const orders = this.db.get('orders').orders;
        const models = this.db.get('models').models;
        const paid = orders.filter(o => o.status === 'paid');
        const revenue = paid.reduce((s, o) => s + (o.amount || 0), 0);
        return {
            totalUsers: users.length,
            paidUsers: users.filter(u => u.tier !== 'free').length,
            freeUsers: users.filter(u => u.tier === 'free').length,
            totalOrders: orders.length,
            paidOrders: paid.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            usedCodes: orders.filter(o => o.activationUsedAt).length,
            unusedPaidCodes: paid.filter(o => !o.activationUsedAt).length,
            totalRevenueCents: revenue,
            totalModels: models.length,
            publicModels: models.filter(m => m.isPublic).length,
            aiModels: models.filter(m => m.source === 'ai').length,
        };
    }
    getUsers() {
        const store = this.db.get('users');
        return store.users
            .map(u => {
            const qDisplay = (0, user_service_1.computeQuotaDisplay)(u);
            return {
                id: u.id,
                email: u.email,
                username: u.username,
                tier: u.tier,
                quota: {
                    totalAiUsage: u.quota?.totalAiUsage ?? 0,
                    dailyAiUsage: u.quota?.dailyAiUsage ?? 0,
                    monthlyAiUsage: u.quota?.monthlyAiUsage ?? 0,
                    aiUsed: qDisplay.aiUsed,
                    aiLimit: qDisplay.aiLimit,
                    limitType: qDisplay.limitType,
                },
                createdAt: u.createdAt,
                updatedAt: u.updatedAt,
            };
        })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    getOrders() {
        const store = this.db.get('orders');
        return store.orders
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    setUserTier(userId, tier) {
        const validTiers = ['free', 'basic', 'pro', 'enterprise'];
        if (!validTiers.includes(tier))
            throw new common_1.BadRequestException('无效的等级');
        const store = this.db.get('users');
        const idx = store.users.findIndex(u => u.id === userId);
        if (idx < 0)
            throw new common_1.NotFoundException('用户不存在');
        store.users[idx].tier = tier;
        store.users[idx].updatedAt = new Date().toISOString();
        store.users[idx].quota.maxDailyAiUsage = tier === 'free' ? 1 : -1;
        this.db.set('users', store);
        return { success: true, tier };
    }
    deleteUser(userId) {
        const store = this.db.get('users');
        const idx = store.users.findIndex(u => u.id === userId);
        if (idx < 0)
            throw new common_1.NotFoundException('用户不存在');
        if (store.users[idx].email === 'admin@hicad.ai') {
            throw new common_1.BadRequestException('不能删除管理员账号');
        }
        store.users.splice(idx, 1);
        this.db.set('users', store);
        return { success: true };
    }
    resetUserQuota(userId) {
        const store = this.db.get('users');
        const idx = store.users.findIndex(u => u.id === userId);
        if (idx < 0)
            throw new common_1.NotFoundException('用户不存在');
        const today = new Date().toISOString().split('T')[0];
        store.users[idx].quota.dailyAiUsage = 0;
        store.users[idx].quota.lastResetDate = today;
        this.db.set('users', store);
        return { success: true };
    }
    async getAllModels(page = 1, limit = 50, search = '') {
        const users = this.db.get('users').users;
        const userMap = new Map(users.map(u => [u.id, { email: u.email, username: u.username }]));
        let list = [...this.db.get('models').models];
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(m => m.name.toLowerCase().includes(q) ||
                (userMap.get(m.userId)?.email || '').toLowerCase().includes(q) ||
                (userMap.get(m.userId)?.username || '').toLowerCase().includes(q));
        }
        list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        const total = list.length;
        const items = list.slice((page - 1) * limit, page * limit).map(m => ({
            ...m, owner: userMap.get(m.userId) || { email: '未知用户', username: '-' },
        }));
        return { items, total, page, limit };
    }
    async adminGetModelDetail(modelId) {
        const store = this.db.get('models');
        const model = store.models.find(m => m.id === modelId);
        if (!model)
            throw new common_1.NotFoundException('模型不存在');
        const userDir = path.join(process.cwd(), 'data', 'files', model.userId);
        const PREFER_EXTS = ['.stl', '.step', '.stp', '.obj', '.igs', '.iges'];
        const BINARY_EXTS = new Set(PREFER_EXTS);
        let code = '';
        let codeBase64 = '';
        let fileName = `${modelId}.jscad`;
        try {
            const files = await fs.readdir(userDir);
            const original = files.find(f => PREFER_EXTS.some(ext => f === `${modelId}${ext}`));
            const found = original || files.find(f => f.startsWith(modelId + '.') || f === modelId);
            if (found) {
                fileName = found;
                const isBinary = BINARY_EXTS.has(path.extname(found).toLowerCase());
                if (isBinary) {
                    const buf = await fs.readFile(path.join(userDir, found));
                    codeBase64 = buf.toString('base64');
                }
                else {
                    code = await fs.readFile(path.join(userDir, found), 'utf-8');
                }
            }
        }
        catch { }
        const users = this.db.get('users').users;
        const owner = users.find(u => u.id === model.userId);
        return {
            ...model, code, codeBase64, fileName,
            owner: owner ? { email: owner.email, username: owner.username } : { email: '未知', username: '-' },
        };
    }
    adminEnsureShare(modelId) {
        const store = this.db.get('models');
        const idx = store.models.findIndex(m => m.id === modelId);
        if (idx < 0)
            throw new common_1.NotFoundException('模型不存在');
        if (store.models[idx].shareToken)
            return { token: store.models[idx].shareToken };
        const token = (0, uuid_1.v4)().replace(/-/g, '').slice(0, 16);
        store.models[idx].shareToken = token;
        store.models[idx].isPublic = true;
        this.db.set('models', store);
        return { token };
    }
    async adminDeleteModel(modelId) {
        const store = this.db.get('models');
        const idx = store.models.findIndex(m => m.id === modelId);
        if (idx < 0)
            throw new common_1.NotFoundException('模型不存在');
        const model = store.models[idx];
        store.models.splice(idx, 1);
        this.db.set('models', store);
        try {
            await fs.unlink(path.join(process.cwd(), 'data', 'files', model.userId, `${modelId}.jscad`));
        }
        catch { }
        return { success: true };
    }
    async adminDeleteTemplate(templateId) {
        const store = this.db.get('templates');
        const idx = (store.templates || []).findIndex(t => t.id === templateId);
        if (idx < 0)
            throw new common_1.NotFoundException('模板不存在');
        store.templates.splice(idx, 1);
        this.db.set('templates', store);
        return { success: true };
    }
    getAdminTemplates() {
        const templateStore = this.db.get('templates');
        const templates = (templateStore.templates || []).map(({ code, ...rest }) => ({
            ...rest,
            _source: 'template',
        }));
        const modelStore = this.db.get('models');
        const models = (modelStore.models || [])
            .filter((m) => m.isPublic)
            .map((m) => ({
            id: m.id,
            name: m.name || '未命名模型',
            category: m.category || 'general',
            thumbnail: m.thumbnail || '',
            isFeatured: !!m.isFeatured,
            usageCount: m.likes || 0,
            shareToken: m.shareToken || '',
            createdAt: m.createdAt,
            _source: 'model',
        }));
        return [...templates, ...models];
    }
    toggleTemplateFeatured(templateId, source = 'template') {
        if (source === 'model') {
            const store = this.db.get('models');
            const idx = (store.models || []).findIndex((m) => m.id === templateId);
            if (idx < 0)
                throw new common_1.NotFoundException('模型不存在');
            const current = !!store.models[idx].isFeatured;
            store.models[idx] = { ...store.models[idx], isFeatured: !current };
            this.db.set('models', store);
            return { success: true, isFeatured: !current };
        }
        const store = this.db.get('templates');
        const idx = (store.templates || []).findIndex((t) => t.id === templateId);
        if (idx < 0)
            throw new common_1.NotFoundException('模板不存在');
        const current = !!store.templates[idx].isFeatured;
        store.templates[idx] = { ...store.templates[idx], isFeatured: !current };
        this.db.set('templates', store);
        return { success: true, isFeatured: !current };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], AdminService);
//# sourceMappingURL=admin.service.js.map