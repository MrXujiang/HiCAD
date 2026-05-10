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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const json_db_service_1 = require("../../database/json-db.service");
const user_service_1 = require("../user/user.service");
const prompt_builder_1 = require("./prompt-builder");
const design_prompt_1 = require("./design-prompt");
const tank_prompt_1 = require("./tank-prompt");
const jscad_codegen_1 = require("./jscad-codegen");
const design_spec_types_1 = require("./design-spec.types");
const uuid_1 = require("uuid");
let AiService = class AiService {
    constructor(db, userService, adapter) {
        this.db = db;
        this.userService = userService;
        this.adapter = adapter;
    }
    generateJscad(userId, prompt, model) {
        return new rxjs_1.Observable((subscriber) => {
            ;
            (async () => {
                try {
                    if (!userId) {
                        subscriber.next(`data: ${JSON.stringify({ type: 'error', message: '请先登录后使用 AI 建模功能，登录后免费使用 1 次' })}\n\n`);
                        subscriber.complete();
                        return;
                    }
                    const quota = this.userService.checkAndDecrementQuota(userId);
                    if (!quota.allowed) {
                        const userInfo = this.userService.findById(userId);
                        let quotaMsg = '今日 AI 次数已用完，请升级会员获取更多次数';
                        if (userInfo?.tier === 'free') {
                            quotaMsg = '今日免费次数已用完（每日 1 次），升级体验版可获得共 6 次，升级高级会员每月可用 100 次';
                        }
                        else if (userInfo?.tier === 'basic') {
                            quotaMsg = '体验版总计 6 次 AI 配额已全部用完，升级高级会员每月可用 100 次';
                        }
                        else if (userInfo?.tier === 'pro') {
                            quotaMsg = '本月 AI 次数已用完（每月 100 次），下月自动重置，如需更多请联系客服';
                        }
                        subscriber.next(`data: ${JSON.stringify({ type: 'error', message: quotaMsg })}\n\n`);
                        subscriber.complete();
                        return;
                    }
                    let fullCode = '';
                    if ((0, design_prompt_1.detectMechanicalArmIntent)(prompt)) {
                        subscriber.next(`data: ${JSON.stringify({ type: 'thinking', data: '⚡ 精准模式：正在分析设计意图...' })}\n\n`);
                        const spec = await this.runDesignAgent(prompt, model, (0, design_prompt_1.buildDesignSystemPrompt)());
                        subscriber.next(`data: ${JSON.stringify({ type: 'thinking', data: '🔧 正在生成精准结构代码...' })}\n\n`);
                        fullCode = (0, jscad_codegen_1.generateJscadCode)(spec);
                        for (const line of fullCode.split('\n')) {
                            subscriber.next(`data: ${JSON.stringify({ type: 'code_delta', data: line + '\n' })}\n\n`);
                        }
                    }
                    else if ((0, tank_prompt_1.detectTankIntent)(prompt)) {
                        subscriber.next(`data: ${JSON.stringify({ type: 'thinking', data: '🛡️ 坦克精准模式：正在分析装甲参数...' })}\n\n`);
                        const tankSpec = await this.runDesignAgent(prompt, model, (0, tank_prompt_1.buildTankDesignSystemPrompt)());
                        subscriber.next(`data: ${JSON.stringify({ type: 'thinking', data: '⚙️ 正在生成坦克结构代码...' })}\n\n`);
                        fullCode = (0, jscad_codegen_1.generateJscadCode)(tankSpec);
                        for (const line of fullCode.split('\n')) {
                            subscriber.next(`data: ${JSON.stringify({ type: 'code_delta', data: line + '\n' })}\n\n`);
                        }
                    }
                    else {
                        subscriber.next(`data: ${JSON.stringify({ type: 'thinking', data: '正在理解您的设计需求...' })}\n\n`);
                        const systemPrompt = (0, prompt_builder_1.buildJscadSystemPrompt)();
                        for await (const delta of this.adapter.generateStream(prompt, systemPrompt, model)) {
                            fullCode += delta;
                            subscriber.next(`data: ${JSON.stringify({ type: 'code_delta', data: delta })}\n\n`);
                        }
                    }
                    subscriber.next(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
                    subscriber.complete();
                    if (userId && fullCode) {
                        this.saveHistory(userId, prompt, fullCode).catch(() => { });
                    }
                }
                catch (err) {
                    subscriber.next(`data: ${JSON.stringify({ type: 'error', message: err.message || '生成失败，请重试' })}\n\n`);
                    subscriber.complete();
                }
            })();
        });
    }
    async runDesignAgent(prompt, model, systemPromptOverride) {
        const systemPrompt = systemPromptOverride ?? (0, design_prompt_1.buildDesignSystemPrompt)();
        let rawOutput = '';
        for await (const delta of this.adapter.generateStream(prompt, systemPrompt, model)) {
            rawOutput += delta;
        }
        try {
            const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.type === 'tank') {
                    return (0, design_spec_types_1.normalizeTankSpec)(parsed);
                }
                return (0, design_spec_types_1.normalizeArmSpec)(parsed);
            }
        }
        catch {
        }
        if (systemPromptOverride === (0, tank_prompt_1.buildTankDesignSystemPrompt)()) {
            const { getDefaultTankSpec } = await Promise.resolve().then(() => require('./design-spec.types'));
            return getDefaultTankSpec();
        }
        const { getDefaultArmSpec } = await Promise.resolve().then(() => require('./design-spec.types'));
        return getDefaultArmSpec();
    }
    modifyCode(userId, prompt, model, currentCode) {
        return new rxjs_1.Observable((subscriber) => {
            ;
            (async () => {
                try {
                    if (!userId) {
                        subscriber.next(`data: ${JSON.stringify({ type: 'error', message: '请先登录后使用 AI 建模功能，登录后免费使用 1 次' })}\n\n`);
                        subscriber.complete();
                        return;
                    }
                    const quota2 = this.userService.checkAndDecrementQuota(userId);
                    if (!quota2.allowed) {
                        const userInfo2 = this.userService.findById(userId);
                        let quotaMsg2 = '今日 AI 次数已用完，请升级会员获取更多次数';
                        if (userInfo2?.tier === 'free') {
                            quotaMsg2 = '今日免费次数已用完（每日 1 次），升级体验版可获得共 6 次，升级高级会员每月可用 100 次';
                        }
                        else if (userInfo2?.tier === 'basic') {
                            quotaMsg2 = '体验版总计 6 次 AI 配额已全部用完，升级高级会员每月可用 100 次';
                        }
                        else if (userInfo2?.tier === 'pro') {
                            quotaMsg2 = '本月 AI 次数已用完（每月 100 次），下月自动重置，如需更多请联系客服';
                        }
                        subscriber.next(`data: ${JSON.stringify({ type: 'error', message: quotaMsg2 })}\n\n`);
                        subscriber.complete();
                        return;
                    }
                    subscriber.next(`data: ${JSON.stringify({ type: 'thinking', data: '📝 分析现有代码，准备精确修改...' })}

`);
                    const systemPrompt = this.buildCodeModSystemPrompt();
                    const userPrompt = `以下是当前的 jsCAD 代码：\n\n\`\`\`javascript\n${currentCode}\n\`\`\`\n\n用户要求：${prompt}\n\n请根据用户要求修改上述代码，只输出修改后的完整代码：`;
                    let fullCode = '';
                    for await (const delta of this.adapter.generateStream(userPrompt, systemPrompt, model)) {
                        fullCode += delta;
                        subscriber.next(`data: ${JSON.stringify({ type: 'code_delta', data: delta })}

`);
                    }
                    subscriber.next(`data: ${JSON.stringify({ type: 'done' })}

`);
                    subscriber.complete();
                    if (userId && fullCode) {
                        this.saveHistory(userId, prompt, fullCode).catch(() => { });
                    }
                }
                catch (err) {
                    subscriber.next(`data: ${JSON.stringify({ type: 'error', message: err.message || '修改失败，请重试' })}

`);
                    subscriber.complete();
                }
            })();
        });
    }
    buildCodeModSystemPrompt() {
        return `你是一名专业的 jsCAD 3D建模代码专家。用户会提供一段现有的 jsCAD 代码，你的任务是根据用户要求精确修改它。

## 规则
1. 只修改用户明确要求的部分，保持其他结构不变
2. 确保修改后代码可以正常运行（必须有 function main() 和 module.exports = { main }）
3. 只输出修改后的完整代码，不加任何解释说明和 markdown 代码块包裹
4. 所有几何体使用底部对齐（Y轴从0开始），用 translate 精确定位
5. 多色模型用 colorize 区分各部件
6. 禁止在 stack() 内部使用 rotateZ`;
    }
    async saveHistory(userId, prompt, code) {
        const store = this.db.get('sessions');
        const now = new Date().toISOString();
        const userMsg = {
            id: (0, uuid_1.v4)(),
            role: 'user',
            content: prompt,
            timestamp: now,
        };
        const aiMsg = {
            id: (0, uuid_1.v4)(),
            role: 'assistant',
            content: code,
            timestamp: now,
            metadata: { model: this.adapter.name, inputTokens: 0, outputTokens: 0, renderSuccess: true },
        };
        let session = store.sessions
            .filter((s) => s.userId === userId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
        if (!session || session.messages.length >= 20) {
            session = { id: (0, uuid_1.v4)(), userId, messages: [], createdAt: now, updatedAt: now };
            store.sessions.push(session);
        }
        session.messages.push(userMsg, aiMsg);
        session.updatedAt = now;
        const idx = store.sessions.findIndex((s) => s.id === session.id);
        if (idx >= 0)
            store.sessions[idx] = session;
        this.db.set('sessions', store);
    }
    getHistory(userId) {
        const store = this.db.get('sessions');
        return store.sessions
            .filter((s) => s.userId === userId)
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .slice(0, 50);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)('AI_ADAPTER')),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService,
        user_service_1.UserService, Object])
], AiService);
//# sourceMappingURL=ai.service.js.map