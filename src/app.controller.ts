import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Lightweight health endpoint used by the frontend to warm up the
  // backend on Render's free tier (avoids the cold-start delay on the
  // first user-visible request).
  @Get('health')
  health() {
    return { ok: true, ts: Date.now() };
  }
}
