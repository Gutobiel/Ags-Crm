import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export interface Lead {
  id: number;
  nomeResponsavel: string;
  empresa: { id: number; nome: string; cnpj: string } | string;
  tipoPessoa?: string;
  cnpjCpf?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  localidade?: string;
  latitude?: number;
  longitude?: number;
  email?: string;
  telefone?: string;
  etapa: 'contato_inicial' | 'negociacao_inicial' | 'orcamento_aprovacao' | 'negociacao_fechamento' | 'contrato';
  valorEstimado?: number | null;
  observacoes?: string | null;
  servicos?: string[];
  origem?: string;
  statusNegociacao?: 'novo' | 'negociando' | 'ganho' | 'perdido' | 'arquivado';
  tagNegociacao?: 'aguardando_cliente' | 'aguardando_pagamento' | 'em_analise' | 'pronto_envio' | 'orcamento_criado';
  tagContrato?: 'enviado_cliente' | 'aguardando_assinatura' | 'aguardando_material' | 'aguardando_execucao' | 'aguardando_agenda';
  proximaData?: string;
  andamento?: string;
  responsavel_id?: number;
  responsavel?: { id: number; nome: string };
  consultaSerasa?: string;
  preOrcamento?: string;
  cpfObrigatorio?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useLeads() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeads() {
    if (!session?.accessToken) return;

    const response = await api.get<Lead[]>('/leads', session.accessToken);
    
    if (response.data) {
      setLeads(response.data);
    } else if (response.error) {
      console.error('Erro ao buscar leads:', response.error);
    }
    
    setLoading(false);
  }

  async function createLead(data: {
    nomeResponsavel: string;
    empresa?: string;
    cnpjCpf?: string;
    localidade?: string;
    latitude?: number;
    longitude?: number;
    email?: string;
    telefone?: string;
    observacoes?: string | null;
    servico?: string;
    origem?: string;
    statusNegociacao?: Lead['statusNegociacao'];
    proximaData?: string;
    andamento?: string;
    responsavel_id?: number;
    etapa?: Lead['etapa'];
  }) {
    if (!session?.accessToken) return;

    const payload = {
      ...data,
      ...(data.cnpjCpf ? { cnpjCpf: data.cnpjCpf.replace(/[.\-\s]/g, '') } : {}),
    };
    const response = await api.post<Lead>('/leads', payload, session.accessToken);
    
    if (response.data) {
      await fetchLeads();
      return true;
    } else if (response.error) {
      console.error('Erro ao criar lead:', response.error);
    }
    
    return false;
  }

  async function updateLead(id: number, data: Partial<Lead>) {
    if (!session?.accessToken) return;

    const payload = data.cnpjCpf ? { ...data, cnpjCpf: data.cnpjCpf.replace(/[.\-\s]/g, '') } : data;
    const response = await api.put<Lead>(`/leads/${id}`, payload, session.accessToken);
    
    if (response.data) {
      await fetchLeads();
      return true;
    } else if (response.error) {
      console.error('Erro ao atualizar lead:', response.error);
    }
    
    return false;
  }

  async function deleteLead(id: number) {
    if (!session?.accessToken) return;

    const response = await api.delete(`/leads/${id}`, session.accessToken);
    
    if (response.data !== undefined) {
      await fetchLeads();
      return true;
    } else if (response.error) {
      console.error('Erro ao deletar lead:', response.error);
    }
    
    return false;
  }

  async function updateLeadStage(id: number, etapa: Lead['etapa']) {
    if (!session?.accessToken) return;

    const response = await api.put<Lead>(`/leads/${id}/stage`, { etapa }, session.accessToken);
    
    if (response.data) {
      await fetchLeads();
      return true;
    } else if (response.error) {
      console.error('Erro ao atualizar etapa:', response.error);
    }
    
    return false;
  }

  useEffect(() => {
    if (session) {
      fetchLeads();
    }
  }, [session]);

  return {
    leads,
    loading,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStage,
  };
}
