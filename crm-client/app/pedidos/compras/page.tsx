'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { ordensCompraService } from '@/lib/services/ordensCompraService';
import { OrdemCompra, StatusOrdemCompra } from '@/types/ordemCompra';

export default function ComprasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ordens, setOrdens] = useState<OrdemCompra[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [dataOrdem, setDataOrdem] = useState(new Date().toISOString().split('T')[0]);
  const [statusOrdem, setStatusOrdem] = useState<StatusOrdemCompra>(StatusOrdemCompra.COTACAO);
  const [valorTotal, setValorTotal] = useState<number | ''>('');
  const [quantidadeTotal, setQuantidadeTotal] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  async function load() {
    if (session?.accessToken) {
      const res = await ordensCompraService.getAll(session.accessToken);
      if (res.data) setOrdens(res.data);
    }
  }

  useEffect(() => {
    if (session) load();
  }, [session]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;
    
    setIsSubmitting(true);
    try {
      await ordensCompraService.create(
        { 
          status: statusOrdem, 
          observacoes,
          data: dataOrdem,
          valorTotal: valorTotal ? Number(valorTotal) : 0,
          quantidadeTotal: quantidadeTotal ? Number(quantidadeTotal) : 0
        },
        session.accessToken
      );
      setIsModalOpen(false);
      setObservacoes('');
      setDataOrdem(new Date().toISOString().split('T')[0]);
      setStatusOrdem(StatusOrdemCompra.COTACAO);
      setValorTotal('');
      setQuantidadeTotal('');
      load(); // Recarrega a tabela
    } catch (error) {
      console.error('Erro ao criar ordem de compra:', error);
      alert('Erro ao criar ordem de compra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') return <div>Carregando...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:ml-20">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4 ml-12 lg:ml-0">
              <Link href="/pedidos" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Ordens de Compra</h1>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={16} /> Nova Compra
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordens.map(o => (
                    <tr key={o.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{o.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(o.data).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{o.quantidadeTotal || 0} un</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {Number(o.valorTotal).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={o.observacoes || '-'}>
                        {o.observacoes || '-'}
                      </td>
                    </tr>
                  ))}
                  {ordens.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">Nenhuma ordem encontrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Nova Compra */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">Criar Nova Compra</h2>
              <p className="text-sm text-gray-500 mt-1">Preencha os detalhes para registrar a ordem de compra. O ID é gerado automaticamente pelo sistema.</p>
            </div>
            <div className="overflow-y-auto p-6">
              <form id="nova-compra-form" onSubmit={handleCreateOrder} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data
                    </label>
                    <input
                      type="date"
                      required
                      value={dataOrdem}
                      onChange={e => setDataOrdem(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={statusOrdem}
                      onChange={e => setStatusOrdem(e.target.value as StatusOrdemCompra)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      {Object.values(StatusOrdemCompra).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade Total
                    </label>
                    <input
                      type="number"
                      value={quantidadeTotal}
                      onChange={e => setQuantidadeTotal(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Total (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={valorTotal}
                      onChange={e => setValorTotal(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações (Opcional)
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    rows={3}
                    placeholder="Ex: Compra de cimento para o projeto X..."
                  />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="nova-compra-form"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Salvando...' : 'Criar Compra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
