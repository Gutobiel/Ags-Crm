'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error('Email ou senha inválidos');
    }

    router.push('/home');
    router.refresh();
  };

  const register = async (data: {
    nome: string;
    cpf: string;
    funcao: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post('/auth/register', data);

    if (response.error) {
      throw new Error(response.error);
    }

    // Fazer login após registro
    await login(data.email, data.password);
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const validate = async (token: string) => {
    return await api.get('/auth/validate', token);
  };

  return {
    user: session?.user,
    accessToken: session?.accessToken,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    login,
    register,
    logout,
    validate,
  };
}
