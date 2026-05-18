"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QwenAdapter = void 0;
const common_1 = require("@nestjs/common");
const QWEN_MODELS = {
    'qwen-plus': '通义千问 Plus（性价比高，推荐）',
    'qwen-max': '通义千问 Max（效果最好）',
    'qwen-turbo': '通义千问 Turbo（速度最快）',
};
let QwenAdapter = class QwenAdapter {
    constructor() {
        this.name = 'qwen';
    }
    async *generateStream(prompt, systemPrompt, model) {
        const apiKey = process.env.QWEN_API_KEY;
        if (!apiKey || apiKey === 'your_qwen_api_key_here') {
            throw new Error('QWEN_API_KEY 未配置，请在 .env 中填写您的通义千问 API Key');
        }
        const selectedModel = model && Object.keys(QWEN_MODELS).includes(model) ? model : 'qwen-plus';
        const body = JSON.stringify({
            model: selectedModel,
            stream: true,
            temperature: 0.3,
            max_tokens: 8192,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
        });
        const MAX_RETRIES = 3;
        let response = null;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                await new Promise(r => setTimeout(r, 2000 * attempt));
            }
            const res = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body,
            });
            if (res.status === 503 || res.status === 429) {
                if (attempt === MAX_RETRIES - 1) {
                    throw new Error(`通义千问服务繁忙，请稍后再试（已自动重试 ${MAX_RETRIES} 次）`);
                }
                continue;
            }
            if (!res.ok) {
                const err = await res.text();
                throw new Error(`通义千问 API 请求失败 (${res.status}): ${err}`);
            }
            response = res;
            break;
        }
        const reader = response.body?.getReader();
        if (!reader)
            throw new Error('No response body');
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === 'data: [DONE]')
                    continue;
                if (trimmed.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(trimmed.slice(6));
                        const delta = json.choices?.[0]?.delta?.content;
                        if (delta)
                            yield delta;
                    }
                    catch { }
                }
            }
        }
    }
};
exports.QwenAdapter = QwenAdapter;
exports.QwenAdapter = QwenAdapter = __decorate([
    (0, common_1.Injectable)()
], QwenAdapter);
//# sourceMappingURL=qwen.adapter.js.map
