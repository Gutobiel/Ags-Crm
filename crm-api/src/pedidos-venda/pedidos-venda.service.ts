import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoVenda, StatusPedidoVenda } from './pedido-venda.entity';
import { ItemPedido } from './item-pedido.entity';
import { Produto } from '../produtos/produto.entity';

@Injectable()
export class PedidosVendaService {
  constructor(
    @InjectRepository(PedidoVenda)
    private pedidosRepository: Repository<PedidoVenda>,
    @InjectRepository(ItemPedido)
    private itensRepository: Repository<ItemPedido>,
    @InjectRepository(Produto)
    private produtosRepository: Repository<Produto>,
  ) {}

  async create(data: any): Promise<PedidoVenda> {
    const pedido = this.pedidosRepository.create({
      clienteId: data.clienteId,
      status: data.status || StatusPedidoVenda.RASCUNHO,
      observacoes: data.observacoes,
      data: data.data || new Date(),
    });

    let total = 0;
    let qtdTotal = 0;
    const itensToSave: ItemPedido[] = [];

    if (data.itens && data.itens.length > 0) {
      for (const item of data.itens) {
        const produto = await this.produtosRepository.findOne({ where: { id: item.produtoId } });
        if (!produto) throw new NotFoundException(`Produto ${item.produtoId} não encontrado`);

        const precoUnitario = item.precoUnitario || produto.preco;
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

    pedido.valorTotal = (data.itens && data.itens.length > 0) ? total : (data.valorTotal || 0);
    pedido.quantidadeTotal = (data.itens && data.itens.length > 0) ? qtdTotal : (data.quantidadeTotal || 0);
    pedido.itens = itensToSave;

    return this.pedidosRepository.save(pedido);
  }

  async findAll(): Promise<PedidoVenda[]> {
    return this.pedidosRepository.find({ relations: ['itens', 'itens.produto'], order: { id: 'DESC' } });
  }

  async findOne(id: number): Promise<PedidoVenda | null> {
    return this.pedidosRepository.findOne({ where: { id }, relations: ['itens', 'itens.produto'] });
  }

  async updateStatus(id: number, status: StatusPedidoVenda): Promise<PedidoVenda> {
    const pedido = await this.pedidosRepository.findOne({ where: { id }, relations: ['itens'] });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');

    const statusBaixa = [StatusPedidoVenda.ENVIADO, StatusPedidoVenda.ENTREGUE];
    if (statusBaixa.includes(status) && !statusBaixa.includes(pedido.status)) {
      for (const item of pedido.itens) {
        await this.produtosRepository.decrement({ id: item.produtoId }, 'estoqueAtual', Number(item.quantidade));
      }
    }

    pedido.status = status;
    return this.pedidosRepository.save(pedido);
  }

  async remove(id: number): Promise<void> {
    await this.pedidosRepository.delete(id);
  }
}
