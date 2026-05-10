import { JsonDbService } from '../../database/json-db.service';
export declare class AdminService {
    private readonly db;
    constructor(db: JsonDbService);
    getStats(): {
        totalUsers: number;
        paidUsers: number;
        freeUsers: number;
        totalOrders: number;
        paidOrders: number;
        pendingOrders: number;
        usedCodes: number;
        unusedPaidCodes: number;
        totalRevenueCents: any;
        totalModels: number;
        publicModels: number;
        aiModels: number;
    };
    getUsers(): {
        id: any;
        email: any;
        username: any;
        tier: any;
        quota: {
            totalAiUsage: any;
            dailyAiUsage: any;
            monthlyAiUsage: any;
            aiUsed: number;
            aiLimit: number;
            limitType: "daily" | "total" | "monthly" | "unlimited";
        };
        createdAt: any;
        updatedAt: any;
    }[];
    getOrders(): any[];
    setUserTier(userId: string, tier: string): {
        success: boolean;
        tier: string;
    };
    deleteUser(userId: string): {
        success: boolean;
    };
    resetUserQuota(userId: string): {
        success: boolean;
    };
    getAllModels(page?: number, limit?: number, search?: string): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    adminGetModelDetail(modelId: string): Promise<any>;
    adminEnsureShare(modelId: string): {
        token: any;
    };
    adminDeleteModel(modelId: string): Promise<{
        success: boolean;
    }>;
    adminDeleteTemplate(templateId: string): Promise<{
        success: boolean;
    }>;
    getAdminTemplates(): any[];
    toggleTemplateFeatured(templateId: string, source?: string): {
        success: boolean;
        isFeatured: boolean;
    };
}
