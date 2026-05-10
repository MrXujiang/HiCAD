import { JsonDbService } from '../../database/json-db.service';
import { ModelMeta } from '@hicad/shared';
import { CreateModelDto, UpdateModelDto, PublishModelDto } from './dto/model.dto';
export declare class ModelService {
    private readonly db;
    private readonly filesDir;
    constructor(db: JsonDbService);
    onModuleInit(): Promise<void>;
    findByUser(userId: string, page?: number, limit?: number): Promise<{
        items: ModelMeta[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, userId?: string): Promise<{
        code: string;
        id: string;
        userId: string;
        name: string;
        description: string;
        thumbnail: string;
        category: string;
        tags: string[];
        isPublic: boolean;
        shareToken: string;
        source?: import("@hicad/shared").ModelSource;
        templateId?: string;
        marketDescription?: string;
        likes?: number;
        views?: number;
        publishedAt?: string;
        createdAt: string;
        updatedAt: string;
    }>;
    create(userId: string, dto: CreateModelDto): Promise<ModelMeta>;
    update(id: string, userId: string, dto: UpdateModelDto): Promise<ModelMeta>;
    remove(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    createShareToken(id: string, userId: string): Promise<{
        token: string;
        url: string;
    }>;
    findByShareToken(token: string): Promise<{
        code: string;
        id: string;
        userId: string;
        name: string;
        description: string;
        thumbnail: string;
        category: string;
        tags: string[];
        isPublic: boolean;
        shareToken: string;
        source?: import("@hicad/shared").ModelSource;
        templateId?: string;
        marketDescription?: string;
        likes?: number;
        views?: number;
        publishedAt?: string;
        createdAt: string;
        updatedAt: string;
    }>;
    publish(id: string, userId: string, userTier: string, dto: PublishModelDto, userEmail?: string): Promise<ModelMeta>;
    unpublish(id: string, userId: string): Promise<ModelMeta>;
    getMarketItems(page?: number, limit?: number, type?: 'all' | 'template' | 'community', category?: string, search?: string, sort?: 'latest' | 'likes'): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    likeModel(id: string): {
        likes: number;
    };
}
