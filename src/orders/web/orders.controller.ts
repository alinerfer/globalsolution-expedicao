import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../../auth/web/session.guard';
import {
  ORDER_STATUS_LABEL,
  OrderStatus,
} from '../enums/order-status.enum';
import { OrdersService } from '../orders.service';

const COLUNAS_KANBAN: OrderStatus[] = [
  OrderStatus.PENDENTE,
  OrderStatus.EM_PREPARO,
  OrderStatus.PRONTO,
  OrderStatus.SAIU_PARA_ENTREGA,
  OrderStatus.ENTREGUE,
];

@Controller('pedidos')
@UseGuards(SessionGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Render('orders/kanban')
  async kanban() {
    const agrupado = await this.ordersService.listarAgrupadoPorStatus();
    const colunas = COLUNAS_KANBAN.map((status) => ({
      status,
      label: ORDER_STATUS_LABEL[status],
      pedidos: agrupado[status],
    }));
    return { titulo: 'Pedidos', colunas };
  }
}
