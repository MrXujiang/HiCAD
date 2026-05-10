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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const optional_jwt_guard_1 = require("../../common/guards/optional-jwt.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AiController = class AiController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async generate(prompt, model, user, res) {
        if (!prompt || !prompt.trim()) {
            res.status(400).json({ code: 400, message: 'prompt 不能为空' });
            return;
        }
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
        const userId = user?.id || null;
        const observable = this.aiService.generateJscad(userId, prompt.trim(), model);
        const subscription = observable.subscribe({
            next: (chunk) => {
                res.write(chunk);
            },
            error: (err) => {
                res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
                res.end();
            },
            complete: () => {
                res.end();
            },
        });
        res.on('close', () => {
            subscription.unsubscribe();
        });
    }
    async modifyCode(body, user, res) {
        if (!body.prompt?.trim()) {
            res.status(400).json({ code: 400, message: 'prompt 不能为空' });
            return;
        }
        if (!body.currentCode?.trim()) {
            res.status(400).json({ code: 400, message: 'currentCode 不能为空' });
            return;
        }
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
        const userId = user?.id || null;
        const observable = this.aiService.modifyCode(userId, body.prompt.trim(), body.model, body.currentCode);
        const subscription = observable.subscribe({
            next: (chunk) => { res.write(chunk); },
            error: (err) => {
                res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}

`);
                res.end();
            },
            complete: () => { res.end(); },
        });
        res.on('close', () => { subscription.unsubscribe(); });
    }
    getHistory(user) {
        if (!user) {
            return { code: 401, message: '请先登录' };
        }
        return { code: 0, data: this.aiService.getHistory(user.id) };
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Get)('generate'),
    (0, common_1.UseGuards)(optional_jwt_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Query)('prompt')),
    __param(1, (0, common_1.Query)('model')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)('modify'),
    (0, common_1.UseGuards)(optional_jwt_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "modifyCode", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)(optional_jwt_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getHistory", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map