'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useProdutos, Produto, TipoProduto } from '@/hooks/useProdutos';
import { useNotification } from '@/contexts/NotificationContext';
import ConfirmModal from '@/components/ConfirmModal';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiMenu } from 'react-icons/hi';
import CategoryModal from './components/CategoryModal';

export default function ProdutosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { produtos, loading, createProduto, updateProduto, deleteProduto, categorias, createCategoria, updateCategoria, deleteCategoria, } = useProdutos();
  const { success, error } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<number | null>(null);
  const unidadeOptions = ['un', 'm', 'kg', 'h', 'l', 'm²', 'm³', 'km', 'cx', 'pct', 'par'];
  const [unidadeSelect, setUnidadeSelect] = useState<string>('un');
  const [unidadeCustom, setUnidadeCustom] = useState<string>('');
  const [precoDisplay, setPrecoDisplay] = useState<string>('');
  const [custoDisplay, setCustoDisplay] = useState<string>('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const availableCategories = categorias.filter(c => c.ativo).map(c => c.nome).sort();

  function formatCurrencyInput(v: string): string {
    const onlyDigits = (v || '').toString().replace(/\D/g, '');
    const number = Number(onlyDigits) / 100;
    return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function parseCurrencyInput(v: string | null | undefined): number {
    if (!v) return 0;
    const normalized = v.replace(/\./g, '').replace(',', '.');
    const n = parseFloat(normalized);
    return isNaN(n) ? 0 : n;
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  async function handleSaveProduto(formData: FormData) {
    const unidade = unidadeSelect === 'outro' ? (unidadeCustom || 'un') : unidadeSelect;
    const data = {
      codigo: formData.get('codigo') as string || undefined,
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string || undefined,
      tipo: formData.get('tipo') as TipoProduto,
      categoria: formData.get('categoria') as string || undefined,
      unidade,
      preco: parseCurrencyInput(precoDisplay),
      custo: parseCurrencyInput(custoDisplay) || 0,
      ativo: formData.get('ativo') === 'true',
    };

    const isSuccess = editingProduto
      ? await updateProduto(editingProduto.id, data)
      : await createProduto(data);

    if (isSuccess) {
      success(editingProduto ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
      setShowModal(false);
      setEditingProduto(null);
    } else {
      error('Erro ao salvar produto. Tente novamente.');
    }
  }

  async function handleDeleteProduto(id: number) {
    setProdutoToDelete(id);
    setShowConfirmModal(true);
  }

  async function confirmDelete() {
    if (produtoToDelete === null) return;
    const isSuccess = await deleteProduto(produtoToDelete);
    if (isSuccess) {
      success('Produto excluído com sucesso!');
    } else {
      error('Erro ao excluir produto.');
    }
    setProdutoToDelete(null);
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session) return null;

  const filteredProdutos = produtos.filter((produto) => {
    const matchesTipo = filterTipo === 'all' || produto.tipo === filterTipo;
    const matchesSearch =
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (produto.codigo?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesTipo && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 lg:ml-20">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 ml-12 lg:ml-0">Produtos e Serviços</h1>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowCategoryModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition shadow-sm"
              >
                <HiMenu className="h-5 w-5" />
                <span className="hidden sm:inline">Categorias</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduto(null);
                  setUnidadeSelect('un');
                  setUnidadeCustom('');
                  setPrecoDisplay('');
                  setCustoDisplay('');
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
              >
                <HiPlus className="h-5 w-5" />
                <span className="hidden sm:inline">Novo</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Filtros e busca */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-6 flex flex-col gap-3">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-gray-500 text-gray-900"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterTipo('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm ${filterTipo === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterTipo(TipoProduto.PRODUTO)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm ${filterTipo === TipoProduto.PRODUTO
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Produtos
              </button>
              <button
                onClick={() => setFilterTipo(TipoProduto.SERVICO)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm ${filterTipo === TipoProduto.SERVICO
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Serviços
              </button>
            </div>
          </div>

          {/* Lista - Tabela no desktop, Cards no mobile */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProdutos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {produto.codigo}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                      {produto.descricao && (
                        <div className="text-sm-1 text-gray-400 truncate max-w-xs">{produto.descricao}</div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${produto.tipo === TipoProduto.PRODUTO
                          ? 'bg-blue-600 text-white'
                          : 'bg-purple-600 text-white'
                          }`}
                      >
                        {produto.tipo === TipoProduto.PRODUTO ? 'Produto' : 'Serviço'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{produto.categoria}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{produto.unidade}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {typeof produto.preco === 'number' ? produto.preco.toFixed(2) : parseFloat(produto.preco || '0').toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${produto.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingProduto(produto);
                          // Initialize form states for edit
                          const isKnownUnit = unidadeOptions.includes(produto.unidade);
                          setUnidadeSelect(isKnownUnit ? produto.unidade : 'outro');
                          setUnidadeCustom(isKnownUnit ? '' : produto.unidade);
                          setPrecoDisplay(
                            (typeof produto.preco === 'number'
                              ? produto.preco
                              : parseFloat(produto.preco || '0')
                            ).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          );
                          setCustoDisplay(
                            (typeof produto.custo === 'number'
                              ? (produto.custo as number)
                              : parseFloat((produto.custo as any) || '0')
                            ).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          );
                          setShowModal(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-900 mr-4"
                      >
                        <HiPencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduto(produto.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <HiTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProdutos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg font-medium">Nenhum produto/serviço encontrado</p>
              </div>
            )}
          </div>

          {/* Cards para Mobile */}
          <div className="md:hidden space-y-3">
            {filteredProdutos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg font-medium">Nenhum produto/serviço</p>
              </div>
            ) : (
              filteredProdutos.map((produto) => (
                <div key={produto.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{produto.nome}</p>
                      <p className="text-xs text-gray-600">{produto.codigo}</p>
                    </div>
                    <p className="font-semibold text-emerald-600">R$ {typeof produto.preco === 'number' ? produto.preco.toFixed(2) : parseFloat(produto.preco || '0').toFixed(2)}</p>
                  </div>
                  {produto.descricao && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{produto.descricao}</p>
                  )}
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${produto.tipo === TipoProduto.PRODUTO
                        ? 'bg-blue-600 text-white'
                        : 'bg-purple-600 text-white'
                        }`}
                    >
                      {produto.tipo === TipoProduto.PRODUTO ? 'Produto' : 'Serviço'}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {produto.unidade}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${produto.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProduto(produto);
                        setShowModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 text-emerald-600 hover:bg-emerald-50 py-2 rounded text-sm"
                    >
                      <HiPencil className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduto(produto.id)}
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
      </div >

      {/* Modal */}
      {
        showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-4 sm:my-8">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editingProduto ? 'Editar' : 'Novo'} Produto/Serviço
                </h2>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveProduto(new FormData(e.currentTarget));
                }}
                className="p-4 sm:p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                    <input
                      type="text"
                      name="codigo"
                      defaultValue={editingProduto?.codigo}
                      placeholder="Opcional"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-500 text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo*</label>
                    <select
                      name="tipo"
                      defaultValue={editingProduto?.tipo || TipoProduto.PRODUTO}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                    >
                      <option value={TipoProduto.PRODUTO}>Produto</option>
                      <option value={TipoProduto.SERVICO}>Serviço</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome*</label>
                  <input
                    type="text"
                    name="nome"
                    defaultValue={editingProduto?.nome}
                    placeholder="Nome do produto ou serviço"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-gray-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    name="descricao"
                    defaultValue={editingProduto?.descricao}
                    rows={3}
                    placeholder="Detalhes do produto/serviço (opcional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-gray-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    name="categoria"
                    defaultValue={editingProduto?.categoria || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                  >
                    <option value="">Sem categoria</option>
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidade*</label>
                    <select
                      name="unidadeSelect"
                      value={unidadeSelect}
                      onChange={(e) => setUnidadeSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                    >
                      {unidadeOptions.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                      <option value="outro">Outro…</option>
                    </select>
                    {unidadeSelect === 'outro' && (
                      <input
                        type="text"
                        name="unidade"
                        value={unidadeCustom}
                        onChange={(e) => setUnidadeCustom(e.target.value)}
                        placeholder="Digite a unidade"
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-gray-500 text-gray-900"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço*</label>
                    <input
                      type="text"
                      name="precoDisplay"
                      value={precoDisplay}
                      onChange={(e) => setPrecoDisplay(formatCurrencyInput(e.target.value))}
                      inputMode="numeric"
                      placeholder="0,00"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-gray-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custo</label>
                    <input
                      type="text"
                      name="custoDisplay"
                      value={custoDisplay}
                      onChange={(e) => setCustoDisplay(formatCurrencyInput(e.target.value))}
                      inputMode="numeric"
                      placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-gray-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="ativo"
                      value="true"
                      defaultChecked={editingProduto?.ativo ?? true}
                      className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Ativo</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduto(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setProdutoToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Produto/Serviço"
        message="Tem certeza que deseja excluir este produto/serviço? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
      {/* Modal de Categorias */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categorias}
        onCreate={createCategoria}
        onUpdate={updateCategoria}
        onDelete={deleteCategoria}
      />
    </div >
  );
}
