import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
  responsavel?: string;
  email?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  observacoes?: string;
  ativo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useEmpresas() {
  const { data: session } = useSession();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchEmpresas() {
    if (!session?.accessToken) return;

    const response = await api.get<Empresa[]>('/empresas', session.accessToken);
    
    if (response.data) {
      setEmpresas(response.data);
    } else if (response.error) {
      console.error('Erro ao buscar empresas:', response.error);
    }
    
    setLoading(false);
  }

  async function createEmpresa(data: Omit<Empresa, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!session?.accessToken) return null;

    const payload = { ...data, cnpj: data.cnpj.replace(/[.\-\s]/g, '') };
    const response = await api.post<Empresa>('/empresas', payload, session.accessToken);
    
    if (response.data) {
      await fetchEmpresas();
      return response.data;
    } else if (response.error) {
      console.error('Erro ao criar empresa:', response.error);
    }
    
    return null;
  }

  async function updateEmpresa(id: number, data: Partial<Empresa>) {
    if (!session?.accessToken) return;

    const payload = data.cnpj ? { ...data, cnpj: data.cnpj.replace(/[.\-\s]/g, '') } : data;
    const response = await api.put<Empresa>(`/empresas/${id}`, payload, session.accessToken);
    
    if (response.data) {
      await fetchEmpresas();
      return true;
    } else if (response.error) {
      console.error('Erro ao atualizar empresa:', response.error);
    }
    
    return false;
  }

  async function deleteEmpresa(id: number) {
    if (!session?.accessToken) return;

    const response = await api.delete(`/empresas/${id}`, session.accessToken);
    
    if (response.data !== undefined) {
      await fetchEmpresas();
      return true;
    } else if (response.error) {
      console.error('Erro ao deletar empresa:', response.error);
    }
    
    return false;
  }

  async function checkEmpresaRelations(id: number): Promise<{ hasRelations: boolean; relations: string[] } | null> {
    if (!session?.accessToken) return null;

    const response = await api.get<{ hasRelations: boolean; relations: string[] }>(
      `/empresas/${id}/check-relations`,
      session.accessToken
    );
    
    if (response.data) {
      return response.data;
    }
    
    return null;
  }

  async function toggleEmpresaStatus(id: number) {
    if (!session?.accessToken) return false;

    const response = await api.patch(`/empresas/${id}/toggle-status`, {}, session.accessToken);
    
    if (response.data) {
      await fetchEmpresas();
      return true;
    } else if (response.error) {
      console.error('Erro ao alterar status da empresa:', response.error);
    }
    
    return false;
  }

  useEffect(() => {
    if (session) {
      fetchEmpresas();
    }
  }, [session]);

  return {
    empresas,
    loading,
    fetchEmpresas,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
    checkEmpresaRelations,
    toggleEmpresaStatus,
  };
}
