import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdemCompra, StatusOrdemCompra } from './ordem-compra.entity';
import { ItemOrdem } from './item-ordem.entity';
import { Produto } from '../produtos/produto.entity';

@Injectable()
export class OrdensCompraService {
  constructor(
    @InjectRepository(OrdemCompra)
    private ordensRepository: Repository<OrdemCompra>,
    @InjectRepository(ItemOrdem)
    private itensRepository: Repository<ItemOrdem>,
    @InjectRepository(Produto)
    private produtosRepository: Repository<Produto>,
  ) {}

  async create(data: any): Promise<OrdemCompra> {
    const ordem = this.ordensRepository.create({
      fornecedorId: data.fornecedorId,
      status: data.status || StatusOrdemCompra.COTACAO,
      data: data.data || new Date(),
    });

    let total = 0;
    let qtdTotal = 0;
    const itensToSave: ItemOrdem[] = [];

    if (data.itens && data.itens.length > 0) {
      for (const item of data.itens) {
        const produto = await this.produtosRepository.findOne({ where: { id: item.produtoId } });
        if (!produto) throw new NotFoundException(`Produto ${item.produtoId} não encontrado`);

        const precoUnitario = item.precoUnitario || produto.custo;
        const subtotal = Number(precoUnitario) * Number(item.quantidade);
        total += subtotal;
        qtdTotal += Number(item.quantidade);

        const novoItem = this.itensRepository.create({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario,
          subtotal,
        });
        itensToSave.push(novoItem);
      }
    }

    ordem.valorTotal = (data.itens && data.itens.length > 0) ? total : (data.valorTotal || 0);
    ordem.quantidadeTotal = (data.itens && data.itens.length > 0) ? qtdTotal : (data.quantidadeTotal || 0);
    ordem.itens = itensToSave;

    return this.ordensRepository.save(ordem);
  }

  async findAll(): Promise<OrdemCompra[]> {
    return this.ordensRepository.find({ relations: ['itens', 'itens.produto', 'fornecedor'], order: { id: 'DESC' } });
  }

  async findOne(id: number): Promise<OrdemCompra | null> {
    return this.ordensRepository.findOne({ where: { id }, relations: ['itens', 'itens.produto', 'fornecedor'] });
  }

  async updateStatus(id: number, status: StatusOrdemCompra): Promise<OrdemCompra> {
    const ordem = await this.ordensRepository.findOne({ where: { id }, relations: ['itens'] });
    if (!ordem) throw new NotFoundException('Ordem de Compra não encontrada');

    // Se mudou para RECEBIDA e não era RECEBIDA antes (dar entrada no estoque)
    if (status === StatusOrdemCompra.RECEBIDA && ordem.status !== StatusOrdemCompra.RECEBIDA) {
      for (const item of ordem.itens) {
        await this.produtosRepository.increment({ id: item.produtoId }, 'estoqueAtual', Number(item.quantidade));
      }
    }

    ordem.status = status;
    return this.ordensRepository.save(ordem);
  }

  async remove(id: number): Promise<void> {
    await this.ordensRepository.delete(id);
  }
}
