"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ai_service_1 = require("./ai.service");
const ai_controller_1 = require("./ai.controller");
const deepseek_adapter_1 = require("./adapters/deepseek.adapter");
const openai_adapter_1 = require("./adapters/openai.adapter");
const user_module_1 = require("../user/user.module");
const database_module_1 = require("../../database/database.module");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, user_module_1.UserModule],
        controllers: [ai_controller_1.AiController],
        providers: [
            ai_service_1.AiService,
            {
                provide: 'AI_ADAPTER',
                useFactory: (config) => {
                    const adapter = config.get('AI_ADAPTER', 'deepseek');
                    if (adapter === 'openai') {
                        return new openai_adapter_1.OpenAiAdapter();
                    }
                    return new deepseek_adapter_1.DeepSeekAdapter();
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: [ai_service_1.AiService],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map