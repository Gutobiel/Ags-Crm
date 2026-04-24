import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  FUNCIONARIO = 'func',
  FINANCEIRO = 'finan',
  GESTOR = 'gest',
  VENDEDOR = 'vend',
}

@Entity('tb_usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nome: string;

  @Column({ length: 14, unique: true })
  cpf: string;

  @Column({ 
    type: 'enum',
    enum: UserRole,
    default: UserRole.FUNCIONARIO
  })
  funcao: UserRole;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
