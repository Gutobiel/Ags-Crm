'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useLeads } from '@/hooks/useLeads';
import { useUsuarios, UserRole } from '@/hooks/useUsuarios';
import { HiChartBar, HiCalendar, HiUserGroup } from 'react-icons/hi';

export default function RelatorioCRMPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { leads, loading } = useLeads();
  const { usuarios } = useUsuarios();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vendedorId, setVendedorId] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const vendedores = usuarios.filter((u) => u.funcao === UserRole.VENDEDOR);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const created = new Date(lead.createdAt);
      if (startDate && created < new Date(startDate)) return false;
      if (endDate && created > new Date(endDate + 'T23:59:59')) return false;
      if (vendedorId && (lead as any).responsavel?.id?.toString() !== vendedorId) return false;
      return true;
    });
  }, [leads, startDate, endDate, vendedorId]);

  const vendas = useMemo(() => {
    return filteredLeads.filter((lead) => {
      const statusNegociacao = (lead as any).statusNegociacao || '';
      return statusNegociacao === 'ganho';
    });
  }, [filteredLeads]);

  const vendasPorVendedor = useMemo(() => {
    const mapa: Record<string, { total: number; valor: number }> = {};
    vendas.forEach((lead) => {
      const nome = (lead as any).responsavel?.nome || 'Sem vendedor';
      mapa[nome] = mapa[nome] || { total: 0, valor: 0 };
      mapa[nome].total += 1;
      mapa[nome].valor += Number((lead as any).valorEstimado || 0);
    });
    return mapa;
  }, [vendas]);

  const vendasPorData = useMemo(() => {
    const mapa: Record<string, { total: number; valor: number }> = {};
    vendas.forEach((lead) => {
      const data = new Date(lead.createdAt).toLocaleDateString('pt-BR');
      mapa[data] = mapa[data] || { total: 0, valor: 0 };
      mapa[data].total += 1;
      mapa[data].valor += Number((lead as any).valorEstimado || 0);
    });
    return mapa;
  }, [vendas]);

  const totalVendas = vendas.length;
  const totalValor = vendas.reduce((sum, lead) => sum + Number((lead as any).valorEstimado || 0), 0);
  const ticketMedio = totalVendas > 0 ? totalValor / totalVendas : 0;

  const statusDistribuicao = useMemo(() => {
    const mapa: Record<string, number> = {
      novo: 0,
      negociando: 0,
      ganho: 0,
      perdido: 0,
    };
    filteredLeads.forEach((lead) => {
      const st = ((lead as any).statusNegociacao || 'novo') as keyof typeof mapa;
      if (st in mapa) {
        mapa[st] += 1;
      }
    });
    return mapa;
  }, [filteredLeads]);

  const etapaDistribuicao = useMemo(() => {
    const mapa: Record<string, number> = {
      contato_inicial: 0,
      orcamento: 0,
      faturamento: 0,
      instalacao: 0,
    };
    filteredLeads.forEach((lead) => {
      const et = lead.etapa as keyof typeof mapa;
      mapa[et] = (mapa[et] || 0) + 1;
    });
    return mapa;
  }, [filteredLeads]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:ml-20">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 ml-12 lg:ml-0">Relatório CRM</h1>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 mb-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
                <select
                  value={vendedorId}
                  onChange={(e) => setVendedorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Todos</option>
                  {vendedores.map((vend) => (
                    <option key={vend.id} value={vend.id}>{vend.nome}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                  <p className="text-xs text-emerald-700 font-semibold">Período</p>
                  <p className="text-sm text-emerald-800">{startDate || 'Início'} - {endDate || 'Hoje'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-lg"><HiChartBar className="h-6 w-6 text-emerald-600" /></div>
              <div>
                <p className="text-sm text-gray-600">Vendas</p>
                <p className="text-2xl font-bold text-gray-900">{totalVendas}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg"><HiCalendar className="h-6 w-6 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg"><HiUserGroup className="h-6 w-6 text-amber-600" /></div>
              <div>
                <p className="text-sm text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900">{ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Vendas por Vendedor</h3>
                <span className="text-xs text-gray-500">{Object.keys(vendasPorVendedor).length} vendedores</span>
              </div>
              <div className="space-y-2">
                {Object.entries(vendasPorVendedor).map(([nome, data]) => (
                  <div key={nome} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-gray-900">{nome}</p>
                      <p className="text-xs text-gray-500">{data.total} vendas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      <p className="text-xs text-gray-500">Ticket: {data.total > 0 ? (data.valor / data.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}</p>
                    </div>
                  </div>
                ))}
                {Object.keys(vendasPorVendedor).length === 0 && (
                  <p className="text-sm text-gray-500">Nenhuma venda no período.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Vendas por Data</h3>
                <span className="text-xs text-gray-500">{Object.keys(vendasPorData).length} dias</span>
              </div>
              <div className="space-y-2">
                {Object.entries(vendasPorData).map(([data, info]) => (
                  <div key={data} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-gray-900">{data}</p>
                      <p className="text-xs text-gray-500">{info.total} vendas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{info.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      <p className="text-xs text-gray-500">Ticket: {info.total > 0 ? (info.valor / info.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}</p>
                    </div>
                  </div>
                ))}
                {Object.keys(vendasPorData).length === 0 && (
                  <p className="text-sm text-gray-500">Nenhuma venda no período.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Distribuição por Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-100"></div>
                    <span className="text-sm text-gray-700">Novo</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{statusDistribuicao.novo}</p>
                    <p className="text-xs text-gray-500">{filteredLeads.length > 0 ? ((statusDistribuicao.novo / filteredLeads.length) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-100"></div>
                    <span className="text-sm text-gray-700">Negociando</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{statusDistribuicao.negociando}</p>
                    <p className="text-xs text-gray-500">{filteredLeads.length > 0 ? ((statusDistribuicao.negociando / filteredLeads.length) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-100"></div>
                    <span className="text-sm text-gray-700">Ganho</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{statusDistribuicao.ganho}</p>
                    <p className="text-xs text-gray-500">{filteredLeads.length > 0 ? ((statusDistribuicao.ganho / filteredLeads.length) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-100"></div>
                    <span className="text-sm text-gray-700">Perdido</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{statusDistribuicao.perdido}</p>
                    <p className="text-xs text-gray-500">{filteredLeads.length > 0 ? ((statusDistribuicao.perdido / filteredLeads.length) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Distribuição por Etapa</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-100"></div>
                    <span className="text-sm text-gray-700">Contato Inicial</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{etapaDistribuicao.contato_inicial}</p>
                    <p className="text-xs text-gray-500">{filteredLeads.length > 0 ? ((etapaDistribuicao.contato_inicial / filteredLeads.length) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-100"></div>
                    <span className="text-sm text-gray-700">Orçamento</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{etapaDistribuicao.orcamento}</p>
                    <p className="text-xs text-gray-500">{filteredLeads.length > 0 ? ((etapaDistribuicao.orcamento / filteredLeads.length) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-100"></div>
                    <span className="text-sm text-gray-700">Faturamento</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{etapaDistribuicao.faturamento}</p>
                    <p className="text-xs text-gray-500">{filteredLeads.length > 0 ? ((etapaDistribuicao.faturamento / filteredLeads.length) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-100"></div>
                    <span className="text-sm text-gray-700">Instalação</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{etapaDistribuicao.instalacao}</p>
                    <p className="text-xs text-gray-500">{filteredLeads.length > 0 ? ((etapaDistribuicao.instalacao / filteredLeads.length) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
