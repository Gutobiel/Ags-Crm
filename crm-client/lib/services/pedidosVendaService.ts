import { api } from '../api';
import { PedidoVenda, StatusPedidoVenda } from '../../types/pedidoVenda';

interface CreatePedidoVendaDto {
  clienteId?: number;
  status?: StatusPedidoVenda;
  observacoes?: string;
  data?: string;
  itens?: Array<{
    produtoId: number;
    quantidade: number;
    precoUnitario?: number;
  }>;
  valorTotal?: number;
  quantidadeTotal?: number;
}

export const pedidosVendaService = {
  getAll: (token?: string) => api.get<PedidoVenda[]>('/pedidos-venda', token),
  getById: (id: number, token?: string) => api.get<PedidoVenda>(`/pedidos-venda/${id}`, token),
  create: (data: CreatePedidoVendaDto, token?: string) => api.post<PedidoVenda>('/pedidos-venda', data, token),
  updateStatus: (id: number, status: StatusPedidoVenda, token?: string) => 
    api.put<PedidoVenda>(`/pedidos-venda/${id}/status`, { status }, token),
  delete: (id: number, token?: string) => api.delete<void>(`/pedidos-venda/${id}`, token),
};
