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
    } | null>;
    subscribe(req: any, tier: string): Promise<{
        id: string;
        createdAt: Date;
        tier: string;
        status: string;
        paymentInfo: string | null;
        userId: string;
    }>;
}
