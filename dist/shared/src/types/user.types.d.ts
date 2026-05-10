export type UserTier = 'free' | 'basic' | 'pro' | 'enterprise';
export interface UserQuota {
    dailyAiUsage: number;
    maxDailyAiUsage: number;
    lastResetDate: string;
    totalAiUsage: number;
    monthlyAiUsage?: number;
    lastMonthlyReset?: string;
}
export interface UserSubscription {
    startDate: string;
    endDate: string;
    provider: 'manual' | 'stripe' | 'jitpay';
}
export interface User {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    tier: UserTier;
    quota: UserQuota;
    subscription?: UserSubscription;
    createdAt: string;
    updatedAt: string;
}
export interface UserPublic {
    id: string;
    email: string;
    username: string;
    tier: UserTier;
    quota: {
        dailyAiUsage: number;
        maxDailyAiUsage: number;
        aiUsed: number;
        aiLimit: number;
        limitType: 'daily' | 'total' | 'monthly' | 'unlimited';
    };
    createdAt: string;
}
