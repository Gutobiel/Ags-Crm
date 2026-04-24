import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoProduto {
  PRODUTO = 'PRODUTO',
  SERVICO = 'SERVICO',
}

@Entity('tb_produtos_servicos')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, nullable: true })
  codigo: string;

  @Column({ length: 255 })
  nome: string;

  @Column('text', { nullable: true })
  descricao: string;

  @Column({
    type: 'enum',
    enum: TipoProduto,
    default: TipoProduto.PRODUTO,
  })
  tipo: TipoProduto;

  @Column({ length: 30, nullable: true })
  categoria: string;

  @Column({ length: 20, default: 'un' })
  unidade: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  preco: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  custo: number;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
