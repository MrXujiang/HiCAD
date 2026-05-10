export declare class RegisterDto {
    email: string;
    username?: string;
    password: string;
    activationCode: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
