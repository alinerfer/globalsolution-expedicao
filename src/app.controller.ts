import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { SessionGuard } from './auth/web/session.guard';

@Controller()
@UseGuards(SessionGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('home')
  getHome() {
    return { titulo: this.appService.getHello() };
  }
}
