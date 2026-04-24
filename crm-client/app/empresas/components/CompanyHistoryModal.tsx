import { useEffect, useState } from 'react';
import { HiX, HiDocumentText, HiCube, HiCheck, HiClock, HiExclamation, HiFolder, HiDownload } from 'react-icons/hi';
import { useOrcamentos, Orcamento, StatusOrcamento, StatusPagamento } from '@/hooks/useOrcamentos';
import { useDocumentos, TipoDocumento } from '@/hooks/useDocumentos';
import { Empresa } from '@/hooks/useEmpresas';

interface CompanyHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    empresa: Empresa | null;
}

export default function CompanyHistoryModal({ isOpen, onClose, empresa }: CompanyHistoryModalProps) {
    const { orcamentos, loading, fetchOrcamentos } = useOrcamentos();
    const { documentos, loading: loadingDocumentos, downloadDocumento } = useDocumentos();
    const [activeTab, setActiveTab] = useState<'orcamentos' | 'ativos' | 'documentos'>('orcamentos');

    useEffect(() => {
        if (isOpen && empresa) {
            fetchOrcamentos();
        }
    }, [isOpen, empresa]);

    const tipoDocumentoLabels = {
        [TipoDocumento.CONTRATO]: { label: 'Contrato', color: 'bg-blue-100 text-blue-800' },
        [TipoDocumento.NOTA_FISCAL]: { label: 'Nota Fiscal', color: 'bg-green-100 text-green-800' },
        [TipoDocumento.COMPROVANTE]: { label: 'Comprovante', color: 'bg-purple-100 text-purple-800' },
        [TipoDocumento.OUTROS]: { label: 'Outros', color: 'bg-gray-100 text-gray-800' },
    };

    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    if (!isOpen || !empresa) return null;

    const companyOrcamentos = orcamentos.filter(o => o.empresa?.id === empresa.id);
    const companyDocumentos = documentos.filter(d => d.empresa?.id === empresa.id);

    // Group budgets by status
    const orcamentosByStatus = companyOrcamentos.reduce((acc, orcamento) => {
        const status = orcamento.status;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(orcamento);
        return acc;
    }, {} as Record<string, Orcamento[]>);

    // Deriving "Ativos" as items from Approved budgets (Interpretation of "Ativos")
    // Or simply lists of budgets that are "Active" (Enviado, Aprovado) vs others.
    // Given "separado por status", it implies listing the entities by their status.

    // Let's create a view that lists items from Approved budgets as "Ativos" if users treat them as client assets.
    const ativos = companyOrcamentos
        .filter(o => o.status === StatusOrcamento.APROVADO)
        .flatMap(o => o.itens.map(item => ({ ...item, dataAquisicao: o.updatedAt, orcamentoNumero: o.numero, statusPagamento: o.statusPagamento })));

    // Group documents by type
    const documentosByTipo = companyDocumentos.reduce((acc, documento) => {
        const tipo = documento.tipo;
        if (!acc[tipo]) {
            acc[tipo] = [];
        }
        acc[tipo].push(documento);
        return acc;
    }, {} as Record<string, typeof companyDocumentos>);

    const getStatusColor = (status: StatusOrcamento) => {
        switch (status) {
            case StatusOrcamento.APROVADO: return 'bg-green-100 text-green-800 border-green-200';
            case StatusOrcamento.ENVIADO: return 'bg-blue-100 text-blue-800 border-blue-200';
            case StatusOrcamento.RASCUNHO: return 'bg-gray-100 text-gray-800 border-gray-200';
            case StatusOrcamento.REJEITADO: return 'bg-red-100 text-red-800 border-red-200';
            case StatusOrcamento.EXPIRADO: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: StatusPagamento) => {
        switch (status) {
            case StatusPagamento.PAGO: return 'bg-green-100 text-green-800';
            case StatusPagamento.PENDENTE: return 'bg-yellow-100 text-yellow-800';
            case StatusPagamento.PARCIAL: return 'bg-blue-100 text-blue-800';
            case StatusPagamento.ATRASADO: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Histórico - {empresa.nome}</h2>
                        <p className="text-sm text-gray-500">{empresa.cnpj}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <HiX className="h-6 w-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6">
                    <button
                        onClick={() => setActiveTab('orcamentos')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'orcamentos'
                            ? 'border-emerald-600 text-emerald-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <HiDocumentText className="h-5 w-5" />
                        Orçamentos
                    </button>
                    <button
                        onClick={() => setActiveTab('ativos')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ativos'
                            ? 'border-emerald-600 text-emerald-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <HiCube className="h-5 w-5" />
                        Ativos (Itens Aprovados)
                    </button>

                    <button
                        onClick={() => setActiveTab('documentos')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'documentos'
                            ? 'border-emerald-600 text-emerald-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}>
                        <HiFolder className="h-5 w-5" />
                        Documentos
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'orcamentos' && (
                                <div className="space-y-6">
                                    {Object.keys(orcamentosByStatus).length === 0 && (
                                        <div className="text-center py-10 text-gray-500">
                                            Nenhum orçamento encontrado.
                                        </div>
                                    )}
                                    {Object.entries(orcamentosByStatus).map(([status, items]) => (
                                        <div key={status} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                                            <div className={`px-4 py-2 font-sem text-sm border-b uppercase text-gray-900 ${getStatusColor(status as StatusOrcamento).split(' ')[0]}`}>
                                                {status} ({items.length})
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                                {items.map((orcamento) => (
                                                    <div key={orcamento.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-medium text-gray-900">#{orcamento.numero}</h4>
                                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(orcamento.status)}`}>
                                                                        {orcamento.status}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-gray-500">Emissão: {new Date(orcamento.dataEmissao).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="block font-bold text-gray-900">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.valorTotal)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            <p className="line-clamp-1">{orcamento.itens.map((i: any) => i.nome).join(', ')}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'ativos' && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                    {ativos.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            Nenhum ativo (item de orçamento aprovado) encontrado.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor total</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">

                                                    {ativos.map((item, idx) => (
                                                        <tr key={`${item.produtoId}-${idx}`}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">{item.nome}</div>
                                                                <div className="text-sm text-gray-500">{item.descricao}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                    Orç. #{item.orcamentoNumero}
                                                                </span>
                                                                <div className="text-xs text-gray-400 mt-1">{new Date(item.dataAquisicao).toLocaleDateString()}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {item.quantidade} {item.unidade}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(item.statusPagamento)}`}>
                                                                    {item.statusPagamento}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'documentos' && (
                                <div className="space-y-6">
                                    {Object.keys(documentosByTipo).length === 0 && (
                                        <div className="text-center py-10 text-gray-500">
                                            Nenhum documento encontrado.
                                        </div>
                                    )}
                                    {Object.entries(documentosByTipo).map(([tipo, docs]) => (
                                        <div key={tipo} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                                            <div className={`px-4 py-2 font-semibold text-sm border-b uppercase ${tipoDocumentoLabels[tipo as TipoDocumento]?.color || 'bg-gray-100 text-gray-800'}`}>
                                                {tipoDocumentoLabels[tipo as TipoDocumento]?.label || tipo} ({docs.length})
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {docs.map((doc) => (
                                                            <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                                    <div className="flex items-center gap-2">
                                                                        <HiDocumentText className="h-5 w-5 text-gray-400 shrink-0" />
                                                                        <span className="truncate max-w-xs">{doc.nome}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tipoDocumentoLabels[doc.tipo].color}`}>
                                                                        {tipoDocumentoLabels[doc.tipo].label}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.empresa.nome}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(doc.tamanho)}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    <button
                                                                        onClick={() => downloadDocumento(doc.id)}
                                                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                                                        title="Download"
                                                                    >
                                                                        <HiDownload className="h-5 w-5" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
