import { Observable } from 'rxjs';
import { JsonDbService } from '../../database/json-db.service';
import { UserService } from '../user/user.service';
import { AiAdapter } from './adapters/ai-adapter.interface';
import { Session } from '@hicad/shared';
export declare class AiService {
    private readonly db;
    private readonly userService;
    private readonly adapter;
    constructor(db: JsonDbService, userService: UserService, adapter: AiAdapter);
    generateJscad(userId: string | null, prompt: string, model?: string): Observable<string>;
    private runDesignAgent;
    modifyCode(userId: string | null, prompt: string, model?: string, currentCode?: string): Observable<string>;
    private buildCodeModSystemPrompt;
    private saveHistory;
    getHistory(userId: string): Session[];
}
