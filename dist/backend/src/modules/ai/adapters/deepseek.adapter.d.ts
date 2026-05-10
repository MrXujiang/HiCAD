import { AiAdapter } from './ai-adapter.interface';
export declare const DEEPSEEK_MODELS: {
    'deepseek-chat': string;
    'deepseek-coder': string;
    'deepseek-reasoner': string;
};
export declare class DeepSeekAdapter implements AiAdapter {
    name: string;
    generateStream(prompt: string, systemPrompt: string, model?: string): AsyncIterable<string>;
}
