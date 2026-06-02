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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                credits: true,
                creditLimit: true,
                role: true,
                subscriptionStatus: true,
                subscriptionTier: true,
            },
        });
    }
    async subscribe(userId, tier) {
        return this.prisma.subscriptionRequest.create({
            data: {
                userId,
                tier: tier.toUpperCase(),
                status: 'PENDING',
            },
        });
    }
    async requestDeletion(userId, reason) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        if (user.role === 'ADMIN')
            throw new common_1.ForbiddenException('Admin accounts cannot request deletion');
        const existing = await this.prisma.accountDeletionRequest.findFirst({
            where: { userId, status: 'PENDING' },
        });
        if (existing)
            throw new common_1.ConflictException('A deletion request is already pending for your account');
        return this.prisma.accountDeletionRequest.create({
            data: {
                userId,
                reason: reason?.trim() || null,
                status: 'PENDING',
            },
        });
    }
    async getMyDeletionRequest(userId) {
        return this.prisma.accountDeletionRequest.findFirst({
            where: { userId, status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map