import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Lead } from '../leads/lead.entity';

@Entity('tb_empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nome: string;

  @Column({ length: 18, unique: true })
  cnpj: string;

  @Column({ length: 255, nullable: true })
  responsavel: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ length: 10, nullable: true })
  cep: string;

  @Column({ length: 255, nullable: true })
  endereco: string;

  @Column({ length: 20, nullable: true })
  numero: string;

  @Column({ length: 100, nullable: true })
  complemento: string;

  @Column({ length: 100, nullable: true })
  bairro: string;

  @Column({ length: 100, nullable: true })
  cidade: string;

  @Column({ length: 2, nullable: true })
  estado: string;

  @Column('text', { nullable: true })
  observacoes: string;
  @Column({ default: true })
  ativo: boolean;
  @OneToMany(() => Lead, (lead) => lead.empresa, { nullable: true })
  leads: Lead[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
