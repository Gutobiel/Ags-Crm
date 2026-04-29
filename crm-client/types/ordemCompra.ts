import { Fornecedor } from './fornecedor';
import { Produto } from './produto';

export enum StatusOrdemCompra {
  COTACAO = 'COTACAO',
  PENDENTE = 'PENDENTE',
  PEDIDO_FEITO = 'PEDIDO_FEITO',
  RECEBIDA = 'RECEBIDA',
  CANCELADA = 'CANCELADA',
}

export interface ItemOrdem {
  id: number;
  ordemCompraId: number;
  produtoId: number;
  produto?: Produto;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface OrdemCompra {
  id: number;
  data: string;
  status: StatusOrdemCompra;
  fornecedorId: number;
  fornecedor?: Fornecedor;
  valorTotal: number;
  quantidadeTotal: number;
  observacoes?: string;
  itens?: ItemOrdem[];
  createdAt: string;
  updatedAt: string;
}
