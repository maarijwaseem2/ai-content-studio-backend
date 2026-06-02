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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
function isValidEmail(email) {
    return (typeof email === 'string' &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
}
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async signup(body) {
        if (!isValidEmail(body?.email))
            throw new common_1.BadRequestException('Invalid email');
        if (!body?.password || String(body.password).length < 6)
            throw new common_1.BadRequestException('Password must be at least 6 characters');
        return this.authService.signup(body.email.trim().toLowerCase(), body.password);
    }
    async login(body) {
        if (!isValidEmail(body?.email))
            throw new common_1.BadRequestException('Invalid email');
        return this.authService.loginWithStatus(body.email.trim().toLowerCase(), body.password);
    }
    async verifySignup(body) {
        if (!isValidEmail(body?.email))
            throw new common_1.BadRequestException('Invalid email');
        if (!body?.otp)
            throw new common_1.BadRequestException('OTP is required');
        return this.authService.verifySignup(body.email.trim().toLowerCase(), String(body.otp));
    }
    async resendSignupOtp(body) {
        if (!isValidEmail(body?.email))
            throw new common_1.BadRequestException('Invalid email');
        return this.authService.resendSignupOtp(body.email.trim().toLowerCase());
    }
    async forgotPassword(body) {
        if (!isValidEmail(body?.email))
            throw new common_1.BadRequestException('Invalid email');
        return this.authService.forgotPassword(body.email.trim().toLowerCase());
    }
    async verifyOtp(body) {
        if (!isValidEmail(body?.email))
            throw new common_1.BadRequestException('Invalid email');
        if (!body?.otp)
            throw new common_1.BadRequestException('OTP is required');
        return this.authService.verifyOtp(body.email.trim().toLowerCase(), String(body.otp));
    }
    async resetPassword(body) {
        if (!isValidEmail(body?.email))
            throw new common_1.BadRequestException('Invalid email');
        if (!body?.otp)
            throw new common_1.BadRequestException('OTP is required');
        if (!body?.newPassword || String(body.newPassword).length < 6)
            throw new common_1.BadRequestException('Password must be at least 6 characters');
        return this.authService.resetPassword(body.email.trim().toLowerCase(), String(body.otp), String(body.newPassword));
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('verify-signup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifySignup", null);
__decorate([
    (0, common_1.Post)('resend-signup-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendSignupOtp", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map