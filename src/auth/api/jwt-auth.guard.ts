import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { UserRole } from '../../users/enums/user-role.enum';
import { UsersService } from '../../users/users.service';

interface JwtPayload {
  sub: number;
  role: UserRole;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization ?? '';

    const [tipo, token] = header.split(' ');
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token ausente.');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido.');
    }

    const usuario = await this.usersService.findById(payload.sub);
    if (!usuario || !usuario.ativo || usuario.role !== UserRole.ENTREGADOR) {
      throw new UnauthorizedException('Usuário sem permissão.');
    }

    (req as Request & { usuario: typeof usuario }).usuario = usuario;
    return true;
  }
}
