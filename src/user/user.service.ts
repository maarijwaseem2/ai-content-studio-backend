import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
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

  async subscribe(userId: string, tier: string) {
    return this.prisma.subscriptionRequest.create({
      data: {
        userId,
        tier: tier.toUpperCase(),
        status: 'PENDING',
      },
    });
  }

  async requestDeletion(userId: string, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    if (user.role === 'ADMIN')
      throw new ForbiddenException('Admin accounts cannot request deletion');

    const existing = await this.prisma.accountDeletionRequest.findFirst({
      where: { userId, status: 'PENDING' },
    });
    if (existing)
      throw new ConflictException(
        'A deletion request is already pending for your account',
      );

    return this.prisma.accountDeletionRequest.create({
      data: {
        userId,
        reason: reason?.trim() || null,
        status: 'PENDING',
      },
    });
  }

  async getMyDeletionRequest(userId: string) {
    return this.prisma.accountDeletionRequest.findFirst({
      where: { userId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }
}
