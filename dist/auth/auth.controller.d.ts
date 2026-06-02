import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(body: any): Promise<{
        requiresVerification: boolean;
        email: string;
        otp: string;
        message: string;
    }>;
    login(body: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            credits: any;
            creditLimit: any;
            role: any;
            subscriptionStatus: any;
            subscriptionTier: any;
        };
    } | {
        requiresVerification: boolean;
        email: string;
        otp: string;
        message: string;
    }>;
    verifySignup(body: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            credits: any;
            creditLimit: any;
            role: any;
            subscriptionStatus: any;
            subscriptionTier: any;
        };
    } | {
        alreadyVerified: boolean;
        message: string;
    }>;
    resendSignupOtp(body: any): Promise<{
        email: string;
        otp: string;
        message: string;
    }>;
    forgotPassword(body: any): Promise<{
        message: string;
        otp: string;
        email: string;
    }>;
    verifyOtp(body: any): Promise<{
        valid: boolean;
    }>;
    resetPassword(body: any): Promise<{
        message: string;
    }>;
}
