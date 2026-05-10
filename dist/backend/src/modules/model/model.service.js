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
exports.ModelService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs/promises");
const path = require("path");
const uuid_1 = require("uuid");
const json_db_service_1 = require("../../database/json-db.service");
let ModelService = class ModelService {
    constructor(db) {
        this.db = db;
        this.filesDir = path.join(process.cwd(), 'data', 'files');
    }
    async onModuleInit() {
        await fs.mkdir(this.filesDir, { recursive: true });
    }
    async findByUser(userId, page = 1, limit = 20) {
        const store = this.db.get('models');
        const userModels = store.models
            .filter((m) => m.userId === userId)
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        const total = userModels.length;
        const items = userModels.slice((page - 1) * limit, page * limit);
        return { items, total, page, limit };
    }
    async findOne(id, userId) {
        const store = this.db.get('models');
        const model = store.models.find((m) => m.id === id);
        if (!model)
            throw new common_1.NotFoundException('模型不存在');
        if (userId && model.userId !== userId)
            throw new common_1.ForbiddenException('无权访问');
        let code = '';
        try {
            const filePath = path.join(this.filesDir, model.userId, `${id}.jscad`);
            code = await fs.readFile(filePath, 'utf-8');
        }
        catch { }
        return { ...model, code };
    }
    async create(userId, dto) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const userDir = path.join(this.filesDir, userId);
        await fs.mkdir(userDir, { recursive: true });
        const isStlImport = dto.code.startsWith('// @stl-import-b64:');
        if (isStlImport) {
            const b64 = dto.code.slice('// @stl-import-b64:'.length).trim();
            const binary = Buffer.from(b64, 'base64');
            await fs.writeFile(path.join(userDir, `${id}.stl`), binary);
        }
        await fs.writeFile(path.join(userDir, `${id}.jscad`), dto.code, 'utf-8');
        const autoSource = isStlImport ? 'import' : (dto.source || 'manual');
        const model = {
            id,
            userId,
            name: dto.name,
            description: dto.description || '',
            thumbnail: dto.thumbnail || '',
            category: dto.category || 'general',
            tags: dto.tags || [],
            isPublic: false,
            shareToken: '',
            source: autoSource,
            createdAt: now,
            updatedAt: now,
        };
        const store = this.db.get('models');
        store.models.push(model);
        this.db.set('models', store);
        return model;
    }
    async update(id, userId, dto) {
        const store = this.db.get('models');
        const idx = store.models.findIndex((m) => m.id === id);
        if (idx < 0)
            throw new common_1.NotFoundException('模型不存在');
        if (store.models[idx].userId !== userId)
            throw new common_1.ForbiddenException('无权操作');
        if (dto.code !== undefined) {
            const isStlImport = dto.code.startsWith('// @stl-import-b64:');
            if (isStlImport) {
                const b64 = dto.code.slice('// @stl-import-b64:'.length).trim();
                const binary = Buffer.from(b64, 'base64');
                await fs.writeFile(path.join(this.filesDir, userId, `${id}.stl`), binary);
            }
            const filePath = path.join(this.filesDir, userId, `${id}.jscad`);
            await fs.writeFile(filePath, dto.code, 'utf-8');
        }
        const updated = {
            ...store.models[idx],
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.description !== undefined ? { description: dto.description } : {}),
            ...(dto.thumbnail !== undefined ? { thumbnail: dto.thumbnail } : {}),
            ...(dto.category !== undefined ? { category: dto.category } : {}),
            ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
            updatedAt: new Date().toISOString(),
        };
        store.models[idx] = updated;
        this.db.set('models', store);
        return updated;
    }
    async remove(id, userId) {
        const store = this.db.get('models');
        const idx = store.models.findIndex((m) => m.id === id);
        if (idx < 0)
            throw new common_1.NotFoundException('模型不存在');
        if (store.models[idx].userId !== userId)
            throw new common_1.ForbiddenException('无权操作');
        store.models.splice(idx, 1);
        this.db.set('models', store);
        try {
            await fs.unlink(path.join(this.filesDir, userId, `${id}.jscad`));
        }
        catch { }
        return { success: true };
    }
    async createShareToken(id, userId) {
        const store = this.db.get('models');
        const idx = store.models.findIndex((m) => m.id === id);
        if (idx < 0)
            throw new common_1.NotFoundException('模型不存在');
        if (store.models[idx].userId !== userId)
            throw new common_1.ForbiddenException('无权操作');
        const token = (0, uuid_1.v4)().replace(/-/g, '').slice(0, 16);
        store.models[idx].shareToken = token;
        store.models[idx].isPublic = true;
        this.db.set('models', store);
        return { token, url: `/share/${token}` };
    }
    async findByShareToken(token) {
        const store = this.db.get('models');
        const model = store.models.find((m) => m.shareToken === token);
        if (!model)
            throw new common_1.NotFoundException('分享链接无效或已过期');
        let code = '';
        try {
            const filePath = path.join(this.filesDir, model.userId, `${model.id}.jscad`);
            code = await fs.readFile(filePath, 'utf-8');
        }
        catch { }
        return { ...model, code };
    }
    async publish(id, userId, userTier, dto, userEmail) {
        if (!['basic', 'pro', 'enterprise'].includes(userTier)) {
            throw new common_1.ForbiddenException('发布功能需要付费会员权限');
        }
        const store = this.db.get('models');
        const idx = store.models.findIndex(m => m.id === id);
        if (idx < 0)
            throw new common_1.NotFoundException('模型不存在');
        if (store.models[idx].userId !== userId)
            throw new common_1.ForbiddenException('无权操作');
        if (!store.models[idx].shareToken) {
            store.models[idx].shareToken = (0, uuid_1.v4)().replace(/-/g, '').slice(0, 16);
        }
        const adminEmail = process.env.ADMIN_EMAIL || 'hicad@jitword.com';
        const isOfficial = !!userEmail && userEmail === adminEmail;
        const now = new Date().toISOString();
        store.models[idx] = {
            ...store.models[idx],
            ...(dto.name ? { name: dto.name } : {}),
            isPublic: true,
            publishedAt: store.models[idx].publishedAt || now,
            marketDescription: dto.marketDescription ?? store.models[idx].marketDescription ?? '',
            ...(dto.category ? { category: dto.category } : {}),
            ...(dto.tags ? { tags: dto.tags } : {}),
            ...(dto.thumbnail ? { thumbnail: dto.thumbnail } : {}),
            ...(isOfficial ? { isOfficial: true } : {}),
            updatedAt: now,
        };
        this.db.set('models', store);
        return store.models[idx];
    }
    async unpublish(id, userId) {
        const store = this.db.get('models');
        const idx = store.models.findIndex(m => m.id === id);
        if (idx < 0)
            throw new common_1.NotFoundException('模型不存在');
        if (store.models[idx].userId !== userId)
            throw new common_1.ForbiddenException('无权操作');
        store.models[idx].isPublic = false;
        store.models[idx].updatedAt = new Date().toISOString();
        this.db.set('models', store);
        return store.models[idx];
    }
    async getMarketItems(page = 1, limit = 20, type = 'all', category = '', search = '', sort = 'latest') {
        const users = this.db.get('users').users;
        const userMap = new Map(users.map(u => [u.id, { username: u.username, email: u.email }]));
        const items = [];
        if (type === 'all' || type === 'template') {
            const tplStore = this.db.get('templates');
            for (const t of (tplStore.templates || [])) {
                if (category && t.category !== category)
                    continue;
                if (search && !t.name.toLowerCase().includes(search.toLowerCase()))
                    continue;
                items.push({
                    id: t.id,
                    name: t.name,
                    thumbnail: t.thumbnail || '',
                    category: t.category,
                    tags: t.tags || [],
                    description: t.description || '',
                    source: 'template',
                    author: null,
                    likes: 0,
                    views: t.usageCount || 0,
                    publishedAt: t.createdAt || '',
                    isTemplate: true,
                    tier: t.tier || 'free',
                    params: t.params || [],
                    usageCount: t.usageCount || 0,
                });
            }
        }
        if (type === 'all' || type === 'community') {
            const modelStore = this.db.get('models');
            for (const m of modelStore.models) {
                if (!m.isPublic || !m.publishedAt)
                    continue;
                if (category && m.category !== category)
                    continue;
                if (search && !m.name.toLowerCase().includes(search.toLowerCase()))
                    continue;
                const owner = userMap.get(m.userId);
                items.push({
                    id: m.id,
                    name: m.name,
                    thumbnail: m.thumbnail || '',
                    category: m.category,
                    tags: m.tags || [],
                    description: m.marketDescription || m.description || '',
                    source: m.source || 'manual',
                    author: owner || { username: '匿名用户', email: '' },
                    likes: m.likes || 0,
                    views: m.views || 0,
                    publishedAt: m.publishedAt || m.updatedAt,
                    shareToken: m.shareToken,
                    isTemplate: false,
                    tier: undefined,
                });
            }
        }
        items.sort((a, b) => {
            if (sort === 'likes')
                return (b.likes || 0) - (a.likes || 0);
            return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
        });
        const total = items.length;
        const paged = items.slice((page - 1) * limit, page * limit);
        return { items: paged, total, page, limit };
    }
    likeModel(id) {
        const store = this.db.get('models');
        const idx = store.models.findIndex(m => m.id === id);
        if (idx < 0)
            throw new common_1.NotFoundException('模型不存在');
        store.models[idx].likes = (store.models[idx].likes || 0) + 1;
        this.db.set('models', store);
        return { likes: store.models[idx].likes };
    }
};
exports.ModelService = ModelService;
exports.ModelService = ModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], ModelService);
//# sourceMappingURL=model.service.js.map