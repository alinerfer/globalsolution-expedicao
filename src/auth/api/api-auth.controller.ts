import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../users/enums/user-role.enum';
import { UsersService } from '../../users/users.service';

@Controller('api/auth')
export class ApiAuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() body: { email?: string; senha?: string }) {
    const email = (body.email ?? '').trim().toLowerCase();
    const senha = body.senha ?? '';

    if (!email || !senha) {
      throw new BadRequestException('Informe email e senha.');
    }

    const usuario = await this.usersService.findByEmail(email);
    if (
      !usuario ||
      !usuario.ativo ||
      usuario.role !== UserRole.ENTREGADOR
    ) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const senhaOk = await this.usersService.comparaSenha(
      senha,
      usuario.senhaHash,
    );
    if (!senhaOk) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const token = await this.jwtService.signAsync({
      sub: usuario.id,
      role: usuario.role,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  }
}
