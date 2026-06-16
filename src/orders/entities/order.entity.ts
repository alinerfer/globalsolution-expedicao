import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cliente_nome', length: 120 })
  clienteNome: string;

  @Column({ name: 'cliente_telefone', length: 30 })
  clienteTelefone: string;

  @Column({ name: 'endereco_entrega', length: 240 })
  enderecoEntrega: string;

  @Column({ type: 'real', nullable: true })
  latitude: number | null;

  @Column({ type: 'real', nullable: true })
  longitude: number | null;

  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  @Column({ name: 'valor_total', type: 'real', default: 0 })
  valorTotal: number;

  @Column({ type: 'varchar', length: 30, default: OrderStatus.PENDENTE })
  status: OrderStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'entregador_id' })
  entregador: User | null;

  @Column({ name: 'entregador_id', nullable: true })
  entregadorId: number | null;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: false,
  })
  itens: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
