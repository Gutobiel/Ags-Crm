import { useEffect, useState } from 'react';
import { HiX } from 'react-icons/hi';
import { Empresa } from '@/hooks/useEmpresas';

interface CompanyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    editingEmpresa: Empresa | null;
}

export default function CompanyFormModal({ isOpen, onClose, onSave, editingEmpresa }: CompanyFormModalProps) {
    const [tipoPessoaForm, setTipoPessoaForm] = useState<'PF' | 'PJ'>('PJ');
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [responsavelNome, setResponsavelNome] = useState('');

    // Reset/Populate form when modal opens or editingEmpresa changes
    useEffect(() => {
        if (isOpen) {
            if (editingEmpresa) {
                const tipo = editingEmpresa.cnpj.replace(/\D/g, '').length === 11 ? 'PF' : 'PJ';
                setTipoPessoaForm(tipo);
                setCpfCnpj(editingEmpresa.cnpj);
                setResponsavelNome(editingEmpresa.responsavel || editingEmpresa.nome);
            } else {
                setTipoPessoaForm('PJ');
                setCpfCnpj('');
                setResponsavelNome('');
            }
        }
    }, [isOpen, editingEmpresa]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const tipoPessoa = formData.get('tipoPessoa') as string;

        const data = {
            nome: tipoPessoa === 'PF' ? responsavelNome : (formData.get('nome') as string) || responsavelNome,
            cnpj: cpfCnpj,
            responsavel: tipoPessoa === 'PJ' ? responsavelNome : undefined,
            email: formData.get('email') as string || undefined,
            telefone: formData.get('telefone') as string || undefined,
            cep: formData.get('cep') as string || undefined,
            endereco: formData.get('endereco') as string || undefined,
            numero: formData.get('numero') as string || undefined,
            complemento: formData.get('complemento') as string || undefined,
            bairro: formData.get('bairro') as string || undefined,
            cidade: formData.get('cidade') as string || undefined,
            estado: formData.get('estado') as string || undefined,
            observacoes: formData.get('observacoes') as string || undefined,
        };

        await onSave(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {editingEmpresa ? 'Editar' : 'Novo'} Cliente
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <HiX className="h-6 w-6" />
                    </button>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pessoa *</label>
                            <select
                                name="tipoPessoa"
                                value={tipoPessoaForm}
                                onChange={(e) => setTipoPessoaForm(e.target.value as 'PF' | 'PJ')}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900"
                            >
                                <option value="PJ">Pessoa Jurídica (PJ)</option>
                                <option value="PF">Pessoa Física (PF)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{tipoPessoaForm === 'PF' ? 'CPF' : 'CNPJ'} *</label>
                            <input
                                type="text"
                                name="cpfCnpj"
                                value={cpfCnpj}
                                onChange={(e) => setCpfCnpj(e.target.value)}
                                required
                                maxLength={tipoPessoaForm === 'PF' ? 14 : 18}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                                placeholder={tipoPessoaForm === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{tipoPessoaForm === 'PF' ? 'Nome Completo' : 'Responsável'} *</label>
                            <input
                                type="text"
                                name="responsavel"
                                value={responsavelNome}
                                onChange={(e) => setResponsavelNome(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                                placeholder={tipoPessoaForm === 'PF' ? 'Digite seu nome completo' : 'Nome do responsável'}
                            />
                        </div>
                        {tipoPessoaForm === 'PJ' && (
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
                                <input
                                    type="text"
                                    name="nome"
                                    defaultValue={editingEmpresa?.nome}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                                    placeholder="Digite a razão social da empresa"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                defaultValue={editingEmpresa?.email}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                                placeholder="email@empresa.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                            <input
                                type="text"
                                name="telefone"
                                defaultValue={editingEmpresa?.telefone}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Endereço</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                                <input
                                    type="text"
                                    name="cep"
                                    defaultValue={editingEmpresa?.cep}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                                    placeholder="00000-000"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                                <input
                                    type="text"
                                    name="endereco"
                                    defaultValue={editingEmpresa?.endereco}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                                    placeholder="Rua, Avenida, etc"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                                <input
                                    type="text"
                                    name="numero"
                                    defaultValue={editingEmpresa?.numero}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                                    placeholder="123"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                                <input
                                    type="text"
                                    name="complemento"
                                    defaultValue={editingEmpresa?.complemento}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                                    placeholder="Sala, Andar, etc"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                                <input
                                    type="text"
                                    name="bairro"
                                    defaultValue={editingEmpresa?.bairro}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                                    placeholder="Centro"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                                <input
                                    type="text"
                                    name="cidade"
                                    defaultValue={editingEmpresa?.cidade}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                                    placeholder="São Paulo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <input
                                    type="text"
                                    name="estado"
                                    defaultValue={editingEmpresa?.estado}
                                    maxLength={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                                    placeholder="SP"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                        <textarea
                            name="observacoes"
                            defaultValue={editingEmpresa?.observacoes}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                            placeholder="Informações adicionais sobre a empresa"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
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
    );
}
