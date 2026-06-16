import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/api/jwt-auth.guard';
import { User } from '../../users/entities/user.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrdersService } from '../orders.service';

const STATUS_EM_ANDAMENTO = [OrderStatus.SAIU_PARA_ENTREGA];

@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class ApiOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('mine')
  async meusPedidos(@Req() req: Request) {
    const usuario = (req as Request & { usuario: User }).usuario;
    const pedidos = await this.ordersService.listarPorEntregador(
      usuario.id,
      STATUS_EM_ANDAMENTO,
    );
    return pedidos.map((p) => ({
      id: p.id,
      clienteNome: p.clienteNome,
      clienteTelefone: p.clienteTelefone,
      enderecoEntrega: p.enderecoEntrega,
      latitude: p.latitude,
      longitude: p.longitude,
      valorTotal: p.valorTotal,
      status: p.status,
      createdAt: p.createdAt,
    }));
  }
}
