import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ItemOrdem } from './item-ordem.entity';
import { Fornecedor } from '../fornecedores/fornecedor.entity';

export enum StatusOrdemCompra {
  COTACAO = 'COTACAO',
  PENDENTE = 'PENDENTE',
  PEDIDO_FEITO = 'PEDIDO_FEITO',
  RECEBIDA = 'RECEBIDA',
  CANCELADA = 'CANCELADA',
}

@Entity('tb_ordens_compra')
export class OrdemCompra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  data: Date;

  @Column({ type: 'enum', enum: StatusOrdemCompra, default: StatusOrdemCompra.COTACAO })
  status: StatusOrdemCompra;

  @Column()
  fornecedorId: number;

  @ManyToOne(() => Fornecedor)
  @JoinColumn({ name: 'fornecedorId' })
  fornecedor: Fornecedor;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  valorTotal: number;

  @Column({ type: 'int', default: 0 })
  quantidadeTotal: number;

  @Column('text', { nullable: true })
  observacoes: string;

  @OneToMany(() => ItemOrdem, item => item.ordemCompra, { cascade: true })
  itens: ItemOrdem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
