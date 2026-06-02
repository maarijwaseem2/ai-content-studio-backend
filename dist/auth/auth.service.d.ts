import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    signup(email: string, pass: string): Promise<{
        requiresVerification: boolean;
        email: string;
        otp: string;
        message: string;
    }>;
    verifySignup(email: string, otp: string): Promise<{
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
    resendSignupOtp(email: string): Promise<{
        email: string;
        otp: string;
        message: string;
    }>;
    login(user: any): Promise<{
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
    }>;
    validateUser(email: string, pass: string): Promise<any>;
    loginWithStatus(email: string, pass: string): Promise<{
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
    forgotPassword(email: string): Promise<{
        message: string;
        otp: string;
        email: string;
    }>;
    verifyOtp(email: string, otp: string): Promise<{
        valid: boolean;
    }>;
    resetPassword(email: string, otp: string, newPassword: string): Promise<{
        message: string;
    }>;
}
