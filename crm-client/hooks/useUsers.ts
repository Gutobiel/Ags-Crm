'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

interface User {
  id: number;
  nome: string;
  cpf: string;
  funcao: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export function useUsers() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = session?.accessToken;

  const getProfile = async () => {
    if (!token) {
      setError('Usuário não autenticado');
      return null;
    }

    setLoading(true);
    setError(null);

    const response = await api.get<User>('/users/me', token);

    if (response.error) {
      setError(response.error);
      setLoading(false);
      return null;
    }

    setLoading(false);
    return response.data;
  };

  return {
    loading,
    error,
    getProfile,
  };
}
