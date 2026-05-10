import { Response } from 'express';
import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    generate(prompt: string, model: string, user: any, res: Response): Promise<void>;
    modifyCode(body: {
        prompt: string;
        model?: string;
        currentCode: string;
    }, user: any, res: Response): Promise<void>;
    getHistory(user: any): {
        code: number;
        message: string;
        data?: undefined;
    } | {
        code: number;
        data: import("@hicad/shared").Session[];
        message?: undefined;
    };
}
