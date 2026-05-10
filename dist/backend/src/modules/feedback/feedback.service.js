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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../../database/json-db.service");
const uuid_1 = require("uuid");
let FeedbackService = class FeedbackService {
    constructor(db) {
        this.db = db;
    }
    getStore() {
        const store = this.db.get('feedbacks');
        if (!store.feedbacks)
            store.feedbacks = [];
        return store;
    }
    submit(dto) {
        const store = this.getStore();
        const fb = {
            id: (0, uuid_1.v4)(),
            content: dto.content.trim(),
            ...(dto.userId ? { userId: dto.userId } : {}),
            ...(dto.email ? { email: dto.email } : {}),
            ...(dto.page ? { page: dto.page } : {}),
            createdAt: new Date().toISOString(),
        };
        store.feedbacks.unshift(fb);
        this.db.set('feedbacks', store);
        return { success: true, id: fb.id };
    }
    findAll() {
        return this.getStore().feedbacks;
    }
    remove(id) {
        const store = this.getStore();
        store.feedbacks = store.feedbacks.filter(f => f.id !== id);
        this.db.set('feedbacks', store);
        return { success: true };
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map