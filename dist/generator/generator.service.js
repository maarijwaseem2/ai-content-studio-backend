"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const openai_1 = __importDefault(require("openai"));
let GeneratorService = class GeneratorService {
    prisma;
    openai;
    constructor(prisma) {
        this.prisma = prisma;
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY || 'placeholder',
        });
    }
    async generate(userId, input) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        if (user.role === 'ADMIN') {
            throw new common_1.BadRequestException('Admins cannot generate content');
        }
        if (user.credits <= 0) {
            throw new common_1.BadRequestException('Insufficient credits');
        }
        const prompt = `Generate product marketing content for:
Product: ${input.productName}
Category: ${input.category}
Features: ${input.features}
Audience: ${input.audience}
Tone: ${input.tone}
Language: ${input.language}

Return a JSON object with:
{
  "description": "...",
  "highlights": ["...", "..."],
  "metaTitle": "...",
  "metaDescription": "...",
  "adCopy": "...",
  "socialCaption": "..."
}`;
        let output;
        let usage = null;
        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    { role: 'system', content: 'You are a professional copywriter.' },
                    { role: 'user', content: prompt },
                ],
                model: process.env.AI_MODEL || 'gpt-4o',
                response_format: { type: 'json_object' },
            });
            output = JSON.parse(completion.choices[0].message.content || '{}');
            usage = completion.usage;
        }
        catch (e) {
            output = {
                description: 'Exquisitely crafted, the ' +
                    input.productName +
                    ' is a product designed for discerning customers.',
                highlights: ['Premium quality', 'Durable design'],
                metaTitle: input.productName + ' | Premium Product',
                metaDescription: 'The best ' + input.productName + ' in the market.',
                adCopy: 'Buy ' + input.productName + ' now!',
                socialCaption: 'Check out this ' + input.productName + ' ✨ #new',
            };
        }
        const item = await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { credits: { decrement: 1 } },
            });
            return tx.content.create({
                data: {
                    userId,
                    productName: input.productName,
                    category: input.category,
                    tone: input.tone,
                    language: input.language,
                    inputJson: input,
                    outputJson: output,
                    tokenUsage: usage,
                },
            });
        });
        return item;
    }
};
exports.GeneratorService = GeneratorService;
exports.GeneratorService = GeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GeneratorService);
//# sourceMappingURL=generator.service.js.map