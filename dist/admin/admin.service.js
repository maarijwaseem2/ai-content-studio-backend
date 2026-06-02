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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const totalUsers = await this.prisma.user.count();
        const totalGenerations = await this.prisma.content.count();
        const avgCredits = await this.prisma.user.aggregate({
            _avg: { credits: true },
        });
        const activeUsers7d = await this.prisma.user.count({
            where: {
                items: {
                    some: {
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        },
                    },
                },
            },
        });
        const generations = await this.prisma.content.findMany({
            select: { tokenUsage: true, tone: true, language: true },
        });
        const totalTokensAllTime = generations.reduce((acc, curr) => {
            const usage = curr.tokenUsage;
            return acc + (usage?.total_tokens || 0);
        }, 0);
        const tones = generations.reduce((acc, curr) => {
            const tone = curr.tone || 'Neutral';
            acc[tone] = (acc[tone] || 0) + 1;
            return acc;
        }, {});
        const langs = generations.reduce((acc, curr) => {
            const lang = curr.language || 'English';
            acc[lang] = (acc[lang] || 0) + 1;
            return acc;
        }, {});
        const topTone = Object.entries(tones).sort((a, b) => b[1] - a[1])[0]?.[0] ||
            '—';
        const topLang = Object.entries(langs).sort((a, b) => b[1] - a[1])[0]?.[0] ||
            '—';
        return {
            totalUsers,
            totalGenerations,
            activeUsers7d,
            avgCredits: Math.round(avgCredits._avg.credits || 0),
            topTone,
            topLang,
            totalTokens: totalTokensAllTime,
            tonesDistribution: tones,
        };
    }
    async getSubscriptionRequests() {
        return this.prisma.subscriptionRequest.findMany({
            where: { status: 'PENDING' },
            include: { user: { select: { email: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveSubscriptionRequest(requestId) {
        const request = await this.prisma.subscriptionRequest.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new Error('Request not found');
        const creditsMap = {
            FREE: 20,
            STARTER: 250,
            PRO: 1000,
            BUSINESS: 5000,
        };
        return this.prisma.$transaction(async (tx) => {
            await tx.subscriptionRequest.update({
                where: { id: requestId },
                data: { status: 'APPROVED' },
            });
            const existing = await tx.user.findUnique({
                where: { id: request.userId },
            });
            if (!existing)
                throw new Error('User not found');
            const tierCredits = creditsMap[request.tier.toUpperCase()] || 0;
            const newCredits = existing.credits + tierCredits;
            const newLimit = Math.max(existing.creditLimit ?? 250, newCredits);
            await tx.user.update({
                where: { id: request.userId },
                data: {
                    subscriptionStatus: 'ACTIVE',
                    subscriptionTier: request.tier,
                    credits: newCredits,
                    creditLimit: newLimit,
                },
            });
        });
    }
    async rejectSubscriptionRequest(requestId) {
        return this.prisma.subscriptionRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' },
        });
    }
    async getUsers(search) {
        const where = search
            ? {
                email: { contains: search },
            }
            : {};
        const users = await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                role: true,
                credits: true,
                subscriptionStatus: true,
                subscriptionTier: true,
                accountStatus: true,
                deletedAt: true,
                createdAt: true,
                _count: {
                    select: { items: true },
                },
                items: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { createdAt: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return users.map((u) => ({
            ...u,
            lastUsed: u.items[0]?.createdAt || null,
        }));
    }
    async getUsageStats() {
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const content = await this.prisma.content.findMany({
            where: { createdAt: { gte: fourteenDaysAgo } },
            select: { createdAt: true },
        });
        const stats = Array.from({ length: 14 }, (_, i) => {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dayLabel = `D${14 - i}`;
            const count = content.filter((c) => c.createdAt.toDateString() === date.toDateString()).length;
            return { label: dayLabel, val: count };
        }).reverse();
        return stats;
    }
    async getAllContent() {
        return this.prisma.content.findMany({
            include: { user: { select: { email: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async getUserContent(userId) {
        return this.prisma.content.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getDeletionRequests() {
        return this.prisma.accountDeletionRequest.findMany({
            where: { status: 'PENDING' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        credits: true,
                        role: true,
                        subscriptionTier: true,
                        createdAt: true,
                        _count: { select: { items: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveDeletionRequest(requestId) {
        const req = await this.prisma.accountDeletionRequest.findUnique({
            where: { id: requestId },
        });
        if (!req)
            throw new Error('Request not found');
        return this.prisma.$transaction(async (tx) => {
            await tx.accountDeletionRequest.update({
                where: { id: requestId },
                data: { status: 'APPROVED' },
            });
            await tx.user.update({
                where: { id: req.userId },
                data: {
                    accountStatus: 'DELETED',
                    deletedAt: new Date(),
                    verificationOtp: null,
                    verificationOtpExpires: null,
                },
            });
            return { message: 'Account marked as deleted' };
        });
    }
    async rejectDeletionRequest(requestId) {
        return this.prisma.accountDeletionRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map