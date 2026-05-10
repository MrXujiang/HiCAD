import { AdminService } from './admin.service';
import { FeedbackService } from '../feedback/feedback.service';
export declare class AdminController {
    private readonly adminService;
    private readonly feedbackService;
    constructor(adminService: AdminService, feedbackService: FeedbackService);
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
    setTier(id: string, body: {
        tier: string;
    }): {
        success: boolean;
        tier: string;
    };
    deleteUser(id: string): {
        success: boolean;
    };
    resetQuota(id: string): {
        success: boolean;
    };
    getAllModels(page?: string, limit?: string, search?: string): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getModelDetail(id: string): Promise<any>;
    ensureShare(id: string): {
        token: any;
    };
    deleteModel(id: string): Promise<{
        success: boolean;
    }>;
    deleteTemplate(id: string): Promise<{
        success: boolean;
    }>;
    getFeedbacks(): import("../feedback/feedback.service").Feedback[];
    deleteFeedback(id: string): {
        success: boolean;
    };
    getTemplates(): any[];
    toggleFeatured(id: string, body: {
        source?: string;
    }): {
        success: boolean;
        isFeatured: boolean;
    };
}
