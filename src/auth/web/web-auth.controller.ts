import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { UserRole } from '../../users/enums/user-role.enum';
import { UsersService } from '../../users/users.service';

@Controller()
export class WebAuthController {
  constructor(private readonly usersService: UsersService) {}

  @Get('login')
  @Render('login')
  exibirLogin(@Query('erro') erro?: string) {
    return { titulo: 'Entrar', erro: erro === '1' };
  }

  @Post('login')
  async processarLogin(
    @Body() body: { email?: string; senha?: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const email = (body.email ?? '').trim().toLowerCase();
    const senha = body.senha ?? '';

    if (!email || !senha) {
      return res.redirect('/login?erro=1');
    }

    const usuario = await this.usersService.findByEmail(email);
    if (!usuario || !usuario.ativo || usuario.role !== UserRole.OPERADOR) {
      return res.redirect('/login?erro=1');
    }

    const senhaOk = await this.usersService.comparaSenha(
      senha,
      usuario.senhaHash,
    );
    if (!senhaOk) {
      return res.redirect('/login?erro=1');
    }

    req.session.userId = usuario.id;
    return res.redirect('/');
  }
}
