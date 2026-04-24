import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export enum UserRole {
  ADMIN = 'admin',
  FUNCIONARIO = 'func',
  FINANCEIRO = 'finan',
  GESTOR = 'gest',
  VENDEDOR = 'vend',
}

export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  funcao: UserRole;
  email: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useUsuarios() {
  const { data: session } = useSession();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchUsuarios() {
    if (!session?.accessToken) return;

    const response = await api.get<Usuario[]>('/users', session.accessToken);
    
    if (response.data) {
      setUsuarios(response.data);
    } else if (response.error) {
      console.error('Erro ao buscar usuários:', response.error);
    }
    
    setLoading(false);
  }

  async function createUsuario(usuarioData: { nome: string; cpf: string; funcao: UserRole; email: string }) {
    const cpf = usuarioData.cpf.replace(/[.\-\s]/g, '');
    // Senha padrão é o CPF normalizado
    const dataWithPassword = { ...usuarioData, cpf, password: cpf };
    const response = await api.post('/auth/register', dataWithPassword);
    
    if (response.data) {
      await fetchUsuarios();
      return true;
    } else if (response.error) {
      console.error('Erro ao criar usuário:', response.error);
    }
    
    return false;
  }

  async function deleteUsuario(id: number) {
    if (!session?.accessToken) return;

    const response = await api.delete(`/users/${id}`, session.accessToken);
    
    if (response.data !== undefined) {
      await fetchUsuarios();
      return true;
    } else if (response.error) {
      console.error('Erro ao deletar usuário:', response.error);
    }
    
    return false;
  }

  async function checkUserRelations(id: number): Promise<{ hasRelations: boolean; relations: string[] } | null> {
    if (!session?.accessToken) return null;

    const response = await api.get<{ hasRelations: boolean; relations: string[] }>(
      `/users/${id}/check-relations`,
      session.accessToken
    );
    
    if (response.data) {
      return response.data;
    }
    
    return null;
  }

  async function toggleUserStatus(id: number) {
    if (!session?.accessToken) return false;

    const response = await api.patch(`/users/${id}/toggle-status`, {}, session.accessToken);
    
    if (response.data) {
      await fetchUsuarios();
      return true;
    } else if (response.error) {
      console.error('Erro ao alterar status do usuário:', response.error);
    }
    
    return false;
  }

  useEffect(() => {
    if (session) {
      fetchUsuarios();
    }
  }, [session]);

  return {
    usuarios,
    loading,
    createUsuario,
    deleteUsuario,
    checkUserRelations,
    toggleUserStatus,
    refetch: fetchUsuarios,
  };
}
