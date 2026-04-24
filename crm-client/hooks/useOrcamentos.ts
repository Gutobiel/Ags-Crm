import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export enum StatusOrcamento {
  RASCUNHO = 'RASCUNHO',
  ENVIADO = 'ENVIADO',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
  EXPIRADO = 'EXPIRADO',
}

export enum StatusPagamento {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  PARCIAL = 'PARCIAL',
  ATRASADO = 'ATRASADO',
}

export interface OrcamentoItem {
  produtoId: number;
  codigo: string;
  nome: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  subtotal: number;
}

export interface Orcamento {
  id: number;
  numero: string;
  empresa: { id: number; nome: string };
  lead?: { id: number; nome: string };
  responsavel: { id: number; nome: string };
  status: StatusOrcamento;
  statusPagamento: StatusPagamento;
  dataEmissao: string;
  dataValidade: string;
  itens: OrcamentoItem[];
  desconto: number;
  valorTotal: number;
  observacoes?: string;
  condicoesPagamento?: string;
  createdAt: string;
  updatedAt: string;
}

export function useOrcamentos() {
  const { data: session } = useSession();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrcamentos(status?: StatusOrcamento, statusPagamento?: StatusPagamento) {
    if (!session?.accessToken) return;

    let endpoint = '/orcamentos';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (statusPagamento) params.append('statusPagamento', statusPagamento);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const response = await api.get<Orcamento[]>(endpoint, session.accessToken);
    
    if (response.data) {
      setOrcamentos(response.data);
    } else if (response.error) {
      console.error('Erro ao buscar orçamentos:', response.error);
    }
    
    setLoading(false);
  }

  async function createOrcamento(data: any) {
    if (!session?.accessToken) return;

    const response = await api.post<Orcamento>('/orcamentos', data, session.accessToken);
    
    if (response.data) {
      await fetchOrcamentos();
      return true;
    } else if (response.error) {
      console.error('Erro ao criar orçamento:', response.error);
    }
    
    return false;
  }

  async function updateOrcamento(id: number, data: any) {
    if (!session?.accessToken) return;

    const response = await api.put<Orcamento>(`/orcamentos/${id}`, data, session.accessToken);
    
    if (response.data) {
      await fetchOrcamentos();
      return true;
    } else if (response.error) {
      console.error('Erro ao atualizar orçamento:', response.error);
    }
    
    return false;
  }

  async function updateStatus(id: number, status: StatusOrcamento) {
    if (!session?.accessToken) return;

    const response = await api.put(`/orcamentos/${id}/status`, { status }, session.accessToken);
    
    if (response.data) {
      await fetchOrcamentos();
      return true;
    } else if (response.error) {
      console.error('Erro ao atualizar status:', response.error);
    }
    
    return false;
  }

  async function updateStatusPagamento(id: number, statusPagamento: StatusPagamento) {
    if (!session?.accessToken) return;

    const response = await api.put(`/orcamentos/${id}/status-pagamento`, { statusPagamento }, session.accessToken);
    
    if (response.data) {
      await fetchOrcamentos();
      return true;
    } else if (response.error) {
      console.error('Erro ao atualizar status de pagamento:', response.error);
    }
    
    return false;
  }

  async function deleteOrcamento(id: number) {
    if (!session?.accessToken) return;

    const response = await api.delete(`/orcamentos/${id}`, session.accessToken);
    
    if (response.data !== undefined) {
      await fetchOrcamentos();
      return true;
    } else if (response.error) {
      console.error('Erro ao deletar orçamento:', response.error);
    }
    
    return false;
  }

  useEffect(() => {
    if (session) {
      fetchOrcamentos();
    }
  }, [session]);

  return {
    orcamentos,
    loading,
    fetchOrcamentos,
    createOrcamento,
    updateOrcamento,
    updateStatus,
    updateStatusPagamento,
    deleteOrcamento,
  };
}
