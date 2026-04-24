import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../empresas/empresa.entity';
import { User } from '../users/user.entity';

export enum TipoDocumento {
  CONTRATO = 'contrato',
  NOTA_FISCAL = 'nota_fiscal',
  COMPROVANTE = 'comprovante',
  OUTROS = 'outros',
}

@Entity('tb_documentos')
export class Documento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nome: string;

  @Column({ 
    type: 'enum',
    enum: TipoDocumento,
  })
  tipo: TipoDocumento;

  @Column({ length: 500 })
  arquivo: string; // nome original do arquivo

  @Column({ length: 255, nullable: true })
  mimeType: string;

  @Column({ type: 'bigint' })
  tamanho: number; // em bytes

  @Column({ type: process.env.DATABASE_URL ? 'bytea' : 'longblob', nullable: true })
  conteudo: Buffer;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn()
  createdAt: Date;
}
