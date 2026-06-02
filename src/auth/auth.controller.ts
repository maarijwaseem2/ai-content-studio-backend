import {
  Controller,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

function isValidEmail(email: unknown): email is string {
  return (
    typeof email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: any) {
    if (!isValidEmail(body?.email))
      throw new BadRequestException('Invalid email');
    if (!body?.password || String(body.password).length < 6)
      throw new BadRequestException('Password must be at least 6 characters');
    return this.authService.signup(body.email.trim().toLowerCase(), body.password);
  }

  @Post('login')
  async login(@Body() body: any) {
    if (!isValidEmail(body?.email))
      throw new BadRequestException('Invalid email');
    return this.authService.loginWithStatus(
      body.email.trim().toLowerCase(),
      body.password,
    );
  }

  @Post('verify-signup')
  async verifySignup(@Body() body: any) {
    if (!isValidEmail(body?.email))
      throw new BadRequestException('Invalid email');
    if (!body?.otp) throw new BadRequestException('OTP is required');
    return this.authService.verifySignup(
      body.email.trim().toLowerCase(),
      String(body.otp),
    );
  }

  @Post('resend-signup-otp')
  async resendSignupOtp(@Body() body: any) {
    if (!isValidEmail(body?.email))
      throw new BadRequestException('Invalid email');
    return this.authService.resendSignupOtp(
      body.email.trim().toLowerCase(),
    );
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: any) {
    if (!isValidEmail(body?.email))
      throw new BadRequestException('Invalid email');
    return this.authService.forgotPassword(body.email.trim().toLowerCase());
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: any) {
    if (!isValidEmail(body?.email))
      throw new BadRequestException('Invalid email');
    if (!body?.otp) throw new BadRequestException('OTP is required');
    return this.authService.verifyOtp(
      body.email.trim().toLowerCase(),
      String(body.otp),
    );
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    if (!isValidEmail(body?.email))
      throw new BadRequestException('Invalid email');
    if (!body?.otp) throw new BadRequestException('OTP is required');
    if (!body?.newPassword || String(body.newPassword).length < 6)
      throw new BadRequestException('Password must be at least 6 characters');
    return this.authService.resetPassword(
      body.email.trim().toLowerCase(),
      String(body.otp),
      String(body.newPassword),
    );
  }
}
