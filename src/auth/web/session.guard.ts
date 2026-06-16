import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { UsersService } from '../../users/users.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const userId = req.session?.userId;
    if (!userId) {
      res.redirect('/login');
      return false;
    }

    const usuario = await this.usersService.findById(userId);
    if (!usuario || !usuario.ativo) {
      req.session.destroy(() => res.redirect('/login'));
      return false;
    }

    (req as Request & { usuario: typeof usuario }).usuario = usuario;
    return true;
  }
}
