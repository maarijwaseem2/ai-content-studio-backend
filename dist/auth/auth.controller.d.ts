import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(body: any): Promise<{
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
    login(body: any): Promise<{
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
}
