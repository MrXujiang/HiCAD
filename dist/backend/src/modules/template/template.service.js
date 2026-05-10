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
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../../database/json-db.service");
let TemplateService = class TemplateService {
    constructor(db) {
        this.db = db;
    }
    findAll(query) {
        const store = this.db.get('templates');
        let list = store.templates || [];
        if (query.featured === 'true') {
            const featuredTpls = list
                .filter((t) => t.isFeatured === true)
                .map(({ ...t }) => { const { code, ...rest } = t; return rest; });
            const modelStore = this.db.get('models');
            const featuredModels = (modelStore.models || [])
                .filter((m) => m.isPublic && m.isFeatured)
                .map((m) => ({
                id: m.id,
                name: m.name || '未命名模型',
                category: m.category || 'general',
                thumbnail: m.thumbnail || '',
                isFeatured: true,
                shareToken: m.shareToken || '',
                _isModel: true,
            }));
            const merged = [...featuredTpls, ...featuredModels];
            if (query.limit)
                return merged.slice(0, parseInt(query.limit, 10));
            return merged;
        }
        if (query.category) {
            list = list.filter((t) => t.category === query.category);
        }
        if (query.tier) {
            list = list.filter((t) => t.tier === query.tier);
        }
        if (query.search) {
            const kw = query.search.toLowerCase();
            list = list.filter((t) => t.name.toLowerCase().includes(kw) ||
                t.description.toLowerCase().includes(kw) ||
                t.tags.some((tag) => tag.toLowerCase().includes(kw)));
        }
        const result = list.map(({ ...t }) => {
            const { code, ...rest } = t;
            return rest;
        });
        if (query.limit) {
            return result.slice(0, parseInt(query.limit, 10));
        }
        return result;
    }
    findOne(id) {
        const store = this.db.get('templates');
        const template = (store.templates || []).find((t) => t.id === id);
        if (!template)
            return null;
        return template;
    }
    incrementUsage(id) {
        const store = this.db.get('templates');
        const idx = (store.templates || []).findIndex((t) => t.id === id);
        if (idx >= 0) {
            store.templates[idx].usageCount = (store.templates[idx].usageCount || 0) + 1;
            this.db.set('templates', store);
        }
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], TemplateService);
//# sourceMappingURL=template.service.js.map