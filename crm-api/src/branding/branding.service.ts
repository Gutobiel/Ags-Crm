import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branding } from './branding.entity';

@Injectable()
export class BrandingService {
  constructor(
    @InjectRepository(Branding)
    private brandingRepository: Repository<Branding>,
  ) {}

  // Retorna as configurações de branding (cria um registro padrão se não existir)
  async get(): Promise<Branding> {
    let branding = await this.brandingRepository.findOne({ where: { id: 1 } });
    
    if (!branding) {
      branding = this.brandingRepository.create({
        appName: 'AGS CRM',
        appDescription: 'Sistema de Gerenciamento',
        welcomeMessage: 'Bem-vindo',
        primaryColor: '#059669',
        primaryDark: '#047857',
        primaryLight: '#10b981',
        primaryBg: '#d1fae5',
        sidebarFrom: '#1e293b',
        sidebarTo: '#0f172a',
      });
      branding = await this.brandingRepository.save(branding);
    }
    
    return branding;
  }

  // Atualiza as configurações de branding
  async update(data: Partial<Branding>): Promise<Branding> {
    let branding = await this.get();
    
    // Atualizar apenas os campos enviados
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'id' && key !== 'updatedAt') {
        branding[key] = data[key];
      }
    });
    
    return this.brandingRepository.save(branding);
  }

  // Atualizar logo
  async updateLogo(filename: string): Promise<Branding> {
    return this.update({ logoPath: filename });
  }

  // Atualizar favicon
  async updateFavicon(filename: string): Promise<Branding> {
    return this.update({ faviconPath: filename });
  }
}
