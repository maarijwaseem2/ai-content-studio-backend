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
        creditLimit: number;
    } | null>;
    subscribe(userId: string, tier: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        tier: string;
        status: string;
        paymentInfo: string | null;
    }>;
    requestDeletion(userId: string, reason?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        reason: string | null;
    }>;
    getMyDeletionRequest(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        reason: string | null;
    } | null>;
}
