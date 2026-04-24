import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Empresa } from '../empresas/empresa.entity';

export enum LeadStage {
  CONTATO_INICIAL = 'contato_inicial',
  NEGOCIACAO_INICIAL = 'negociacao_inicial',
  ORCAMENTO_APROVACAO = 'orcamento_aprovacao',
  NEGOCIACAO_FECHAMENTO = 'negociacao_fechamento',
  CONTRATO = 'contrato',
}

export enum LeadStatus {
  NOVO = 'novo',
  NEGOCIANDO = 'negociando',
  GANHO = 'ganho',
  PERDIDO = 'perdido',
  ARQUIVADO = 'arquivado',
}

export enum TipoServico {
  PERFURACAO = 'perfuracao',
  LIMPEZA = 'limpeza',
  MONTAGEM_BOMBA = 'montagem_bomba',
  PESCARIA = 'pescaria',
  LICENCAS_OUTORGA = 'licencas_outorga',
  MANUTENCAO_POCOS = 'manutencao_pocos',
  MANUTENCAO_BOMBAS = 'manutencao_bombas',
  TESTE_VAZAO = 'teste_vazao',
  LOCACAO_GEOLOGICA = 'locacao_geologica',
  OUTROS = 'outros',
}

export enum OrigemLead {
  MARKETING_INSTAGRAM = 'marketing_instagram',
  MARKETING_FACEBOOK = 'marketing_facebook',
  SITE = 'site',
  INDICACAO = 'indicacao',
  PRESENCIAL = 'presencial',
  GOOGLE = 'google',
  OUTROS = 'outros',
}

export enum TagNegociacao {
  AGUARDANDO_CLIENTE = 'aguardando_cliente',
  AGUARDANDO_PAGAMENTO = 'aguardando_pagamento',
  EM_ANALISE = 'em_analise',
  PRONTO_ENVIO = 'pronto_envio',
  ORCAMENTO_CRIADO = 'orcamento_criado',
}

export enum TagContrato {
  ENVIADO_CLIENTE = 'enviado_cliente',
  AGUARDANDO_ASSINATURA = 'aguardando_assinatura',
  AGUARDANDO_MATERIAL = 'aguardando_material',
  AGUARDANDO_EXECUCAO = 'aguardando_execucao',
  AGUARDANDO_AGENDA = 'aguardando_agenda',
}

@Entity('tb_leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nomeResponsavel: string;

  @ManyToOne(() => Empresa, { nullable: true, eager: true })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ length: 20, nullable: true })
  cnpjCpf: string;

  @Column({ length: 2, nullable: true })
  tipoPessoa: string;

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

  @Column({ length: 255, nullable: true })
  localidade: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  servicos: string[];

  @Column({
    type: 'enum',
    enum: OrigemLead,
    nullable: true,
  })
  origem: OrigemLead;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NOVO,
  })
  statusNegociacao: LeadStatus;

  @Column({
    type: 'enum',
    enum: TagNegociacao,
    nullable: true,
  })
  tagNegociacao: TagNegociacao;

  @Column({
    type: 'enum',
    enum: TagContrato,
    nullable: true,
  })
  tagContrato: TagContrato;

  @Column({ type: 'date', nullable: true })
  proximaData: Date;

  @Column({ type: 'text', nullable: true })
  andamento: string;

  @Column({ 
    type: 'enum',
    enum: LeadStage,
    default: LeadStage.CONTATO_INICIAL
  })
  etapa: LeadStage;

  @Column({ type: 'text', nullable: true })
  consultaSerasa: string;

  @Column({ type: 'text', nullable: true })
  preOrcamento: string;

  @Column({ type: 'boolean', default: false })
  cpfObrigatorio: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorEstimado: number;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: User;

  @Column({ nullable: true })
  responsavel_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
