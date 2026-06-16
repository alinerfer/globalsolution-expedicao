import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { SessionGuard } from '../auth/web/session.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { UsersService } from '../users/users.service';

@Controller('entregadores')
@UseGuards(SessionGuard)
export class DriversController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render('drivers/list')
  async listar(@Query('criado') criado?: string) {
    const entregadores = await this.usersService.listarPorRole(
      UserRole.ENTREGADOR,
    );
    return {
      titulo: 'Entregadores',
      entregadores,
      criado: criado === '1',
    };
  }

  @Get('novo')
  @Render('drivers/form')
  exibirNovo(@Query('erro') erro?: string) {
    return {
      titulo: 'Novo entregador',
      erro: erro ?? null,
      entregador: { nome: '', email: '' },
      action: '/entregadores',
      mostrarSenha: true,
    };
  }

  @Post()
  async criar(
    @Body() body: { nome?: string; email?: string; senha?: string },
    @Res() res: Response,
  ) {
    const nome = (body.nome ?? '').trim();
    const email = (body.email ?? '').trim().toLowerCase();
    const senha = body.senha ?? '';

    if (!nome || !email || senha.length < 6) {
      return res.redirect('/entregadores/novo?erro=campos');
    }

    const jaExiste = await this.usersService.findByEmail(email);
    if (jaExiste) {
      return res.redirect('/entregadores/novo?erro=email');
    }

    const senhaHash = await this.usersService.hashSenha(senha);
    await this.usersService.criar({
      nome,
      email,
      senhaHash,
      role: UserRole.ENTREGADOR,
    });

    return res.redirect('/entregadores?criado=1');
  }
}
