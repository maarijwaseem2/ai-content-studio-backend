import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.findOne(req.user.id);
  }

  @Post('subscribe')
  subscribe(@Request() req, @Body('tier') tier: string) {
    return this.userService.subscribe(req.user.id, tier);
  }

  @Post('delete-request')
  requestDeletion(@Request() req, @Body('reason') reason?: string) {
    return this.userService.requestDeletion(req.user.id, reason);
  }

  @Get('delete-request')
  getMyDeletionRequest(@Request() req) {
    return this.userService.getMyDeletionRequest(req.user.id);
  }
}
