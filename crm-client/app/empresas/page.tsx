'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useNotification } from '@/contexts/NotificationContext';
import ConfirmModal from '@/components/ConfirmModal';
import CompanyHistoryModal from './components/CompanyHistoryModal';
import CompanyFormModal from './components/CompanyFormModal';
import { RiFilePaper2Fill } from "react-icons/ri";
import { VscHistory } from "react-icons/vsc";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiSearch,
  HiX,
  HiUser,
  HiMail,
  HiPhone,
  HiDocument,
} from 'react-icons/hi';

export default function ClientesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { empresas, loading, createEmpresa, updateEmpresa, deleteEmpresa } = useEmpresas();
  const { success, error } = useNotification();

  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<any>(null);
  const [historyEmpresa, setHistoryEmpresa] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, router]);

  async function handleSaveEmpresa(data: any) {
    const isSuccess = editingEmpresa
      ? await updateEmpresa(editingEmpresa.id, data)
      : await createEmpresa(data);

    if (isSuccess) {
      success(editingEmpresa ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');
      setShowModal(false);
      setEditingEmpresa(null);
    } else {
      error('Erro ao salvar cliente. Tente novamente.');
    }
  }

  async function handleDeleteEmpresa(id: number) {
    setEmpresaToDelete(id);
    setShowConfirmModal(true);
  }

  async function confirmDelete() {
    if (empresaToDelete === null) return;
    const isSuccess = await deleteEmpresa(empresaToDelete);
    if (isSuccess) {
      success('Empresa excluída com sucesso!');
    } else {
      error('Erro ao excluir empresa.');
    }
    setEmpresaToDelete(null);
  }

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session) return null;

  const filteredEmpresas = empresas.filter((empresa) =>
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cnpj.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 lg:ml-20">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 ml-12 lg:ml-0">Clientes</h1>
            <button
              onClick={() => {
                setEditingEmpresa(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
            >
              <HiPlus className="h-5 w-5" />
              Novo Cliente
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Busca */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou CPF/CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmpresas.map((empresa) => {
              const tipoPessoa = empresa.cnpj.replace(/\D/g, '').length === 11 ? 'PF' : 'PJ';
              return (
                <div key={empresa.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <HiUser className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{empresa.nome}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipoPessoa === 'PF' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                            {tipoPessoa}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{empresa.cnpj}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setHistoryEmpresa(empresa);
                          setShowHistoryModal(true);
                        }}

                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <RiFilePaper2Fill className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingEmpresa(empresa);
                          setShowModal(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        <HiPencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmpresa(empresa.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <HiTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {empresa.responsavel && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Responsável:</span> {empresa.responsavel}
                      </p>
                    )}
                    {empresa.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <HiMail className="h-4 w-4 text-gray-400" />
                        {empresa.email}
                      </div>
                    )}
                    {empresa.telefone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <HiPhone className="h-4 w-4 text-gray-400" />
                        {empresa.telefone}
                      </div>
                    )}
                    {empresa.cidade && empresa.estado && (
                      <p className="text-sm text-gray-600">
                        {empresa.cidade} - {empresa.estado}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEmpresas.length === 0 && (
            <div className="text-center py-12">
              <HiUser className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhum cliente encontrado</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal Formulário */}
      <CompanyFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEmpresa(null);
        }}
        onSave={handleSaveEmpresa}
        editingEmpresa={editingEmpresa}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setEmpresaToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
      {/* Show History Modal */}
      <CompanyHistoryModal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setHistoryEmpresa(null);
        }}
        empresa={historyEmpresa}
      />
    </div>
  );
}