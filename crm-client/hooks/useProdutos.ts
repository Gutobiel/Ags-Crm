import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export enum TipoProduto {
  PRODUTO = 'PRODUTO',
  SERVICO = 'SERVICO',
}

export interface Produto {
  id: number;
  codigo?: string;
  nome: string;
  descricao?: string;
  tipo: TipoProduto;
  categoria?: string;
  unidade: string;
  preco: number;
  custo: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Categoria {
  id: number;
  nome: string;
  ativo: boolean;
}

export function useProdutos() {
  const { data: session } = useSession();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProdutos() {
    if (!session?.accessToken) return;

    const response = await api.get<Produto[]>('/produtos', session.accessToken);

    if (response.data) {
      setProdutos(response.data);
    } else if (response.error) {
      console.error('Erro ao buscar produtos:', response.error);
    }

    setLoading(false);
  }

  async function fetchCategorias() {
    if (!session?.accessToken) return;

    const response = await api.get<Categoria[]>('/produtos/categorias', session.accessToken);

    if (response.data) {
      setCategorias(response.data);
    } else if (response.error) {
      console.error('Erro ao buscar categorias:', response.error);
    }
  }

  async function fetchProdutosAtivos() {
    if (!session?.accessToken) return;

    const response = await api.get<Produto[]>('/produtos/ativos', session.accessToken);

    if (response.data) {
      return response.data;
    } else if (response.error) {
      console.error('Erro ao buscar produtos ativos:', response.error);
    }

    return [];
  }

  async function createProduto(data: Omit<Produto, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!session?.accessToken) return;

    const response = await api.post<Produto>('/produtos', data, session.accessToken);

    if (response.data) {
      await fetchProdutos();
      return true;
    } else if (response.error) {
      console.error('Erro ao criar produto:', response.error);
    }

    return false;
  }

  async function updateProduto(id: number, data: Partial<Produto>) {
    if (!session?.accessToken) return;

    const response = await api.put<Produto>(`/produtos/${id}`, data, session.accessToken);

    if (response.data) {
      await fetchProdutos();
      return true;
    } else if (response.error) {
      console.error('Erro ao atualizar produto:', response.error);
    }

    return false;
  }

  async function deleteProduto(id: number) {
    if (!session?.accessToken) return;

    const response = await api.delete(`/produtos/${id}`, session.accessToken);

    if (response.data !== undefined) {
      await fetchProdutos();
      return true;
    } else if (response.error) {
      console.error('Erro ao deletar produto:', response.error);
    }

    return false;
  }

  async function createCategoria(nome: string) {
    if (!session?.accessToken) return false;

    const response = await api.post<Categoria>('/produtos/categorias', { nome }, session.accessToken);

    if (response.data) {
      await fetchCategorias();
      return true;
    } else if (response.error) {
      console.error('Erro ao criar categoria:', response.error);
    }

    return false;
  }

  async function updateCategoria(id: number, data: Partial<Categoria>) {
    if (!session?.accessToken) return false;

    const response = await api.put<Categoria>(`/produtos/categorias/${id}`, data, session.accessToken);

    if (response.data) {
      await fetchCategorias();
      return true;
    } else if (response.error) {
      console.error('Erro ao atualizar categoria:', response.error);
    }

    return false;
  }

  async function deleteCategoria(id: number) {
    if (!session?.accessToken) return false;

    const response = await api.delete(`/produtos/categorias/${id}`, session.accessToken);

    if (response.data !== undefined) {
      await fetchCategorias();
      return true;
    } else if (response.error) {
      console.error('Erro ao deletar categoria:', response.error);
    }

    return false;
  }

  async function fetchCategoriasAtivas() {
    if (!session?.accessToken) return [];

    const response = await api.get<Categoria[]>('/produtos/categorias/ativas', session.accessToken);

    if (response.data) {
      return response.data;
    } else if (response.error) {
      console.error('Erro ao buscar categorias ativas:', response.error);
    }

    return [];
  }

  useEffect(() => {
    if (session) {
      fetchProdutos();
      fetchCategorias();
    }
  }, [session]);

  return {
    produtos,
    loading,
    fetchProdutos,
    fetchProdutosAtivos,
    createProduto,
    updateProduto,
    deleteProduto,
    categorias,
    fetchCategorias,
    fetchCategoriasAtivas,
    createCategoria,
    updateCategoria,
    deleteCategoria,
  };
}
