import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export enum TipoDocumento {
  CONTRATO = 'contrato',
  NOTA_FISCAL = 'nota_fiscal',
  COMPROVANTE = 'comprovante',
  OUTROS = 'outros',
}

export interface Documento {
  id: number;
  nome: string;
  tipo: TipoDocumento;
  arquivo: string;
  tamanho: number;
  empresa: { id: number; nome: string };
  usuario?: { id: number; nome: string };
  observacoes?: string;
  createdAt: string;
}

export function useDocumentos() {
  const { data: session } = useSession();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchDocumentos() {
    if (!session?.accessToken) return;

    const response = await api.get<Documento[]>('/documentos', session.accessToken);
    
    if (response.data) {
      setDocumentos(response.data);
    } else if (response.error) {
      console.error('Erro ao buscar documentos:', response.error);
    }
    
    setLoading(false);
  }

  async function uploadDocumento(file: File, tipo: TipoDocumento, empresaId: number, observacoes?: string) {
    if (!session?.accessToken) return false;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);
    formData.append('empresaId', empresaId.toString());
    if (observacoes) formData.append('observacoes', observacoes);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/documentos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        await fetchDocumentos();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return false;
    }
  }

  async function deleteDocumento(id: number) {
    if (!session?.accessToken) return false;

    const response = await api.delete(`/documentos/${id}`, session.accessToken);
    
    if (!response.error) {
      await fetchDocumentos();
      return true;
    }
    
    return false;
  }

  async function downloadDocumento(id: number) {
    if (!session?.accessToken) return;

    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/documentos/download/${id}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('Erro ao baixar documento:', response.statusText);
        return;
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      const filenameMatch = contentDisposition?.match(/filename="?([^";]+)"?/i);
      const filename = filenameMatch?.[1] || `documento-${id}`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
    }
  }

  useEffect(() => {
    if (session) {
      fetchDocumentos();
    }
  }, [session]);

  return {
    documentos,
    loading,
    fetchDocumentos,
    uploadDocumento,
    deleteDocumento,
    downloadDocumento,
  };
}
