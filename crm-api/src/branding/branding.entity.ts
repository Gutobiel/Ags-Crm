import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('tb_branding')
export class Branding {
  @PrimaryGeneratedColumn()
  id: number;

  // Textos
  @Column({ length: 255, default: 'AGS CRM' })
  appName: string;

  @Column({ length: 500, default: 'Sistema de Gerenciamento' })
  appDescription: string;

  @Column({ length: 500, default: 'Bem-vindo' })
  welcomeMessage: string;

  // Logo (path relativo ao /uploads/branding/)
  @Column({ length: 500, nullable: true })
  logoPath: string;

  @Column({ length: 500, nullable: true })
  faviconPath: string;

  // Cores do tema (hex)
  @Column({ length: 7, default: '#059669' })
  primaryColor: string;

  @Column({ length: 7, default: '#047857' })
  primaryDark: string;

  @Column({ length: 7, default: '#10b981' })
  primaryLight: string;

  @Column({ length: 7, default: '#d1fae5' })
  primaryBg: string;

  // Cores da sidebar
  @Column({ length: 7, default: '#1e293b' })
  sidebarFrom: string;

  @Column({ length: 7, default: '#0f172a' })
  sidebarTo: string;

  // Imagens de login (JSON array de paths)
  @Column({ type: 'text', nullable: true })
  loginImages: string;

  // Desfocar imagem de fundo do login
  @Column({ default: true })
  loginImageBlur: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
