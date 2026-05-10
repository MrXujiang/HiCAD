import { JsonDbService } from '../../database/json-db.service';
import { User, UserPublic } from '@hicad/shared';
export declare function computeQuotaDisplay(user: User): {
    aiUsed: number;
    aiLimit: number;
    limitType: 'daily' | 'total' | 'monthly' | 'unlimited';
};
export declare class UserService {
    private readonly db;
    constructor(db: JsonDbService);
    findById(id: string): User | undefined;
    getProfile(id: string): UserPublic;
    checkAndDecrementQuota(userId: string): {
        allowed: boolean;
        remaining: number;
    };
}
