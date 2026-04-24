'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  useOrcamentos,
  Orcamento,
  StatusOrcamento,
  StatusPagamento,
  OrcamentoItem,
} from '@/hooks/useOrcamentos';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useLeads } from '@/hooks/useLeads';
import { useProdutos } from '@/hooks/useProdutos';
import ConfirmModal from '@/components/ConfirmModal';
import {
  HiPlus,
  HiEye,
  HiPencil,
  HiTrash,
  HiSearch,
  HiX,
  HiDocumentText,
} from 'react-icons/hi';

const statusOrcamentoLabels = {
  [StatusOrcamento.RASCUNHO]: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
  [StatusOrcamento.ENVIADO]: { label: 'Enviado', color: 'bg-blue-100 text-blue-800' },
  [StatusOrcamento.APROVADO]: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
  [StatusOrcamento.REJEITADO]: { label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
  [StatusOrcamento.EXPIRADO]: { label: 'Expirado', color: 'bg-orange-100 text-orange-800' },
};

const statusPagamentoLabels = {
  [StatusPagamento.PENDENTE]: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  [StatusPagamento.PAGO]: { label: 'Pago', color: 'bg-green-100 text-green-800' },
  [StatusPagamento.PARCIAL]: { label: 'Parcial', color: 'bg-blue-100 text-blue-800' },
  [StatusPagamento.ATRASADO]: { label: 'Atrasado', color: 'bg-red-100 text-red-800' },
};

export default function OrcamentoPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { orcamentos, loading, createOrcamento, updateOrcamento, deleteOrcamento } = useOrcamentos();
  const { empresas } = useEmpresas();
  const { leads } = useLeads();
  const { produtos } = useProdutos();
  
  const [showModal, setShowModal] = useState(false);
  const [viewOrcamento, setViewOrcamento] = useState<Orcamento | null>(null);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedEmpresa, setSelectedEmpresa] = useState<number | null>(null);
  const [selectedLead, setSelectedLead] = useState<number | null>(null);
  const [itens, setItens] = useState<OrcamentoItem[]>([]);
  const [desconto, setDesconto] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orcamentoToDelete, setOrcamentoToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, router]);

  async function handleSaveOrcamento(formData: FormData) {
    if (!selectedEmpresa) {
      alert('Selecione uma empresa');
      return;
    }

    if (itens.length === 0) {
      alert('Adicione pelo menos um item');
      return;
    }

    const valorTotal = itens.reduce((sum, item) => sum + item.subtotal, 0) - desconto;

    const data = {
      empresa: { id: selectedEmpresa } as any,
      lead: selectedLead ? ({ id: selectedLead } as any) : null,
      status: formData.get('status') as StatusOrcamento,
      statusPagamento: formData.get('statusPagamento') as StatusPagamento,
      dataEmissao: formData.get('dataEmissao') as string,
      dataValidade: formData.get('dataValidade') as string,
      itens,
      desconto,
      valorTotal,
      observacoes: formData.get('observacoes') as string || undefined,
      condicoesPagamento: formData.get('condicoesPagamento') as string || undefined,
    };

    const success = editingOrcamento
      ? await updateOrcamento(editingOrcamento.id, data)
      : await createOrcamento(data);

    if (success) {
      setShowModal(false);
      setEditingOrcamento(null);
      resetForm();
    }
  }

  function resetForm() {
    setSelectedEmpresa(null);
    setSelectedLead(null);
    setItens([]);
    setDesconto(0);
  }

  async function handleDeleteOrcamento(id: number) {
    setOrcamentoToDelete(id);
    setShowConfirmModal(true);
  }

  async function confirmDelete() {
    if (orcamentoToDelete === null) return;
    await deleteOrcamento(orcamentoToDelete);
    setOrcamentoToDelete(null);
  }

  function addItem() {
    setItens([
      ...itens,
      {
        produtoId: 0,
        codigo: '',
        nome: '',
        descricao: '',
        quantidade: 1,
        unidade: 'un',
        precoUnitario: 0,
        subtotal: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    setItens(itens.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof OrcamentoItem, value: any) {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: value };
    
    if (field === 'quantidade' || field === 'precoUnitario') {
      const quantidade = Number(newItens[index].quantidade) || 0;
      const precoUnitario = Number(newItens[index].precoUnitario) || 0;
      newItens[index].subtotal = quantidade * precoUnitario;
    }
    
    setItens(newItens);
  }

  function selectProduto(index: number, produtoId: number) {
    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) return;

    const newItens = [...itens];
    newItens[index] = {
      produtoId: produto.id,
      codigo: produto.codigo || '',
      nome: produto.nome,
      descricao: produto.descricao || '',
      quantidade: 1,
      unidade: produto.unidade,
      precoUnitario: Number(produto.preco) || 0,
      subtotal: Number(produto.preco) || 0,
    };
    setItens(newItens);
  }

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session) return null;

  const filteredOrcamentos = orcamentos.filter((orc) => {
    const matchesStatus = filterStatus === 'all' || orc.status === filterStatus;
    const matchesSearch =
      orc.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.empresa.nome.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const subtotal = itens.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const total = subtotal - desconto;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 lg:ml-20">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 ml-12 lg:ml-0">Orçamentos</h1>
            <button
              onClick={() => {
                setEditingOrcamento(null);
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
            >
              <HiPlus className="h-5 w-5" />
              <span className="hidden sm:inline">Novo Orçamento</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[StatusOrcamento.RASCUNHO, StatusOrcamento.ENVIADO, StatusOrcamento.APROVADO, StatusOrcamento.REJEITADO].map(
              (status) => {
                const count = orcamentos.filter((o) => o.status === status).length;
                const info = statusOrcamentoLabels[status];
                return (
                  <div key={status} className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">{info.label}</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{count}</p>
                      </div>
                      <HiDocumentText className="h-8 sm:h-10 w-8 sm:w-10 text-gray-300" />
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            >
              <option value="all">Todos</option>
              {Object.entries(statusOrcamentoLabels).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Lista - Tabela no desktop, Cards no mobile */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrcamentos.map((orcamento) => (
                  <tr key={orcamento.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {orcamento.numero}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{orcamento.empresa.nome}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(orcamento.dataEmissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R$ {Number(orcamento.valorTotal || 0).toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusOrcamentoLabels[orcamento.status].color}`}>
                        {statusOrcamentoLabels[orcamento.status].label}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusPagamentoLabels[orcamento.statusPagamento].color}`}>
                        {statusPagamentoLabels[orcamento.statusPagamento].label}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                      <button
                        onClick={() => setViewOrcamento(orcamento)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <HiEye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingOrcamento(orcamento);
                          setSelectedEmpresa(orcamento.empresa.id);
                          setSelectedLead(orcamento.lead?.id || null);
                          setItens(orcamento.itens);
                          setDesconto(orcamento.desconto);
                          setShowModal(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        <HiPencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrcamento(orcamento.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <HiTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrcamentos.length === 0 && (
              <div className="text-center py-12">
                <HiDocumentText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">Nenhum orçamento encontrado</p>
              </div>
            )}
          </div>

          {/* Cards para Mobile */}
          <div className="md:hidden space-y-3">
            {filteredOrcamentos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <HiDocumentText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">Nenhum orçamento</p>
              </div>
            ) : (
              filteredOrcamentos.map((orcamento) => (
                <div key={orcamento.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{orcamento.numero}</p>
                      <p className="text-sm text-gray-600">{orcamento.empresa.nome}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">R$ {Number(orcamento.valorTotal || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{new Date(orcamento.dataEmissao).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusOrcamentoLabels[orcamento.status].color}`}>
                      {statusOrcamentoLabels[orcamento.status].label}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusPagamentoLabels[orcamento.statusPagamento].color}`}>
                      {statusPagamentoLabels[orcamento.statusPagamento].label}
                    </span>
                  </div>
                  <div className="flex gap-2 justify-between">
                    <button
                      onClick={() => setViewOrcamento(orcamento)}
                      className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 py-2 rounded text-sm"
                    >
                      <HiEye className="h-4 w-4" />
                      Ver
                    </button>
                    <button
                      onClick={() => {
                        setEditingOrcamento(orcamento);
                        setSelectedEmpresa(orcamento.empresa.id);
                        setSelectedLead(orcamento.lead?.id || null);
                        setItens(orcamento.itens);
                        setDesconto(orcamento.desconto);
                        setShowModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 text-emerald-600 hover:bg-emerald-50 py-2 rounded text-sm"
                    >
                      <HiPencil className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteOrcamento(orcamento.id)}
                      className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded text-sm"
                    >
                      <HiTrash className="h-4 w-4" />
                      Deletar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Modal Formulário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full my-4 sm:my-8">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {editingOrcamento ? 'Editar' : 'Novo'} Orçamento
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <HiX className="h-6 w-6" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveOrcamento(new FormData(e.currentTarget));
              }}
              className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa*</label>
                  <select
                    value={selectedEmpresa || ''}
                    onChange={(e) => setSelectedEmpresa(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm placeholder-gray-400 text-gray-900"
                  >
                    <option value="">Selecione...</option>
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead (Opcional)</label>
                  <select
                    value={selectedLead || ''}
                    onChange={(e) => setSelectedLead(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm placeholder-gray-400 text-gray-900"
                  >
                    <option value="">Nenhum</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.nomeResponsavel} - {typeof lead.empresa === 'object' && lead.empresa !== null ? lead.empresa.nome : lead.empresa || '-'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Emissão*</label>
                  <input
                    type="date"
                    name="dataEmissao"
                    defaultValue={editingOrcamento?.dataEmissao || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm placeholder-gray-400 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Validade*</label>
                  <input
                    type="date"
                    name="dataValidade"
                    defaultValue={editingOrcamento?.dataValidade}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm placeholder-gray-400 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                  <select
                    name="status"
                    defaultValue={editingOrcamento?.status || StatusOrcamento.RASCUNHO}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm placeholder-gray-400 text-gray-900"
                  >
                    {Object.entries(statusOrcamentoLabels).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pagamento*</label>
                  <select
                    name="statusPagamento"
                    defaultValue={editingOrcamento?.statusPagamento || StatusPagamento.PENDENTE}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm placeholder-gray-400 text-gray-900"
                  >
                    {Object.entries(statusPagamentoLabels).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Itens*</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  >
                    Item
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {itens.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                      <select
                        value={item.produtoId || ''}
                        onChange={(e) => selectProduto(index, Number(e.target.value))}
                        className="flex-1 px-2 py-1 text-sm border rounded placeholder-gray-400 text-gray-900"
                      >
                        <option value="">Selecione...</option>
                        {produtos.filter(p => p.ativo).map((p) => (
                          <option key={p.id} value={p.id}>{p.codigo} - {p.nome}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => updateItem(index, 'quantidade', Number(e.target.value))}
                        className="w-20 px-2 py-1 text-sm border rounded placeholder-gray-400 text-gray-900"
                        min="0.01"
                        step="0.01"
                      />
                      <input
                        type="text"
                        value={item.unidade}
                        readOnly
                        className="w-16 px-2 py-1 text-sm border rounded bg-gray-100 placeholder-gray-400 text-gray-900"
                      />
                      <input
                        type="number"
                        value={item.precoUnitario}
                        onChange={(e) => updateItem(index, 'precoUnitario', Number(e.target.value))}
                        className="w-24 px-2 py-1 text-sm border rounded placeholder-gray-400 text-gray-900"
                        step="0.01"
                      />
                      <div className="w-24 px-2 py-1 text-sm bg-gray-100 rounded text-gray-900">
                        R$ {Number(item.subtotal || 0).toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <HiX className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600">Desconto:</label>
                  <input
                    type="number"
                    value={desconto}
                    onChange={(e) => setDesconto(Number(e.target.value))}
                    step="0.01"
                    className="w-32 px-2 py-1 text-sm border rounded text-right placeholder-gray-400 text-gray-900"
                  />
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-emerald-600">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    name="observacoes"
                    defaultValue={editingOrcamento?.observacoes}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 placeholder-gray-400 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condições Pagamento</label>
                  <textarea
                    name="condicoesPagamento"
                    defaultValue={editingOrcamento?.condicoesPagamento}
                    rows={3}
                    placeholder="Ex: 30/60 dias"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 placeholder-gray-400 text-gray-900"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View */}
      {viewOrcamento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Orçamento {viewOrcamento.numero}</h2>
              <button onClick={() => setViewOrcamento(null)} className="text-gray-400 hover:text-gray-600">
                <HiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Empresa</p>
                  <p className="font-medium">{viewOrcamento.empresa.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lead</p>
                  <p className="font-medium">{viewOrcamento.lead?.nome || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data Emissão</p>
                  <p className="font-medium">{new Date(viewOrcamento.dataEmissao).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Validade</p>
                  <p className="font-medium">{new Date(viewOrcamento.dataValidade).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Itens</p>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Item</th>
                      <th className="text-right p-2">Qtd</th>
                      <th className="text-right p-2">Preço</th>
                      <th className="text-right p-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrcamento.itens.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{item.nome}</td>
                        <td className="text-right p-2">{item.quantidade} {item.unidade}</td>
                        <td className="text-right p-2">R$ {item.precoUnitario.toFixed(2)}</td>
                        <td className="text-right p-2">R$ {item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2">
                    <tr>
                      <td colSpan={3} className="text-right p-2 font-medium">Desconto:</td>
                      <td className="text-right p-2">R$ {Number(viewOrcamento.desconto || 0).toFixed(2)}</td>
                    </tr>
                    <tr className="font-bold text-lg">
                      <td colSpan={3} className="text-right p-2">Total:</td>
                      <td className="text-right p-2 text-emerald-600">R$ {Number(viewOrcamento.valorTotal || 0).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {viewOrcamento.observacoes && (
                <div>
                  <p className="text-sm text-gray-600">Observações</p>
                  <p className="text-sm">{viewOrcamento.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setOrcamentoToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Orçamento"
        message="Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
