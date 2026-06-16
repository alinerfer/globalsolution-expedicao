import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UserRole } from './enums/user-role.enum';
import { UsersService } from './users.service';

@Injectable()
export class UsersSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersSeedService.name);

  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    const emailAdmin = 'admin@expedicao.com';
    const existente = await this.usersService.findByEmail(emailAdmin);
    if (existente) {
      return;
    }

    const senhaHash = await this.usersService.hashSenha('admin123');
    await this.usersService.criar({
      nome: 'Administrador',
      email: emailAdmin,
      senhaHash,
      role: UserRole.OPERADOR,
    });
    this.logger.log(`Operador admin criado: ${emailAdmin} / admin123`);
  }
}
