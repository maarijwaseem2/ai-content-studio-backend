import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        credits: number;
        role: string;
        subscriptionStatus: string;
        subscriptionTier: string | null;
        creditLimit: number;
    } | null>;
    subscribe(req: any, tier: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        tier: string;
        status: string;
        paymentInfo: string | null;
    }>;
    requestDeletion(req: any, reason?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        reason: string | null;
    }>;
    getMyDeletionRequest(req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        reason: string | null;
    } | null>;
}
