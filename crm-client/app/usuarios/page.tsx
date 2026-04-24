'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useUsuarios, UserRole } from '@/hooks/useUsuarios';
import { useNotification } from '@/contexts/NotificationContext';
import ConfirmModal from '@/components/ConfirmModal';
import {
  HiPlus,
  HiTrash,
  HiSearch,
  HiX,
  HiUserCircle,
  HiMail,
} from 'react-icons/hi';

const roleLabels = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.GESTOR]: 'Gestor',
  [UserRole.FINANCEIRO]: 'Financeiro',
  [UserRole.FUNCIONARIO]: 'Funcionário',
  [UserRole.VENDEDOR]: 'Vendedor',
};

const roleColors = {
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
  [UserRole.GESTOR]: 'bg-blue-100 text-blue-800',
  [UserRole.FINANCEIRO]: 'bg-green-100 text-green-800',
  [UserRole.FUNCIONARIO]: 'bg-gray-100 text-gray-800',
  [UserRole.VENDEDOR]: 'bg-amber-100 text-amber-800',
};

export default function UsuariosPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { usuarios, loading, createUsuario, deleteUsuario, checkUserRelations, toggleUserStatus } = useUsuarios();
  const { success, error } = useNotification();
  
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInactivateModal, setShowInactivateModal] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<number | null>(null);
  const [userRelations, setUserRelations] = useState<string[]>([]);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, router]);

  async function handleSaveUsuario(formData: FormData) {
    const cpf = (formData.get('cpf') as string).replace(/[.\-\s]/g, '');
    const data = {
      nome: formData.get('nome') as string,
      cpf,
      funcao: formData.get('funcao') as UserRole,
      email: formData.get('email') as string,
    };

    const isSuccess = await createUsuario(data);

    if (isSuccess) {
      success('Usuário criado com sucesso!');
      setShowModal(false);
    } else {
      error('Erro ao criar usuário. Verifique se o e-mail ou CPF já está cadastrado.');
    }
  }

  async function handleDeleteUsuario(id: number) {
    setUsuarioToDelete(id);
    
    // Verificar se há relacionamentos
    const relations = await checkUserRelations(id);
    
    if (relations && relations.hasRelations) {
      setUserRelations(relations.relations);
      setShowInactivateModal(true);
    } else {
      setShowConfirmModal(true);
    }
  }

  async function confirmDelete() {
    if (usuarioToDelete === null) return;
    
    const isSuccess = await deleteUsuario(usuarioToDelete);
    
    setShowConfirmModal(false);
    setUsuarioToDelete(null);
    
    if (isSuccess) {
      success('Usuário excluído com sucesso!');
    } else {
      error('Não é possível excluir este usuário. Ele possui dados relacionados. Considere inativar ao invés de excluir.');
    }
  }

  async function handleInactivate() {
    if (usuarioToDelete === null) return;
    const isSuccess = await toggleUserStatus(usuarioToDelete);
    if (isSuccess) {
      success('Status do usuário alterado com sucesso!');
    } else {
      error('Erro ao alterar status do usuário.');
    }
    setShowInactivateModal(false);
    setUsuarioToDelete(null);
    setUserRelations([]);
  }

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session) return null;

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <Sidebar />

      <div className="flex-1 lg:ml-20 w-full max-w-full">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-3 sm:px-4 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
            <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 ml-12 lg:ml-0 truncate">Usuários</h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm text-sm whitespace-nowrap"
            >
              <HiPlus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline sm:inline">Novo</span>
            </button>
          </div>
        </header>

        <main className="p-3 sm:p-4 lg:p-6 xl:p-8">
          {/* Busca */}
          <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3 lg:p-4 mb-4 sm:mb-6">
            <div className="relative">
              <HiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
              />
            </div>
          </div>

          {/* Lista - Tabela no desktop, Cards no mobile */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">Usuário</th>
                    <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[120px]">CPF</th>
                    <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[110px]">Função</th>
                    <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[90px]">Status</th>
                    <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">E-mail</th>
                    <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell min-w-[120px]">Cadastrado em</th>
                    <th className="px-3 lg:px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20 sticky right-0 bg-gray-50">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4">
                        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                            <HiUserCircle className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-600" />
                          </div>
                          <span className="font-medium text-gray-900 text-sm lg:text-base truncate">{usuario.nome}</span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-700 hidden lg:table-cell">
                        {usuario.cpf}
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[usuario.funcao]} whitespace-nowrap`}>
                          {roleLabels[usuario.funcao]}
                        </span>
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 whitespace-nowrap hidden lg:table-cell">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          usuario.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 max-w-[200px] xl:max-w-none">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <HiMail className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="truncate">{usuario.email}</span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
                        {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white">
                        <button
                          onClick={() => handleDeleteUsuario(usuario.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded inline-flex"
                          disabled={usuario.id === (session?.user as any)?.id}
                          title="Excluir usuário"
                        >
                          <HiTrash className="h-4 w-4 lg:h-5 lg:w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsuarios.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <HiUserCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
                <p className="text-gray-500 text-base sm:text-lg font-medium">Nenhum usuário encontrado</p>
              </div>
            )}
          </div>

          {/* Cards para Mobile */}
          <div className="md:hidden space-y-2.5 sm:space-y-3">
            {filteredUsuarios.length === 0 ? (
              <div className="text-center py-10 sm:py-12 bg-white rounded-lg">
                <HiUserCircle className="h-14 w-14 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
                <p className="text-gray-500 text-base sm:text-lg font-medium">Nenhum usuário</p>
              </div>
            ) : (
              filteredUsuarios.map((usuario) => (
                <div key={usuario.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3.5 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-2.5 sm:gap-3 mb-3">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                      <HiUserCircle className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">{usuario.nome}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{usuario.cpf}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <HiMail className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="truncate text-xs sm:text-sm">{usuario.email}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[usuario.funcao]} whitespace-nowrap`}>
                          {roleLabels[usuario.funcao]}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          usuario.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  {usuario.id !== (session?.user as any)?.id && (
                    <button
                      onClick={() => handleDeleteUsuario(usuario.id)}
                      className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <HiTrash className="h-4 w-4" />
                      Excluir
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Modal Formulário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full my-4 sm:my-8 mx-auto">
            <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Novo Usuário</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <HiX className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveUsuario(new FormData(e.currentTarget));
              }}
              className="p-4 sm:p-5 lg:p-6 space-y-3.5 sm:space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome Completo*</label>
                <input
                  type="text"
                  name="nome"
                  required
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="Digite o nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CPF*</label>
                <input
                  type="text"
                  name="cpf"
                  required
                  maxLength={14}
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="000.000.000-00"
                />
                <p className="mt-1.5 text-xs text-gray-500">A senha inicial será o CPF (pode ser alterada depois)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Função*</label>
                <select
                  name="funcao"
                  required
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 text-sm"
                >
                  <option value="">Selecione a função</option>
                  <option value={UserRole.FUNCIONARIO}>{roleLabels[UserRole.FUNCIONARIO]}</option>
                  <option value={UserRole.FINANCEIRO}>{roleLabels[UserRole.FINANCEIRO]}</option>
                  <option value={UserRole.GESTOR}>{roleLabels[UserRole.GESTOR]}</option>
                  <option value={UserRole.VENDEDOR}>{roleLabels[UserRole.VENDEDOR]}</option>
                  <option value={UserRole.ADMIN}>{roleLabels[UserRole.ADMIN]}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail*</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button type="submit" className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setUsuarioToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Inactivate Modal */}
      {showInactivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Usuário com Relacionamentos</h2>
            </div>
            <div className="p-4 sm:p-5 lg:p-6">
              <p className="text-gray-700 mb-4">
                Este usuário possui dados relacionados no sistema{userRelations.length > 0 && ':'} 
              </p>
              {userRelations.length > 0 && (
                <ul className="list-disc list-inside mb-4 text-gray-600 space-y-1">
                  {userRelations.map((relation, index) => (
                    <li key={index}>{relation}</li>
                  ))}
                </ul>
              )}
              <p className="text-gray-700 mb-6">
                Recomendamos <strong>inativar</strong> ao invés de excluir para manter o histórico do sistema.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button
                  onClick={() => {
                    setShowInactivateModal(false);
                    setUsuarioToDelete(null);
                    setUserRelations([]);
                  }}
                  className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInactivate}
                  className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  Inativar Usuário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
