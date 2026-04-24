'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useUsuarios, UserRole } from '@/hooks/useUsuarios';
import { useNotification } from '@/contexts/NotificationContext';
import ConfirmModal from '@/components/ConfirmModal';
import { HiPlus, HiTrash, HiSearch, HiX, HiUserCircle, HiMail } from 'react-icons/hi';

export default function VendedoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { usuarios, loading, createUsuario, deleteUsuario } = useUsuarios();
  const { success, error } = useNotification();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [vendedorToDelete, setVendedorToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const vendedores = usuarios.filter((usuario) => usuario.funcao === UserRole.VENDEDOR);
  const filtered = vendedores.filter((v) =>
    v.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleSaveVendedor(formData: FormData) {
    const cpf = (formData.get('cpf') as string).replace(/[.\-\s]/g, '');
    const data = {
      nome: formData.get('nome') as string,
      cpf,
      funcao: UserRole.VENDEDOR,
      email: formData.get('email') as string,
    };

    const isSuccess = await createUsuario(data);

    if (isSuccess) {
      success('Vendedor criado com sucesso!');
      setShowModal(false);
    } else {
      error('Erro ao criar vendedor. Verifique se o e-mail ou CPF já está cadastrado.');
    }
  }

  async function handleDeleteVendedor(id: number) {
    setVendedorToDelete(id);
    setShowConfirmModal(true);
  }

  async function confirmDelete() {
    if (vendedorToDelete === null) return;
    const isSuccess = await deleteUsuario(vendedorToDelete);
    if (isSuccess) {
      success('Vendedor excluído com sucesso!');
    } else {
      error('Erro ao excluir vendedor.');
    }
    setVendedorToDelete(null);
  }

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
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 ml-12 lg:ml-0">Vendedores</h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
            >
              <HiPlus className="h-5 w-5" />
              <span className="hidden sm:inline">Novo Vendedor</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Busca */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-6">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar vendedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadastrado em</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((vend) => (
                  <tr key={vend.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                          <HiUserCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                        <span className="font-medium text-gray-900">{vend.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{vend.cpf}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{vend.email}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vend.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteVendedor(vend.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={vend.id === (session?.user as any)?.id}
                      >
                        <HiTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-10">
                <HiUserCircle className="h-14 w-14 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">Nenhum vendedor encontrado</p>
                <p className="text-sm text-gray-500">Use "Novo Vendedor" para cadastrar</p>
              </div>
            )}
          </div>

          {/* Cards mobile */}
          <div className="md:hidden space-y-3 mt-4">
            {filtered.map((vend) => (
              <div key={vend.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <HiUserCircle className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{vend.nome}</p>
                    <p className="text-xs text-gray-600">{vend.cpf}</p>
                    <p className="text-xs text-gray-600 truncate">{vend.email}</p>
                  </div>
                </div>
                {vend.id !== (session?.user as any)?.id && (
                  <button
                    onClick={() => handleDeleteVendedor(vend.id)}
                    className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded text-sm"
                  >
                    <HiTrash className="h-4 w-4" />
                    Excluir
                  </button>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full my-4 sm:my-8">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Novo Vendedor</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <HiX className="h-6 w-6" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveVendedor(new FormData(e.currentTarget));
              }}
              className="p-4 sm:p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo*</label>
                <input
                  type="text"
                  name="nome"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF*</label>
                <input
                  type="text"
                  name="cpf"
                  required
                  maxLength={14}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail*</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="email@exemplo.com"
                />
              </div>
              <p className="text-xs text-gray-500">Senha inicial será o CPF (pode ser alterada depois).</p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  Criar Vendedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setVendedorToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Vendedor"
        message="Tem certeza que deseja excluir este vendedor? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
