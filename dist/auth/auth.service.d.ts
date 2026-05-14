import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    signup(email: string, pass: string): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            credits: any;
            role: any;
            subscriptionStatus: any;
            subscriptionTier: any;
        };
    }>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            credits: any;
            role: any;
            subscriptionStatus: any;
            subscriptionTier: any;
        };
    }>;
    validateUser(email: string, pass: string): Promise<any>;
}
