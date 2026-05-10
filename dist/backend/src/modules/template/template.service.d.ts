import { JsonDbService } from '../../database/json-db.service';
import { Template } from '@hicad/shared';
export declare class TemplateService {
    private readonly db;
    constructor(db: JsonDbService);
    findAll(query: {
        category?: string;
        tier?: string;
        search?: string;
        featured?: string;
        limit?: string;
    }): any[];
    findOne(id: string): Template | null;
    incrementUsage(id: string): void;
}
