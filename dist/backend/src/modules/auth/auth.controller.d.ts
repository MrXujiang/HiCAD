import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(dto: RefreshTokenDto): Promise<{
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
}
