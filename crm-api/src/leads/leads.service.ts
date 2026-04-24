import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStage, LeadStatus, OrigemLead, TagNegociacao, TagContrato } from './lead.entity';
import { EmpresasService } from '../empresas/empresas.service';
import { UserRole } from '../users/user.entity';
import { Empresa } from '../empresas/empresa.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    private empresasService: EmpresasService,
  ) {}

  async create(leadData: {
    nomeResponsavel: string;
    empresa?: string;
    cnpjCpf?: string;
    localidade?: string;
    email?: string;
    telefone?: string;
    valorEstimado?: number;
    observacoes?: string;
    responsavel_id?: number;
    servicos?: string[];
    origem?: OrigemLead;
    statusNegociacao?: LeadStatus;
    tagNegociacao?: TagNegociacao;
    tagContrato?: TagContrato;
    proximaData?: string | Date;
    andamento?: string;
    etapa?: LeadStage;
    consultaSerasa?: string;
    preOrcamento?: string;
    cpfObrigatorio?: boolean;
    tipoPessoa?: string;
    cep?: string;
    latitude?: number;
    longitude?: number;
  }, user?: { id: number; funcao?: UserRole }): Promise<Lead> {
    let empresa: Empresa | null = null;

    if (leadData.cnpjCpf) {
      empresa = await this.empresasService.findByCnpj(leadData.cnpjCpf);
    }
    
    if (!empresa && leadData.empresa && leadData.cnpjCpf) {
      empresa = await this.empresasService.create({
        nome: leadData.empresa,
        cnpj: leadData.cnpjCpf || '',
        responsavel: leadData.nomeResponsavel,
        email: leadData.email || '',
        telefone: leadData.telefone || '',
        cidade: leadData.localidade || '',
      });
    }

    const lead = this.leadsRepository.create({
      ...leadData,
      empresa: empresa || undefined,
      responsavel_id: leadData.responsavel_id || user?.id,
    });
    return this.leadsRepository.save(lead);
  }

  async findAll(user?: { id: number; funcao?: UserRole }): Promise<Lead[]> {
    const where: any = {};
    if (user?.funcao === UserRole.VENDEDOR) {
      where.responsavel_id = user.id;
    }

    return this.leadsRepository.find({
      where,
      relations: ['responsavel'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStage(etapa: LeadStage, user?: { id: number; funcao?: UserRole }): Promise<Lead[]> {
    const where: any = { etapa };
    if (user?.funcao === UserRole.VENDEDOR) {
      where.responsavel_id = user.id;
    }

    return this.leadsRepository.find({
      where,
      relations: ['responsavel'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, user?: { id: number; funcao?: UserRole }): Promise<Lead | null> {
    const lead = await this.leadsRepository.findOne({
      where: { id },
      relations: ['responsavel'],
    });

    if (user?.funcao === UserRole.VENDEDOR && lead && lead.responsavel_id !== user.id) {
      throw new ForbiddenException('Acesso negado a este lead');
    }

    return lead;
  }

  async update(id: number, leadData: Partial<Lead>, user?: { id: number; funcao?: UserRole }): Promise<Lead | null> {
    // Se empresa_id foi enviado como string (nome da empresa ou ID), converter para objeto com ID
    const updateData = { ...leadData };

    if (user?.funcao === UserRole.VENDEDOR) {
      const existing = await this.leadsRepository.findOne({ where: { id } });
      if (!existing || existing.responsavel_id !== user.id) {
        throw new ForbiddenException('Acesso negado a este lead');
      }
      // Forçar o responsável a continuar o mesmo vendedor
      updateData.responsavel_id = existing.responsavel_id;
    }
    
    if (updateData.empresa) {
      if (typeof updateData.empresa === 'string') {
        // Se é uma string, tentar converter para ID
        const empresaId = parseInt(updateData.empresa, 10);
        if (!isNaN(empresaId)) {
          updateData.empresa = { id: empresaId } as any;
        } else {
          // Se não for um número válido, remover o campo
          delete updateData.empresa;
        }
      } else if (typeof updateData.empresa === 'object' && updateData.empresa.id) {
        // Se já é um objeto com ID, manter como está
        updateData.empresa = { id: updateData.empresa.id } as any;
      } else if (typeof updateData.empresa === 'object') {
        // Se é um objeto sem ID, remover o campo
        delete updateData.empresa;
      }
    }
    
    await this.leadsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async updateStage(id: number, etapa: LeadStage, user?: { id: number; funcao?: UserRole }): Promise<Lead | null> {
    if (user?.funcao === UserRole.VENDEDOR) {
      const existing = await this.leadsRepository.findOne({ where: { id } });
      if (!existing || existing.responsavel_id !== user.id) {
        throw new ForbiddenException('Acesso negado a este lead');
      }
    }

    await this.leadsRepository.update(id, { etapa });
    return this.findOne(id);
  }

  async remove(id: number, user?: { id: number; funcao?: UserRole }): Promise<void> {
    if (user?.funcao === UserRole.VENDEDOR) {
      const existing = await this.leadsRepository.findOne({ where: { id } });
      if (!existing || existing.responsavel_id !== user.id) {
        throw new ForbiddenException('Acesso negado a este lead');
      }
    }
    await this.leadsRepository.delete(id);
  }
}
