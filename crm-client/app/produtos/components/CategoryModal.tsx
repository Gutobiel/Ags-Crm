import { useState } from 'react';
import { HiX, HiPlus, HiTrash } from 'react-icons/hi';
import { Categoria } from '@/hooks/useProdutos';
import ConfirmModal from '@/components/ConfirmModal';
import Switch from '@mui/material/Switch';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Categoria[];
    onCreate: (nome: string) => Promise<boolean>;
    onUpdate: (id: number, data: Partial<Categoria>) => Promise<boolean>;
    onDelete: (id: number) => Promise<boolean>;
}

export default function CategoryModal({ isOpen, onClose, categories, onCreate, onUpdate, onDelete }: CategoryModalProps) {
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleAddCategory(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = newCategory.trim();
        if (!trimmed) return;

        if (categories.some(c => c.nome.toLowerCase() === trimmed.toLowerCase())) {
            alert('Esta categoria já existe!');
            return;
        }

        setLoading(true);
        const success = await onCreate(trimmed);
        if (success) {
            setNewCategory('');
        }
        setLoading(false);
    }

    async function handleToggleStatus(id: number, currentStatus: boolean) {
        await onUpdate(id, { ativo: !currentStatus });
    }

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full my-8 flex flex-col max-h-[80vh]">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Gerenciar Categorias</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <HiX className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        <form onSubmit={handleAddCategory} className="mb-6 flex gap-2">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Nova categoria..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={!newCategory.trim() || loading}
                                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <HiPlus className="h-5 w-5" />
                            </button>
                        </form>

                        <div className="space-y-2">
                            {categories.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">Nenhuma categoria cadastrada.</p>
                            ) : (
                                categories.map((category: Categoria) => (
                                    <div key={category.id} className={`flex items-center justify-between p-3 rounded-lg group ${category.ativo ? 'bg-gray-50' : 'bg-gray-100'
                                        }`}>
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className={`font-medium ${category.ativo ? 'text-gray-900' : 'text-gray-500 line-through'
                                                }`}>
                                                {category.nome}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${category.ativo
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {category.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={category.ativo}
                                                onChange={() => handleToggleStatus(category.id, category.ativo)}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                        color: '#3b82f6',
                                                    },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                        backgroundColor: '#3b82f6',
                                                    },
                                                }}
                                                title={category.ativo ? 'Desativar categoria' : 'Ativar categoria'}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
