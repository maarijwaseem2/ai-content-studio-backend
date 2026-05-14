import { ContentService } from './content.service';
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    findAll(req: any): Promise<{
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
    findSaved(req: any): Promise<{
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
    update(id: string, req: any, body: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
    remove(id: string, req: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
