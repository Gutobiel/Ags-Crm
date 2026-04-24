'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { getRoleLabel } from '@/lib/roles';
import { useBranding } from '@/contexts/BrandingContext';
import { HiUsers, HiDocumentText, HiShoppingBag, HiCog, HiChevronLeft, HiLogout, HiCube, HiOfficeBuilding, HiUserGroup, HiFolder, HiMenu, HiUserCircle, HiChartBar } from 'react-icons/hi';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    name: 'CRM',
    href: '/crm',
    icon: <HiUsers className="h-6 w-6" />,
  },
  {
    name: 'Clientes',
    href: '/empresas',
    icon: <HiUserGroup className="h-6 w-6" />,
  },
  {
    name: 'Orçamento',
    href: '/orcamento',
    icon: <HiDocumentText className="h-6 w-6" />,
  },
  {
    name: 'Produtos/Serviços',
    href: '/produtos',
    icon: <HiCube className="h-6 w-6" />,
  },
  {
    name: 'Documentos',
    href: '/documentos',
    icon: <HiFolder className="h-6 w-6" />,
  },
  {
    name: 'Pedidos e Compras',
    href: '/pedidos',
    icon: <HiShoppingBag className="h-6 w-6" />,
  },
  {
    name: 'Relatórios CRM',
    href: '/relatorios/crm',
    icon: <HiChartBar className="h-6 w-6" />,
  },
  {
    name: 'Usuários',
    href: '/usuarios',
    icon: <HiUserGroup className="h-6 w-6" />,
  },
  {
    name: 'Vendedores',
    href: '/vendedores',
    icon: <HiUserCircle className="h-6 w-6" />,
  },
  {
    name: 'Configurações',
    href: '/config',
    icon: <HiCog className="h-6 w-6" />,
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { branding, getLogoUrl } = useBranding();

  return (
    <>
      {/* Botão toggle mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md text-white transition-all duration-300 ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ backgroundColor: branding.primaryColor }}
        aria-label="Toggle menu"
      >
        <HiMenu className="h-6 w-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 lg:bg-black/10 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full text-white z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
        style={{ background: `linear-gradient(to bottom, ${branding.sidebarFrom}, ${branding.sidebarTo})` }}
      >
        <div className="flex flex-col h-full">
          {/* Header com Logo */}
          <div className={`flex items-center justify-center border-b border-white/10 ${isOpen ? 'p-5' : 'p-3'}`}>
            {isOpen ? (
              <Link
                href="/home"
                className={`flex items-center justify-center bg-white rounded-xl shadow-lg shrink-0 hover:scale-105 transition-transform w-55 h-20`}
              >
                <img
                  src={getLogoUrl()}
                  alt={branding.appName}
                  className="max-w-[170px] max-h-[82px] object-contain"
                />
              </Link>
            ) : (
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center bg-white rounded-xl shadow-lg shrink-0 hover:scale-110 transition-transform w-12 h-12"
                style={{ color: branding.sidebarFrom }}
                aria-label="Abrir sidebar"
              >
                <HiMenu className="h-6 w-6" />
              </button>
            )}
            
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 rounded-lg transition-all ${
                        !isOpen ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                      }`}
                      style={isActive ? {
                        background: `linear-gradient(to right, ${branding.primaryColor}, ${branding.primaryLight})`,
                        color: 'white',
                        boxShadow: `0 4px 6px -1px ${branding.primaryColor}30`,
                      } : undefined}
                      onMouseEnter={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '';
                        }
                      }}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {isOpen && (
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer com informações do usuário */}
          <div className="border-t border-white/10" style={{ backgroundColor: `${branding.sidebarTo}80` }}>
            {session && isOpen && (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                    style={{ background: `linear-gradient(to bottom right, ${branding.primaryLight}, ${branding.primaryColor})` }}
                  >
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{getRoleLabel(session.user.funcao)}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="p-3">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className={`flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all ${
                  !isOpen ? 'justify-center' : ''
                }`}
              >
                <HiLogout className="h-5 w-5" />
                {isOpen && <span className="text-sm font-medium">Sair</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
