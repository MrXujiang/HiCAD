import { JsonDbService } from '../../database/json-db.service';
export interface Feedback {
    id: string;
    content: string;
    userId?: string;
    email?: string;
    page?: string;
    createdAt: string;
}
export declare class FeedbackService {
    private readonly db;
    constructor(db: JsonDbService);
    private getStore;
    submit(dto: {
        content: string;
        userId?: string;
        email?: string;
        page?: string;
    }): {
        success: boolean;
        id: string;
    };
    findAll(): Feedback[];
    remove(id: string): {
        success: boolean;
    };
}
