import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ItemPedido } from './item-pedido.entity';

export enum StatusPedidoVenda {
  RASCUNHO = 'RASCUNHO',
  AGUARDANDO_PAGAMENTO = 'AGUARDANDO_PAGAMENTO',
  APROVADO = 'APROVADO',
  FATURADO = 'FATURADO',
  ENVIADO = 'ENVIADO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

@Entity('tb_pedidos_venda')
export class PedidoVenda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  data: Date;

  @Column({ type: 'enum', enum: StatusPedidoVenda, default: StatusPedidoVenda.RASCUNHO })
  status: StatusPedidoVenda;

  @Column({ nullable: true })
  clienteId: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  valorTotal: number;

  @Column({ type: 'int', default: 0 })
  quantidadeTotal: number;

  @Column('text', { nullable: true })
  observacoes: string;

  @OneToMany(() => ItemPedido, item => item.pedido, { cascade: true })
  itens: ItemPedido[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
