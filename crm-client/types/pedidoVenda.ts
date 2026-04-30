import { Produto } from './produto';

export enum StatusPedidoVenda {
  RASCUNHO = 'RASCUNHO',
  AGUARDANDO_PAGAMENTO = 'AGUARDANDO_PAGAMENTO',
  APROVADO = 'APROVADO',
  FATURADO = 'FATURADO',
  ENVIADO = 'ENVIADO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

export interface ItemPedido {
  id: number;
  pedidoId: number;
  produtoId: number;
  produto?: Produto;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface PedidoVenda {
  id: number;
  data: string;
  status: StatusPedidoVenda;
  clienteId?: number;
  valorTotal: number;
  quantidadeTotal: number;
  observacoes?: string;
  itens?: ItemPedido[];
  createdAt: string;
  updatedAt: string;
}
