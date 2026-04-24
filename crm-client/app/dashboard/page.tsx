'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { getRoleLabel } from '@/lib/roles';
import { HiUsers, HiDocumentText, HiShoppingBag } from 'react-icons/hi';
import { useBranding } from '@/contexts/BrandingContext';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { branding } = useBranding();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-20">
        {/* Top bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 ml-12 lg:ml-0">Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{session.user.name}</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-gray-500">{getRoleLabel(session.user.funcao)}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {branding.welcomeMessage} ao {branding.appName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 w-20">Nome:</span>
                    <span className="text-gray-900">{session.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 w-20">Email:</span>
                    <span className="text-gray-900">{session.user.email}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 w-20">CPF:</span>
                    <span className="text-gray-900">{session.user.cpf}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 w-20">Função:</span>
                    <span className="text-gray-900">{getRoleLabel(session.user.funcao)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards de acesso rápido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <a
                href="/crm"
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition">
                    <HiUsers className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">CRM</h3>
                    <p className="text-sm text-gray-500">Gerenciar clientes</p>
                  </div>
                </div>
              </a>

              <a
                href="/orcamento"
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                    <HiDocumentText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Orçamento</h3>
                    <p className="text-sm text-gray-500">Criar orçamentos</p>
                  </div>
                </div>
              </a>

              <a
                href="/pedidos"
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition">
                    <HiShoppingBag className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pedidos e Compras</h3>
                    <p className="text-sm text-gray-500">Gerenciar pedidos</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
