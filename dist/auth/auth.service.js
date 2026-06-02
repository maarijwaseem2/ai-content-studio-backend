"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const OTP_TTL_MS = 10 * 60 * 1000;
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async signup(email, pass) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            if (existing.accountStatus === 'PENDING') {
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
                    message: 'Account already exists but is unverified. A new OTP has been issued.',
                };
            }
            if (existing.accountStatus === 'DELETED') {
                throw new common_1.ForbiddenException('Account has been deleted');
            }
            throw new common_1.ConflictException('Email already exists');
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
            message: 'Account created. Verify your email with the OTP to start using it.',
        };
    }
    async verifySignup(email, otp) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException('No account with this email');
        if (user.accountStatus === 'DELETED')
            throw new common_1.ForbiddenException('Account has been deleted');
        if (user.accountStatus === 'VERIFIED')
            return { alreadyVerified: true, message: 'Account already verified.' };
        if (!user.verificationOtp ||
            user.verificationOtp !== otp ||
            !user.verificationOtpExpires ||
            user.verificationOtpExpires < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
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
    async resendSignupOtp(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException('No account with this email');
        if (user.accountStatus === 'DELETED')
            throw new common_1.ForbiddenException('Account has been deleted');
        if (user.accountStatus !== 'PENDING')
            throw new common_1.BadRequestException('Account is not pending verification');
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
    async login(user) {
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
    async validateUser(email, pass) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async loginWithStatus(email, pass) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(pass, user.passwordHash))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.accountStatus === 'DELETED') {
            throw new common_1.ForbiddenException('This account has been deleted');
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
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException('No account with this email');
        if (user.accountStatus === 'DELETED')
            throw new common_1.ForbiddenException('This account has been deleted');
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
    async verifyOtp(email, otp) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException('No account with this email');
        const reset = await this.prisma.passwordReset.findFirst({
            where: { userId: user.id, otp, used: false },
            orderBy: { createdAt: 'desc' },
        });
        if (!reset)
            throw new common_1.BadRequestException('Invalid OTP');
        if (reset.expiresAt < new Date())
            throw new common_1.BadRequestException('OTP expired');
        return { valid: true };
    }
    async resetPassword(email, otp, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException('No account with this email');
        const reset = await this.prisma.passwordReset.findFirst({
            where: { userId: user.id, otp, used: false },
            orderBy: { createdAt: 'desc' },
        });
        if (!reset)
            throw new common_1.BadRequestException('Invalid OTP');
        if (reset.expiresAt < new Date())
            throw new common_1.BadRequestException('OTP expired');
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map