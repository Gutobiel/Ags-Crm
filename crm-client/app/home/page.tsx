'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { getRoleLabel } from '@/lib/roles';
import { HiUsers, HiDocumentText, HiShoppingBag, HiCube, HiFolder, HiChartBar, HiUserCircle, HiCog } from 'react-icons/hi';
import { useBranding } from '@/contexts/BrandingContext';

interface ModuleCard {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const modules: ModuleCard[] = [
  {
    name: 'CRM',
    description: 'Gerenciar leads e clientes',
    href: '/crm',
    icon: <HiUsers className="h-6 w-6" />,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    name: 'Clientes',
    description: 'Cadastro de clientes (PF/PJ)',
    href: '/empresas',
    icon: <HiUsers className="h-6 w-6" />,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Orçamento',
    description: 'Criar e gerenciar orçamentos',
    href: '/orcamento',
    icon: <HiDocumentText className="h-6 w-6" />,
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    name: 'Produtos/Serviços',
    description: 'Catálogo de produtos',
    href: '/produtos',
    icon: <HiCube className="h-6 w-6" />,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'Documentos',
    description: 'Gerenciar arquivos',
    href: '/documentos',
    icon: <HiFolder className="h-6 w-6" />,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    name: 'Pedidos e Compras',
    description: 'Gerenciar pedidos',
    href: '/pedidos',
    icon: <HiShoppingBag className="h-6 w-6" />,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    name: 'Relatórios CRM',
    description: 'Análise de vendas',
    href: '/relatorios/crm',
    icon: <HiChartBar className="h-6 w-6" />,
    color: 'bg-green-100 text-green-600',
  },
  {
    name: 'Vendedores',
    description: 'Gerenciar vendedores',
    href: '/vendedores',
    icon: <HiUserCircle className="h-6 w-6" />,
    color: 'bg-rose-100 text-rose-600',
  },
  {
    name: 'Usuários',
    description: 'Gerenciar usuários',
    href: '/usuarios',
    icon: <HiUsers className="h-6 w-6" />,
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    name: 'Configurações',
    description: 'Preferências do sistema',
    href: '/config',
    icon: <HiCog className="h-6 w-6" />,
    color: 'bg-gray-100 text-gray-600',
  },
];

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
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Módulos Disponíveis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {modules.map((module) => (
                  <Link
                    key={module.href}
                    href={module.href}
                    className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md hover:border-emerald-300 transition-all group"
                  >
                    <div className={`p-2 rounded-lg ${module.color} w-fit mb-3 group-hover:scale-110 transition-transform`}>
                      {module.icon}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">{module.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
