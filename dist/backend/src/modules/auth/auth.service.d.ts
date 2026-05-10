import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JsonDbService } from '../../database/json-db.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly db;
    private readonly jwt;
    private readonly config;
    constructor(db: JsonDbService, jwt: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            username: string;
            tier: import("@hicad/shared").UserTier;
            quota: {
                aiUsed: number;
                aiLimit: number;
                limitType: "daily" | "total" | "monthly" | "unlimited";
                dailyAiUsage: number;
                maxDailyAiUsage: number;
            };
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            username: string;
            tier: import("@hicad/shared").UserTier;
            quota: {
                aiUsed: number;
                aiLimit: number;
                limitType: "daily" | "total" | "monthly" | "unlimited";
                dailyAiUsage: number;
                maxDailyAiUsage: number;
            };
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            username: string;
            tier: import("@hicad/shared").UserTier;
            quota: {
                aiUsed: number;
                aiLimit: number;
                limitType: "daily" | "total" | "monthly" | "unlimited";
                dailyAiUsage: number;
                maxDailyAiUsage: number;
            };
        };
    }>;
    private issueTokens;
}
