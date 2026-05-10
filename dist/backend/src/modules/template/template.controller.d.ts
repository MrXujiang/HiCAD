import { TemplateService } from './template.service';
export declare class TemplateController {
    private readonly templateService;
    constructor(templateService: TemplateService);
    findAll(category?: string, tier?: string, search?: string, featured?: string, limit?: string): any[];
    findOne(id: string): import("@hicad/shared").Template;
    use(id: string): {
        message: string;
    };
}
