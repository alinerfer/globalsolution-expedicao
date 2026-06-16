import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
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

  @Get(':id')
  async detalhe(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const usuario = (req as Request & { usuario: User }).usuario;
    const pedido = await this.ordersService.findById(id);
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado.');
    }
    if (pedido.entregadorId !== usuario.id) {
      throw new ForbiddenException('Pedido não pertence a você.');
    }
    return {
      id: pedido.id,
      clienteNome: pedido.clienteNome,
      clienteTelefone: pedido.clienteTelefone,
      enderecoEntrega: pedido.enderecoEntrega,
      latitude: pedido.latitude,
      longitude: pedido.longitude,
      observacoes: pedido.observacoes,
      valorTotal: pedido.valorTotal,
      status: pedido.status,
      itens: pedido.itens.map((i) => ({
        id: i.id,
        nome: i.nome,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
      })),
      createdAt: pedido.createdAt,
    };
  }
}
