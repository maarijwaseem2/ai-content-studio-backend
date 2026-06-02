import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const OTP_TTL_MS = 10 * 60 * 1000;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(email: string, pass: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.accountStatus === 'PENDING') {
        // Re-issue a fresh OTP for the unverified account
        const otp = generateOtp();
        await this.prisma.user.update({
          where: { id: existing.id },
          data: {
            verificationOtp: otp,
            verificationOtpExpires: new Date(Date.now() + OTP_TTL_MS),
          },
        });
        return {
          requiresVerification: true,
          email: existing.email,
          otp,
          message:
            'Account already exists but is unverified. A new OTP has been issued.',
        };
      }
      if (existing.accountStatus === 'DELETED') {
        throw new ForbiddenException('Account has been deleted');
      }
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(pass, 10);
    const otp = generateOtp();

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        accountStatus: 'PENDING',
        verificationOtp: otp,
        verificationOtpExpires: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    return {
      requiresVerification: true,
      email: user.email,
      otp,
      message:
        'Account created. Verify your email with the OTP to start using it.',
    };
  }

  async verifySignup(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('No account with this email');
    if (user.accountStatus === 'DELETED')
      throw new ForbiddenException('Account has been deleted');
    if (user.accountStatus === 'VERIFIED')
      return { alreadyVerified: true, message: 'Account already verified.' };

    if (
      !user.verificationOtp ||
      user.verificationOtp !== otp ||
      !user.verificationOtpExpires ||
      user.verificationOtpExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const verified = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        accountStatus: 'VERIFIED',
        verificationOtp: null,
        verificationOtpExpires: null,
      },
    });

    return this.login(verified);
  }

  async resendSignupOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('No account with this email');
    if (user.accountStatus === 'DELETED')
      throw new ForbiddenException('Account has been deleted');
    if (user.accountStatus !== 'PENDING')
      throw new BadRequestException('Account is not pending verification');

    const otp = generateOtp();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationOtp: otp,
        verificationOtpExpires: new Date(Date.now() + OTP_TTL_MS),
      },
    });
    return { email, otp, message: 'A new OTP has been issued.' };
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
        creditLimit: user.creditLimit ?? 250,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus ?? 'FREE',
        subscriptionTier: user.subscriptionTier ?? null,
      },
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  // Full login flow: validates creds, then handles account status branches.
  // - DELETED -> 403
  // - PENDING -> issues fresh OTP and returns { requiresVerification }
  // - VERIFIED -> normal login response
  async loginWithStatus(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(pass, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.accountStatus === 'DELETED') {
      throw new ForbiddenException('This account has been deleted');
    }

    if (user.accountStatus === 'PENDING') {
      const otp = generateOtp();
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          verificationOtp: otp,
          verificationOtpExpires: new Date(Date.now() + OTP_TTL_MS),
        },
      });
      return {
        requiresVerification: true,
        email: user.email,
        otp,
        message: 'Account pending verification. Use the OTP to verify.',
      };
    }

    const { passwordHash, ...safeUser } = user;
    return this.login(safeUser);
  }

  // Generates a 6-digit OTP, stores it (10 min TTL), and returns it so the
  // frontend can display it (no email infra required — free demo mode).
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('No account with this email');
    if (user.accountStatus === 'DELETED')
      throw new ForbiddenException('This account has been deleted');

    await this.prisma.passwordReset.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.passwordReset.create({
      data: { userId: user.id, otp, expiresAt },
    });

    return {
      message: 'OTP generated. Use it within 10 minutes.',
      otp,
      email,
    };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('No account with this email');

    const reset = await this.prisma.passwordReset.findFirst({
      where: { userId: user.id, otp, used: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!reset) throw new BadRequestException('Invalid OTP');
    if (reset.expiresAt < new Date())
      throw new BadRequestException('OTP expired');

    return { valid: true };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('No account with this email');

    const reset = await this.prisma.passwordReset.findFirst({
      where: { userId: user.id, otp, used: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!reset) throw new BadRequestException('Invalid OTP');
    if (reset.expiresAt < new Date())
      throw new BadRequestException('OTP expired');

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.passwordReset.update({
        where: { id: reset.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Password reset successful. You can sign in now.' };
  }
}
