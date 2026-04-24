'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useDocumentos, TipoDocumento } from '@/hooks/useDocumentos';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useNotification } from '@/contexts/NotificationContext';
import ConfirmModal from '@/components/ConfirmModal';
import { HiPlus, HiTrash, HiDownload, HiDocumentText, HiX, HiSearch } from 'react-icons/hi';

const tipoDocumentoLabels = {
  [TipoDocumento.CONTRATO]: { label: 'Contrato', color: 'bg-blue-100 text-blue-800' },
  [TipoDocumento.NOTA_FISCAL]: { label: 'Nota Fiscal', color: 'bg-green-100 text-green-800' },
  [TipoDocumento.COMPROVANTE]: { label: 'Comprovante', color: 'bg-purple-100 text-purple-800' },
  [TipoDocumento.OUTROS]: { label: 'Outros', color: 'bg-gray-100 text-gray-800' },
};

export default function DocumentosPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { documentos, loading, uploadDocumento, deleteDocumento, downloadDocumento } = useDocumentos();
  const { empresas } = useEmpresas();
  const { success, error, warning } = useNotification();
  
  const [showModal, setShowModal] = useState(false);
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [documentoToDelete, setDocumentoToDelete] = useState<{id: number, nome: string} | null>(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, router]);

  async function handleUpload(formData: FormData) {
    if (!selectedFile) {
      warning('Selecione um arquivo');
      return;
    }

    const empresaId = parseInt(formData.get('empresaId') as string);
    const tipo = formData.get('tipo') as TipoDocumento;
    const observacoes = formData.get('observacoes') as string;

    setUploading(true);
    const isSuccess = await uploadDocumento(selectedFile, tipo, empresaId, observacoes || undefined);
    setUploading(false);

    if (isSuccess) {
      success('Documento enviado com sucesso!');
      setShowModal(false);
      setSelectedFile(null);
    } else {
      error('Erro ao fazer upload do documento');
    }
  }

  async function handleDelete(id: number, nome: string) {
    setDocumentoToDelete({ id, nome });
    setShowConfirmModal(true);
  }

  async function confirmDelete() {
    if (!documentoToDelete) return;
    const isSuccess = await deleteDocumento(documentoToDelete.id);
    if (isSuccess) {
      success('Documento excluído com sucesso!');
    } else {
      error('Erro ao excluir documento.');
    }
    setDocumentoToDelete(null);
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session) return null;

  const filteredDocumentos = documentos.filter((doc) => {
    const matchesTipo = filterTipo === 'all' || doc.tipo === filterTipo;
    const matchesSearch =
      doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.empresa.nome.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTipo && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 lg:ml-20">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 ml-12 lg:ml-0">Documentos</h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
            >
              <HiPlus className="h-5 w-5" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {Object.entries(tipoDocumentoLabels).map(([tipo, { label }]) => {
              const count = documentos.filter((d) => d.tipo === tipo).length;
              return (
                <div key={tipo} className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">{label}</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{count}</p>
                    </div>
                    <HiDocumentText className="h-8 sm:h-10 w-8 sm:w-10 text-gray-300" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
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
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-400 text-sm"
            >
              <option value="all">Todos</option>
              {Object.entries(tipoDocumentoLabels).map(([key, { label }]) => (
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
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamanho</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocumentos.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <HiDocumentText className="h-5 w-5 text-gray-400 shrink-0" />
                        {doc.nome}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tipoDocumentoLabels[doc.tipo].color}`}>
                        {tipoDocumentoLabels[doc.tipo].label}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.empresa.nome}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(doc.tamanho)}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                      <button
                        onClick={() => downloadDocumento(doc.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Download"
                      >
                        <HiDownload className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.nome)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <HiTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDocumentos.length === 0 && (
              <div className="text-center py-12">
                <HiDocumentText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">Nenhum documento encontrado</p>
              </div>
            )}
          </div>

          {/* Cards para Mobile */}
          <div className="md:hidden space-y-3">
            {filteredDocumentos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <HiDocumentText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">Nenhum documento</p>
              </div>
            ) : (
              filteredDocumentos.map((doc) => (
                <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <HiDocumentText className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">{doc.nome}</p>
                        <p className="text-xs text-gray-600">{doc.empresa.nome}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tipoDocumentoLabels[doc.tipo].color}`}>
                      {tipoDocumentoLabels[doc.tipo].label}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {formatFileSize(doc.tamanho)}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadDocumento(doc.id)}
                      className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 py-2 rounded text-sm"
                    >
                      <HiDownload className="h-4 w-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id, doc.nome)}
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

      {/* Modal Upload */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full my-4 sm:my-8">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Enviar Documento</h2>
              <button onClick={() => { setShowModal(false); setSelectedFile(null); }} className="text-gray-400 hover:text-gray-600">
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpload(new FormData(e.currentTarget));
              }}
              className="p-4 sm:p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <p className="mt-1 text-xs text-gray-500">PDF, DOC, XLS, Imagens (max 10MB)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  name="tipo"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 placeholder-gray-400 text-gray-400 text-sm"
                >
                  {Object.entries(tipoDocumentoLabels).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
                <select
                  name="empresaId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 placeholder-gray-400 text-gray-400 text-sm"
                >
                  <option value="">Selecione...</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  name="observacoes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 placeholder-gray-400 text-sm"
                  placeholder="Informações adicionais..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setSelectedFile(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400"
                  disabled={uploading}
                >
                  {uploading ? 'Enviando...' : 'Enviar'}
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
          setDocumentoToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Documento"
        message={`Tem certeza que deseja excluir "${documentoToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
