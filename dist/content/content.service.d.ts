import { PrismaService } from '../prisma/prisma.service';
export declare class ContentService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
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
    findSaved(userId: string): Promise<{
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
    update(id: string, userId: string, data: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
