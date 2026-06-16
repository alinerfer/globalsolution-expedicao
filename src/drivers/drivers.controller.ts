import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/web/session.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { UsersService } from '../users/users.service';

@Controller('entregadores')
@UseGuards(SessionGuard)
export class DriversController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render('drivers/list')
  async listar() {
    const entregadores = await this.usersService.listarPorRole(
      UserRole.ENTREGADOR,
    );
    return { titulo: 'Entregadores', entregadores };
  }
}
