export interface AiAdapter {
    name: string;
    generateStream(prompt: string, systemPrompt: string, model?: string): AsyncIterable<string>;
}
