import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orcamento, StatusOrcamento, StatusPagamento } from './orcamento.entity';

@Injectable()
export class OrcamentosService {
  constructor(
    @InjectRepository(Orcamento)
    private orcamentosRepository: Repository<Orcamento>,
  ) {}

  async generateNumero(): Promise<string> {
    const year = new Date().getFullYear();
    const last = await this.orcamentosRepository
      .createQueryBuilder('orcamento')
      .where('orcamento.numero LIKE :prefix', { prefix: `ORC-${year}-%` })
      .orderBy('orcamento.numero', 'DESC')
      .limit(1)
      .getOne();

    const lastSeq = last ? parseInt((last.numero || '').split('-')[2] || '0', 10) || 0 : 0;
    let nextSeq = lastSeq + 1;
    let candidate = `ORC-${year}-${String(nextSeq).padStart(4, '0')}`;

    // Extra safety in case concurrent insert created the same number between queries
    while (await this.orcamentosRepository.count({ where: { numero: candidate } }) > 0) {
      nextSeq += 1;
      candidate = `ORC-${year}-${String(nextSeq).padStart(4, '0')}`;
    }

    return candidate;
  }

  async create(
    orcamentoData: Partial<Orcamento>,
    userId: number,
  ): Promise<Orcamento> {
    let attempts = 0;
    while (attempts < 5) {
      const numero = await this.generateNumero();
      const orcamento = this.orcamentosRepository.create({
        ...orcamentoData,
        numero,
        responsavel: { id: userId } as any,
      });
      try {
        return await this.orcamentosRepository.save(orcamento);
      } catch (error: any) {
        // Se houver colisão de número, tentar novamente com próximo sequencial
        const duplicate = error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062;
        if (!duplicate) {
          throw error;
        }
        attempts += 1;
      }
    }
    // Se após múltiplas tentativas ainda falhar, lançar erro
    throw new Error('Falha ao gerar número único para orçamento');
  }

  async findAll(
    status?: StatusOrcamento,
    statusPagamento?: StatusPagamento,
  ): Promise<Orcamento[]> {
    const where: any = {};
    if (status) where.status = status;
    if (statusPagamento) where.statusPagamento = statusPagamento;

    return this.orcamentosRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Orcamento | null> {
    return this.orcamentosRepository.findOne({ where: { id } });
  }

  async update(id: number, orcamentoData: Partial<Orcamento>): Promise<Orcamento | null> {
    await this.orcamentosRepository.update(id, orcamentoData);
    return this.findOne(id);
  }

  async updateStatus(id: number, status: StatusOrcamento): Promise<Orcamento | null> {
    await this.orcamentosRepository.update(id, { status });
    return this.findOne(id);
  }

  async updateStatusPagamento(
    id: number,
    statusPagamento: StatusPagamento,
  ): Promise<Orcamento | null> {
    await this.orcamentosRepository.update(id, { statusPagamento });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.orcamentosRepository.delete(id);
  }
}
