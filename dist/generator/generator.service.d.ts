import { PrismaService } from '../prisma/prisma.service';
export declare class GeneratorService {
    private prisma;
    private openai;
    constructor(prisma: PrismaService);
    generate(userId: string, input: any): Promise<any>;
}
