import { PrismaService } from '../prisma/prisma.service';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<{
        id: string;
        email: string;
        credits: number;
        role: string;
        subscriptionStatus: string;
        subscriptionTier: string | null;
    } | null>;
    subscribe(userId: string, tier: string): Promise<{
        id: string;
        createdAt: Date;
        tier: string;
        status: string;
        paymentInfo: string | null;
        userId: string;
    }>;
}
