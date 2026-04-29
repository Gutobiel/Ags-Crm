import { api } from '../api';
import { OrdemCompra, StatusOrdemCompra } from '../../types/ordemCompra';

interface CreateOrdemCompraDto {
  fornecedorId: number;
  status?: StatusOrdemCompra;
  data?: string;
  itens?: Array<{
    produtoId: number;
    quantidade: number;
    precoUnitario?: number;
  }>;
  valorTotal?: number;
  quantidadeTotal?: number;
}

export const ordensCompraService = {
  getAll: (token?: string) => api.get<OrdemCompra[]>('/ordens-compra', token),
  getById: (id: number, token?: string) => api.get<OrdemCompra>(`/ordens-compra/${id}`, token),
  create: (data: CreateOrdemCompraDto, token?: string) => api.post<OrdemCompra>('/ordens-compra', data, token),
  updateStatus: (id: number, status: StatusOrdemCompra, token?: string) => 
    api.put<OrdemCompra>(`/ordens-compra/${id}/status`, { status }, token),
  delete: (id: number, token?: string) => api.delete<void>(`/ordens-compra/${id}`, token),
};
