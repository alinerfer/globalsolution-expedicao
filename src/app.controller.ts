import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { SessionGuard } from './auth/web/session.guard';

@Controller()
@UseGuards(SessionGuard)
export class AppController {
  @Get()
  raiz(@Res() res: Response) {
    return res.redirect('/pedidos');
  }
}
