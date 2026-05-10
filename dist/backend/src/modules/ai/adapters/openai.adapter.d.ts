import { AiAdapter } from './ai-adapter.interface';
export declare class OpenAiAdapter implements AiAdapter {
    name: string;
    generateStream(prompt: string, systemPrompt: string): AsyncIterable<string>;
}
