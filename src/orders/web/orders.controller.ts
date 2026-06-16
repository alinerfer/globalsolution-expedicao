import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { SessionGuard } from '../../auth/web/session.guard';
import { LocationsService } from '../../locations/locations.service';
import { UserRole } from '../../users/enums/user-role.enum';
import { UsersService } from '../../users/users.service';
import {
  ORDER_STATUS_LABEL,
  OrderStatus,
} from '../enums/order-status.enum';
import { OrdersService } from '../orders.service';

const COLUNAS_KANBAN: OrderStatus[] = [
  OrderStatus.PENDENTE,
  OrderStatus.EM_PREPARO,
  OrderStatus.PRONTO,
  OrderStatus.ATRIBUIDO,
  OrderStatus.SAIU_PARA_ENTREGA,
  OrderStatus.ENTREGUE,
];

@Controller('pedidos')
@UseGuards(SessionGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly locationsService: LocationsService,
  ) {}

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

  @Get('novo')
  @Render('orders/form')
  exibirNovo(@Query('erro') erro?: string) {
    return { titulo: 'Novo pedido', erro: erro ?? null };
  }

  @Get(':id')
  @Render('orders/detail')
  async detalhe(
    @Param('id', ParseIntPipe) id: number,
    @Query('erro') erro?: string,
  ) {
    const pedido = await this.ordersService.findById(id);
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    const podeAtribuir = pedido.status === OrderStatus.PRONTO;
    const entregadores = podeAtribuir
      ? (await this.usersService.listarPorRole(UserRole.ENTREGADOR)).filter(
          (e) => e.ativo,
        )
      : [];

    return {
      titulo: `Pedido #${pedido.id}`,
      pedido,
      statusLabel: ORDER_STATUS_LABEL[pedido.status],
      podePreparar: pedido.status === OrderStatus.PENDENTE,
      podeMarcarPronto: pedido.status === OrderStatus.EM_PREPARO,
      podeAtribuir,
      podeCancelar: [
        OrderStatus.PENDENTE,
        OrderStatus.EM_PREPARO,
        OrderStatus.PRONTO,
      ].includes(pedido.status),
      entregadores,
      erro: erro ?? null,
    };
  }

  @Post(':id/preparar')
  async preparar(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.ordersService.transicionar(id, OrderStatus.EM_PREPARO);
    return res.redirect(`/pedidos/${id}`);
  }

  @Post(':id/pronto')
  async marcarPronto(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.ordersService.transicionar(id, OrderStatus.PRONTO);
    return res.redirect(`/pedidos/${id}`);
  }

  @Post(':id/cancelar')
  async cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.ordersService.transicionar(id, OrderStatus.CANCELADO);
    return res.redirect(`/pedidos/${id}`);
  }

  @Get(':id/localizacao')
  async localizacao(@Param('id', ParseIntPipe) id: number) {
    const pedido = await this.ordersService.findById(id);
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado.');
    }
    if (!pedido.entregadorId) {
      return { temPosicao: false };
    }
    const ultima = await this.locationsService.ultimaPorDriver(
      pedido.entregadorId,
    );
    if (!ultima) {
      return { temPosicao: false };
    }
    return {
      temPosicao: true,
      latitude: ultima.latitude,
      longitude: ultima.longitude,
      recordedAt: ultima.recordedAt,
    };
  }

  @Post(':id/atribuir')
  async atribuirEntregador(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { entregadorId?: string },
    @Res() res: Response,
  ) {
    const entregadorId = parseInt(body.entregadorId ?? '', 10);
    if (!Number.isFinite(entregadorId)) {
      return res.redirect(`/pedidos/${id}?erro=entregador`);
    }

    const entregador = await this.usersService.findById(entregadorId);
    if (
      !entregador ||
      !entregador.ativo ||
      entregador.role !== UserRole.ENTREGADOR
    ) {
      return res.redirect(`/pedidos/${id}?erro=entregador`);
    }

    await this.ordersService.atribuirEntregador(id, entregadorId);
    return res.redirect(`/pedidos/${id}`);
  }

  @Post()
  async criar(
    @Body()
    body: {
      clienteNome?: string;
      clienteTelefone?: string;
      enderecoEntrega?: string;
      latitude?: string;
      longitude?: string;
      observacoes?: string;
      itensNome?: string | string[];
      itensQuantidade?: string | string[];
      itensPrecoUnitario?: string | string[];
    },
    @Res() res: Response,
  ) {
    const clienteNome = (body.clienteNome ?? '').trim();
    const clienteTelefone = (body.clienteTelefone ?? '').trim();
    const enderecoEntrega = (body.enderecoEntrega ?? '').trim();
    const observacoes = (body.observacoes ?? '').trim() || null;

    if (!clienteNome || !clienteTelefone || !enderecoEntrega) {
      return res.redirect('/pedidos/novo?erro=campos');
    }

    const latitude = parseOpcional(body.latitude);
    const longitude = parseOpcional(body.longitude);

    const nomes = toArray(body.itensNome);
    const quantidades = toArray(body.itensQuantidade).map((v) =>
      parseInt(v, 10),
    );
    const precos = toArray(body.itensPrecoUnitario).map((v) =>
      parseFloat(v.replace(',', '.')),
    );

    const itens = nomes
      .map((nome, i) => ({
        nome: nome.trim(),
        quantidade: quantidades[i],
        precoUnitario: precos[i],
      }))
      .filter(
        (i) =>
          i.nome.length > 0 &&
          Number.isFinite(i.quantidade) &&
          i.quantidade > 0 &&
          Number.isFinite(i.precoUnitario) &&
          i.precoUnitario >= 0,
      );

    if (itens.length === 0) {
      return res.redirect('/pedidos/novo?erro=itens');
    }

    try {
      const pedido = await this.ordersService.criar({
        clienteNome,
        clienteTelefone,
        enderecoEntrega,
        latitude,
        longitude,
        observacoes,
        itens,
      });
      return res.redirect(`/pedidos/${pedido.id}`);
    } catch (e) {
      if (e instanceof BadRequestException) {
        return res.redirect('/pedidos/novo?erro=itens');
      }
      throw e;
    }
  }
}

function parseOpcional(valor: string | undefined): number | null {
  if (!valor || valor.trim() === '') {
    return null;
  }
  const n = parseFloat(valor.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function toArray(valor: string | string[] | undefined): string[] {
  if (!valor) {
    return [];
  }
  return Array.isArray(valor) ? valor : [valor];
}
