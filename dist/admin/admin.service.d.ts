import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        totalUsers: number;
        totalGenerations: number;
        activeUsers7d: number;
        avgCredits: number;
        topTone: string;
        topLang: string;
        totalTokens: any;
        tonesDistribution: {};
    }>;
    getSubscriptionRequests(): Promise<any>;
    approveSubscriptionRequest(requestId: string): Promise<void>;
    rejectSubscriptionRequest(requestId: string): Promise<any>;
    getUsers(search?: string): Promise<{
        lastUsed: Date;
        id: string;
        email: string;
        credits: number;
        role: string;
        subscriptionStatus: string;
        subscriptionTier: string | null;
        createdAt: Date;
        items: {
            createdAt: Date;
        }[];
        _count: {
            items: number;
        };
    }[]>;
    getUsageStats(): Promise<{
        label: string;
        val: number;
    }[]>;
    getAllContent(): Promise<({
        user: {
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        productName: string;
        category: string | null;
        tone: string;
        language: string;
        inputJson: import("@prisma/client/runtime/library").JsonValue;
        outputJson: import("@prisma/client/runtime/library").JsonValue;
        tokenUsage: import("@prisma/client/runtime/library").JsonValue | null;
        isSaved: boolean;
    })[]>;
    getUserContent(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        productName: string;
        category: string | null;
        tone: string;
        language: string;
        inputJson: import("@prisma/client/runtime/library").JsonValue;
        outputJson: import("@prisma/client/runtime/library").JsonValue;
        tokenUsage: import("@prisma/client/runtime/library").JsonValue | null;
        isSaved: boolean;
    }[]>;
}
