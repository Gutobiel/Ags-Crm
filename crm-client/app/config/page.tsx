'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import Sidebar from '@/components/Sidebar';
import { getRoleLabel } from '@/lib/roles';
import { useBranding } from '@/contexts/BrandingContext';
import { useProfile } from '@/contexts/ProfileContext';
import BrandingSettings from './components/BrandingSettings';
import CropModal from './components/CropModal';
import AiSettings from './components/AiSettings';

type Tab = 'perfil' | 'marca' | 'ia';

export default function ConfigPage() {
  const { data: session, status } = useSession();
  const { fotoPerfil, setFotoPerfil, isLoading: profileLoading } = useProfile();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('perfil');
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { branding } = useBranding();

  const isAdmin = session?.user?.funcao === 'admin';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteProfilePic = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${session.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ fotoPerfil: null })
      });
      
      if (response.ok) {
        setFotoPerfil(null);
      }
    } catch (err) {
      console.error('Erro ao excluir foto de perfil', err);
    }
  };

  const handleCropComplete = async (croppedBase64: string) => {
    setCropImageSrc(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${session.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ fotoPerfil: croppedBase64 })
      });
      
      if (response.ok) {
        setFotoPerfil(croppedBase64);
      }
    } catch (err) {
      console.error('Erro ao atualizar foto de perfil', err);
    }
  };

  async function handlePasswordChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    // TODO: Implementar chamada API para trocar senha
    setLoading(false);
    setMessage('Funcionalidade em desenvolvimento');
  }

  const tabs = [
    { id: 'perfil' as Tab, label: 'Perfil', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    ...(isAdmin ? [{
      id: 'marca' as Tab, label: 'Marca / White Label', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    },
    {
      id: 'ia' as Tab, label: 'Inteligência Artificial', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-20">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 ml-12 lg:ml-0">Configurações</h1>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Abas */}
            <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Conteúdo da aba */}
            {activeTab === 'perfil' && (
              <div className="space-y-6">
                {/* Informações do Perfil */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: branding.primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Informações do Perfil
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Nome</label>
                      <p className="text-gray-900">{session.user.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Email</label>
                      <p className="text-gray-900">{session.user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">CPF</label>
                      <p className="text-gray-900">{session.user.cpf}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Função</label>
                      <p className="text-gray-900">{getRoleLabel(session.user.funcao)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <label className="block text-sm font-semibold text-gray-500 mb-3">Foto de Perfil</label>
                    <div 
                      className={`flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-dashed rounded-xl transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {profileLoading ? (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center animate-pulse border-4 border-white shadow-sm" />
                      ) : fotoPerfil ? (
                        <img src={fotoPerfil} alt="Perfil" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-3xl uppercase border-4 border-white shadow-sm">
                          {session.user.name?.substring(0, 2) || 'US'}
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                        <p className="text-sm text-gray-600 mb-4">
                          Arraste e solte uma imagem aqui, ou clique no botão abaixo.
                        </p>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-3">
                            <div>
                              <input type="file" accept="image/*" id="profilePicInput" className="hidden" onChange={handleProfilePicChange} />
                              <label 
                                htmlFor="profilePicInput" 
                                className="cursor-pointer inline-flex items-center justify-center h-[38px] px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                              >
                                Fazer Upload
                              </label>
                            </div>
                            {fotoPerfil && (
                              <button
                                onClick={handleDeleteProfilePic}
                                className="inline-flex items-center justify-center h-[38px] px-4 border border-red-200 text-red-600 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-red-50 transition-colors"
                              >
                                Excluir Foto
                              </button>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">Tamanho máximo permitido: 10MB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alterar Senha */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: branding.primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Alterar Senha
                  </h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                    {message && (
                      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm">
                        {message}
                      </div>
                    )}

                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Senha Atual
                      </label>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        required
                        className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition"
                        style={{ '--tw-ring-color': branding.primaryColor } as any}
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Nova Senha
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        minLength={6}
                        className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition"
                        style={{ '--tw-ring-color': branding.primaryColor } as any}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Nova Senha
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={6}
                        className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition"
                        style={{ '--tw-ring-color': branding.primaryColor } as any}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      {loading ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'marca' && isAdmin && (
              <BrandingSettings />
            )}

            {activeTab === 'ia' && isAdmin && (
              <AiSettings />
            )}
          </div>
        </main>
      </div>

      {cropImageSrc && (
        <CropModal 
          imageSrc={cropImageSrc} 
          onClose={() => setCropImageSrc(null)} 
          onCropComplete={handleCropComplete} 
        />
      )}
    </div>
  );
}
