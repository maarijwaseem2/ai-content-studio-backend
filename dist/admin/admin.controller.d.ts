import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
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
    getUsers(search?: string): Promise<{
        lastUsed: Date;
        id: string;
        email: string;
        credits: number;
        role: string;
        subscriptionStatus: string;
        subscriptionTier: string | null;
        accountStatus: string;
        deletedAt: Date | null;
        createdAt: Date;
        items: {
            createdAt: Date;
        }[];
        _count: {
            items: number;
        };
    }[]>;
    getUsage(): Promise<{
        label: string;
        val: number;
    }[]>;
    getAllGenerations(): Promise<({
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
    getSubscriptionRequests(): Promise<any>;
    approveRequest(id: string): Promise<void>;
    rejectRequest(id: string): Promise<any>;
    getUserContent(id: string): Promise<{
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
    getDeletionRequests(): Promise<({
        user: {
            id: string;
            email: string;
            credits: number;
            role: string;
            subscriptionTier: string | null;
            createdAt: Date;
            _count: {
                items: number;
            };
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        reason: string | null;
    })[]>;
    approveDeletion(id: string): Promise<{
        message: string;
    }>;
    rejectDeletion(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        reason: string | null;
    }>;
}
