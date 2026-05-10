import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(configService: ConfigService);
    validate(payload: {
        sub: string;
        email: string;
        tier: string;
    }): Promise<{
        id: string;
        email: string;
        tier: string;
    }>;
}
export {};
