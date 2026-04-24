import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './empresa.entity';
import { Lead } from '../leads/lead.entity';
import { Orcamento } from '../orcamentos/orcamento.entity';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private empresasRepository: Repository<Empresa>,
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @InjectRepository(Orcamento)
    private orcamentosRepository: Repository<Orcamento>,
  ) {}

  async create(empresaData: Partial<Empresa>): Promise<Empresa> {
    const empresa = this.empresasRepository.create(empresaData);
    return this.empresasRepository.save(empresa);
  }

  async findAll(): Promise<Empresa[]> {
    return this.empresasRepository.find({ order: { nome: 'ASC' } });
  }

  async findOne(id: number): Promise<Empresa | null> {
    return this.empresasRepository.findOne({ where: { id } });
  }

  async findByCnpj(cnpj: string): Promise<Empresa | null> {
    return this.empresasRepository.findOne({ where: { cnpj } });
  }

  async update(id: number, empresaData: Partial<Empresa>): Promise<Empresa | null> {
    await this.empresasRepository.update(id, empresaData);
    return this.findOne(id);
  }

  async toggleStatus(id: number): Promise<Empresa> {
    const empresa = await this.findOne(id);
    if (!empresa) {
      throw new Error('Empresa não encontrada');
    }
    empresa.ativo = !empresa.ativo;
    return this.empresasRepository.save(empresa);
  }

  async checkEmpresaRelations(id: number): Promise<{ hasRelations: boolean; relations: string[] }> {
    const relations: string[] = [];
    
    const leadsCount = await this.leadsRepository.count({ 
      where: { empresa: { id } } 
    });
    if (leadsCount > 0) {
      relations.push(`${leadsCount} lead(s)`);
    }
    
    const orcamentosCount = await this.orcamentosRepository.count({ 
      where: { empresa: { id } } 
    });
    if (orcamentosCount > 0) {
      relations.push(`${orcamentosCount} orçamento(s)`);
    }
    
    return {
      hasRelations: relations.length > 0,
      relations
    };
  }

  async remove(id: number): Promise<void> {
    try {
      await this.empresasRepository.delete(id);
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException('Não é possível excluir esta empresa pois existem dados relacionados a ela. Considere inativá-la ao invés de excluir.');
      }
      throw error;
    }
  }
}
