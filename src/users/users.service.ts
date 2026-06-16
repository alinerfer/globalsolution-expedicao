import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  listarPorRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({
      where: { role },
      order: { nome: 'ASC' },
    });
  }

  async criar(dados: {
    nome: string;
    email: string;
    senhaHash: string;
    role: UserRole;
  }): Promise<User> {
    const user = this.usersRepository.create({
      nome: dados.nome,
      email: dados.email,
      senhaHash: dados.senhaHash,
      role: dados.role,
    });
    return this.usersRepository.save(user);
  }
}
