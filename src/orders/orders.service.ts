import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';

const TRANSICOES_VALIDAS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDENTE]: [OrderStatus.EM_PREPARO, OrderStatus.CANCELADO],
  [OrderStatus.EM_PREPARO]: [OrderStatus.PRONTO, OrderStatus.CANCELADO],
  [OrderStatus.PRONTO]: [OrderStatus.ATRIBUIDO, OrderStatus.CANCELADO],
  [OrderStatus.ATRIBUIDO]: [
    OrderStatus.SAIU_PARA_ENTREGA,
    OrderStatus.CANCELADO,
  ],
  [OrderStatus.SAIU_PARA_ENTREGA]: [OrderStatus.ENTREGUE],
  [OrderStatus.ENTREGUE]: [],
  [OrderStatus.CANCELADO]: [],
};

export interface ItemEntrada {
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

export interface DadosNovoPedido {
  clienteNome: string;
  clienteTelefone: string;
  enderecoEntrega: string;
  latitude?: number | null;
  longitude?: number | null;
  observacoes?: string | null;
  itens: ItemEntrada[];
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  listarTodos(): Promise<Order[]> {
    return this.ordersRepository.find({
      order: { createdAt: 'DESC' },
      relations: { entregador: true },
    });
  }

  async listarAgrupadoPorStatus(): Promise<Record<OrderStatus, Order[]>> {
    const pedidos = await this.listarTodos();
    const agrupado: Record<OrderStatus, Order[]> = {
      [OrderStatus.PENDENTE]: [],
      [OrderStatus.EM_PREPARO]: [],
      [OrderStatus.PRONTO]: [],
      [OrderStatus.ATRIBUIDO]: [],
      [OrderStatus.SAIU_PARA_ENTREGA]: [],
      [OrderStatus.ENTREGUE]: [],
      [OrderStatus.CANCELADO]: [],
    };
    for (const pedido of pedidos) {
      agrupado[pedido.status].push(pedido);
    }
    return agrupado;
  }

  async findById(id: number): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { id },
      relations: { itens: true, entregador: true },
    });
  }

  listarPorEntregador(
    entregadorId: number,
    statuses: OrderStatus[],
  ): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { entregadorId, status: In(statuses) },
      order: { createdAt: 'ASC' },
    });
  }

  async criar(dados: DadosNovoPedido): Promise<Order> {
    if (!dados.itens.length) {
      throw new BadRequestException('Pedido precisa de ao menos um item.');
    }

    const itens = dados.itens.map((i) => {
      const item = new OrderItem();
      item.nome = i.nome;
      item.quantidade = i.quantidade;
      item.precoUnitario = i.precoUnitario;
      return item;
    });

    const valorTotal = itens.reduce(
      (soma, i) => soma + i.quantidade * i.precoUnitario,
      0,
    );

    const pedido = this.ordersRepository.create({
      clienteNome: dados.clienteNome,
      clienteTelefone: dados.clienteTelefone,
      enderecoEntrega: dados.enderecoEntrega,
      latitude: dados.latitude ?? null,
      longitude: dados.longitude ?? null,
      observacoes: dados.observacoes ?? null,
      valorTotal,
      status: OrderStatus.PENDENTE,
      itens,
    });

    return this.ordersRepository.save(pedido);
  }

  async transicionar(id: number, novoStatus: OrderStatus): Promise<Order> {
    const pedido = await this.findById(id);
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado.');
    }
    const permitidos = TRANSICOES_VALIDAS[pedido.status];
    if (!permitidos.includes(novoStatus)) {
      throw new BadRequestException(
        `Transição inválida: ${pedido.status} → ${novoStatus}.`,
      );
    }
    pedido.status = novoStatus;
    return this.ordersRepository.save(pedido);
  }

  async atribuirEntregador(id: number, entregadorId: number): Promise<Order> {
    const pedido = await this.findById(id);
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado.');
    }
    if (pedido.status !== OrderStatus.PRONTO) {
      throw new BadRequestException(
        'Só é possível atribuir entregador a um pedido pronto.',
      );
    }
    pedido.entregadorId = entregadorId;
    pedido.status = OrderStatus.ATRIBUIDO;
    return this.ordersRepository.save(pedido);
  }
}
