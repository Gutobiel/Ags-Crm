import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from '../empresas/empresa.entity';
import { Lead } from '../leads/lead.entity';
import { User } from '../users/user.entity';

export enum StatusOrcamento {
  RASCUNHO = 'RASCUNHO',
  ENVIADO = 'ENVIADO',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
  EXPIRADO = 'EXPIRADO',
}

export enum StatusPagamento {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  PARCIAL = 'PARCIAL',
  ATRASADO = 'ATRASADO',
}

export interface OrcamentoItem {
  produtoId: number;
  codigo: string;
  nome: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  subtotal: number;
}

@Entity('tb_orcamentos')
export class Orcamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  numero: string;

  @ManyToOne(() => Empresa, { eager: true })
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  @ManyToOne(() => Lead, { eager: true, nullable: true })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'responsavelId' })
  responsavel: User;

  @Column({
    type: 'enum',
    enum: StatusOrcamento,
    default: StatusOrcamento.RASCUNHO,
  })
  status: StatusOrcamento;

  @Column({
    type: 'enum',
    enum: StatusPagamento,
    default: StatusPagamento.PENDENTE,
  })
  statusPagamento: StatusPagamento;

  @Column('date')
  dataEmissao: string;

  @Column('date')
  dataValidade: string;

  @Column('json')
  itens: OrcamentoItem[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  desconto: number;

  @Column('decimal', { precision: 10, scale: 2 })
  valorTotal: number;

  @Column('text', { nullable: true })
  observacoes: string;

  @Column('text', { nullable: true })
  condicoesPagamento: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
