import { ModelService } from './model.service';
import { CreateModelDto, UpdateModelDto, PublishModelDto } from './dto/model.dto';
export declare class ModelController {
    private readonly modelService;
    constructor(modelService: ModelService);
    getMarket(page?: string, limit?: string, type?: string, category?: string, search?: string, sort?: string): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    likeModel(id: string): {
        likes: number;
    };
    findAll(user: any, page?: string, limit?: string): Promise<{
        items: import("@hicad/shared").ModelMeta[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(user: any, dto: CreateModelDto): Promise<import("@hicad/shared").ModelMeta>;
    getByShareToken(token: string): Promise<{
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
    publish(id: string, user: any, dto: PublishModelDto): Promise<import("@hicad/shared").ModelMeta>;
    unpublish(id: string, user: any): Promise<import("@hicad/shared").ModelMeta>;
    findOne(id: string, user: any): Promise<{
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
    update(id: string, user: any, dto: UpdateModelDto): Promise<import("@hicad/shared").ModelMeta>;
    remove(id: string, user: any): Promise<{
        success: boolean;
    }>;
    share(id: string, user: any): Promise<{
        token: string;
        url: string;
    }>;
}
