'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useBranding, BrandingConfig } from '@/contexts/BrandingContext';
import Image from 'next/image';
import { HiUpload, HiColorSwatch, HiPhotograph, HiPencil, HiCheck, HiX, HiTrash } from 'react-icons/hi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Paletas de cores pré-definidas para facilitar a escolha
const colorPresets = [
  { name: 'Esmeralda', primary: '#059669', dark: '#047857', light: '#10b981', bg: '#d1fae5' },
  { name: 'Azul', primary: '#2563eb', dark: '#1d4ed8', light: '#3b82f6', bg: '#dbeafe' },
  { name: 'Violeta', primary: '#7c3aed', dark: '#6d28d9', light: '#8b5cf6', bg: '#ede9fe' },
  { name: 'Rosa', primary: '#db2777', dark: '#be185d', light: '#ec4899', bg: '#fce7f3' },
  { name: 'Laranja', primary: '#ea580c', dark: '#c2410c', light: '#f97316', bg: '#ffedd5' },
  { name: 'Vermelho', primary: '#dc2626', dark: '#b91c1c', light: '#ef4444', bg: '#fee2e2' },
  { name: 'Ciano', primary: '#0891b2', dark: '#0e7490', light: '#06b6d4', bg: '#cffafe' },
  { name: 'Índigo', primary: '#4f46e5', dark: '#4338ca', light: '#6366f1', bg: '#e0e7ff' },
];

const sidebarPresets = [
  { name: 'Slate Escuro', from: '#1e293b', to: '#0f172a' },
  { name: 'Cinza', from: '#374151', to: '#1f2937' },
  { name: 'Zinc', from: '#3f3f46', to: '#27272a' },
  { name: 'Azul Escuro', from: '#1e3a5f', to: '#0f1d32' },
  { name: 'Verde Escuro', from: '#14532d', to: '#052e16' },
  { name: 'Roxo Escuro', from: '#3b0764', to: '#1e0338' },
];

export default function BrandingSettings() {
  const { data: session } = useSession();
  const { branding, refreshBranding, getLogoUrl } = useBranding();
  
  const [form, setForm] = useState<Partial<BrandingConfig>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingLoginImage, setUploadingLoginImage] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  // Verificar se é admin
  const isAdmin = session?.user?.funcao === 'admin';

  useEffect(() => {
    if (branding) {
      setForm({
        appName: branding.appName,
        appDescription: branding.appDescription,
        welcomeMessage: branding.welcomeMessage,
        primaryColor: branding.primaryColor,
        primaryDark: branding.primaryDark,
        primaryLight: branding.primaryLight,
        primaryBg: branding.primaryBg,
        sidebarFrom: branding.sidebarFrom,
        sidebarTo: branding.sidebarTo,
        loginImageBlur: branding.loginImageBlur,
      });
    }
  }, [branding]);

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <p className="text-gray-500 text-sm">Apenas administradores podem alterar as configurações de marca.</p>
      </div>
    );
  }

  async function getToken() {
    const res = await fetch('/api/auth/session');
    const session = await res.json();
    return session?.accessToken;
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/branding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await refreshBranding();
        setMessage('Marca atualizada com sucesso!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('Erro ao salvar configurações');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewLogo(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploadingLogo(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/branding/logo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        await refreshBranding();
        setMessage('Logo atualizado!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError('Erro ao fazer upload do logo');
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/branding/favicon`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        await refreshBranding();
        setMessage('Favicon atualizado!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError('Erro ao fazer upload do favicon');
    } finally {
      setUploadingFavicon(false);
    }
  }

  function applyColorPreset(preset: typeof colorPresets[0]) {
    setForm(prev => ({
      ...prev,
      primaryColor: preset.primary,
      primaryDark: preset.dark,
      primaryLight: preset.light,
      primaryBg: preset.bg,
    }));
  }

  function applySidebarPreset(preset: typeof sidebarPresets[0]) {
    setForm(prev => ({
      ...prev,
      sidebarFrom: preset.from,
      sidebarTo: preset.to,
    }));
  }

  // Imagens de login
  function getLoginImagesList(): string[] {
    if (branding.loginImages) {
      try {
        return JSON.parse(branding.loginImages);
      } catch {
        return [];
      }
    }
    return [];
  }

  async function handleLoginImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentImages = getLoginImagesList();
    if (currentImages.length >= 3) {
      setError('Limite máximo de 3 imagens atingido. Remova uma antes de adicionar.');
      return;
    }

    setUploadingLoginImage(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/branding/login-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        await refreshBranding();
        setMessage('Imagem de fundo adicionada!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setError(data.message || 'Erro ao fazer upload');
      }
    } catch (err) {
      setError('Erro ao fazer upload da imagem');
    } finally {
      setUploadingLoginImage(false);
      // Limpar input
      e.target.value = '';
    }
  }

  async function handleDeleteLoginImage(filename: string) {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/branding/login-image/${filename}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await refreshBranding();
        setMessage('Imagem removida!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError('Erro ao remover imagem');
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Mensagens */}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm flex items-center gap-2">
          <HiCheck className="h-5 w-5" />
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm flex items-center gap-2">
          <HiX className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Identidade Visual */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <HiPencil className="h-6 w-6" style={{ color: branding.primaryColor }} />
          Identidade da Marca
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Sistema</label>
            <input
              type="text"
              value={form.appName || ''}
              onChange={e => setForm(prev => ({ ...prev, appName: e.target.value }))}
              className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition"
              style={{ '--tw-ring-color': branding.primaryColor } as any}
              placeholder="Nome do sistema"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Boas-vindas</label>
            <input
              type="text"
              value={form.welcomeMessage || ''}
              onChange={e => setForm(prev => ({ ...prev, welcomeMessage: e.target.value }))}
              className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition"
              placeholder="Bem-vindo ao Sistema"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              value={form.appDescription || ''}
              onChange={e => setForm(prev => ({ ...prev, appDescription: e.target.value }))}
              className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition"
              placeholder="Sistema de Gerenciamento"
            />
          </div>
        </div>
      </div>

      {/* Logo e Favicon */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <HiPhotograph className="h-6 w-6" style={{ color: branding.primaryColor }} />
          Logo e Favicon
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Logo Principal</label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                {previewLogo ? (
                  <img src={previewLogo} alt="Preview" className="max-w-full max-h-full object-contain" />
                ) : branding.logoPath ? (
                  <img src={getLogoUrl()} alt="Logo atual" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-gray-400 text-xs text-center">Sem logo</span>
                )}
              </div>
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                  <HiUpload className="h-4 w-4" />
                  {uploadingLogo ? 'Enviando...' : 'Enviar Logo'}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploadingLogo}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">Recomendado: PNG transparente, 300x100px</p>
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Favicon</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                {branding.faviconPath ? (
                  <img src={`${API_URL}/branding/file/${branding.faviconPath}`} alt="Favicon" className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-gray-400 text-xs">ICO</span>
                )}
              </div>
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                  <HiUpload className="h-4 w-4" />
                  {uploadingFavicon ? 'Enviando...' : 'Enviar Favicon'}
                </div>
                <input
                  type="file"
                  accept="image/*,.ico"
                  onChange={handleFaviconUpload}
                  className="hidden"
                  disabled={uploadingFavicon}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">Recomendado: ICO ou PNG 32x32px</p>
          </div>
        </div>
      </div>

      {/* Imagens de Fundo do Login */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <HiPhotograph className="h-6 w-6" style={{ color: branding.primaryColor }} />
          Imagens de Fundo — Tela de Login
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Adicione até <strong>3 imagens</strong> que serão exibidas aleatoriamente na tela de login.
          Sem imagens cadastradas, as padrões do sistema serão usadas.
        </p>

        {/* Imagens atuais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {getLoginImagesList().map((filename, index) => (
            <div key={filename} className="relative group">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                {filename.match(/\.(mp4|webm)$/i) ? (
                  <video
                    src={`${API_URL}/branding/file/${filename}`}
                    className="w-full h-full object-cover"
                    autoPlay loop muted playsInline
                  />
                ) : (
                  <img
                    src={`${API_URL}/branding/file/${filename}`}
                    alt={`Imagem de fundo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDeleteLoginImage(filename)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remover imagem"
              >
                <HiTrash className="h-4 w-4" />
              </button>
              <p className="text-xs text-gray-400 mt-1 text-center">Imagem {index + 1}</p>
            </div>
          ))}

          {/* Slot vazio para upload */}
          {getLoginImagesList().length < 3 && (
            <label className="cursor-pointer">
              <div className="aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 hover:border-gray-400 transition">
                {uploadingLoginImage ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <span className="text-xs text-gray-400">Enviando...</span>
                  </>
                ) : (
                  <>
                    <HiUpload className="h-8 w-8 text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">Adicionar imagem</span>
                    <span className="text-xs text-gray-400">{getLoginImagesList().length}/3</span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={handleLoginImageUpload}
                className="hidden"
                disabled={uploadingLoginImage}
              />
            </label>
          )}
        </div>

        {getLoginImagesList().length === 0 && (
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Nenhuma imagem personalizada cadastrada.</p>
            <p className="text-xs text-gray-400 mt-1">As imagens padrão do sistema serão utilizadas na tela de login.</p>
          </div>
        )}

        {/* Toggle Blur */}
        <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-700">Desfocar imagem de fundo</p>
            <p className="text-xs text-gray-500">Aplica um efeito de desfoque suave sobre a imagem de fundo</p>
          </div>
          <button
            type="button"
            onClick={() => setForm(prev => ({ ...prev, loginImageBlur: !prev.loginImageBlur }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.loginImageBlur ? '' : 'bg-gray-300'
            }`}
            style={form.loginImageBlur ? { backgroundColor: branding.primaryColor } : undefined}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.loginImageBlur ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Cores do Tema */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <HiColorSwatch className="h-6 w-6" style={{ color: branding.primaryColor }} />
          Cores do Tema
        </h2>

        {/* Paletas pré-definidas */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Paletas Rápidas</label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {colorPresets.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyColorPreset(preset)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition hover:scale-105 ${
                  form.primaryColor === preset.primary 
                    ? 'border-gray-900 shadow-md' 
                    : 'border-transparent hover:border-gray-200'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-full shadow-inner"
                  style={{ backgroundColor: preset.primary }}
                />
                <span className="text-xs text-gray-600 font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cores customizadas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cor Primária</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.primaryColor || '#059669'}
                onChange={e => setForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={form.primaryColor || ''}
                onChange={e => setForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm text-gray-900 font-mono"
                maxLength={7}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cor Escura</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.primaryDark || '#047857'}
                onChange={e => setForm(prev => ({ ...prev, primaryDark: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={form.primaryDark || ''}
                onChange={e => setForm(prev => ({ ...prev, primaryDark: e.target.value }))}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm text-gray-900 font-mono"
                maxLength={7}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cor Clara</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.primaryLight || '#10b981'}
                onChange={e => setForm(prev => ({ ...prev, primaryLight: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={form.primaryLight || ''}
                onChange={e => setForm(prev => ({ ...prev, primaryLight: e.target.value }))}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm text-gray-900 font-mono"
                maxLength={7}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fundo Claro</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.primaryBg || '#d1fae5'}
                onChange={e => setForm(prev => ({ ...prev, primaryBg: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={form.primaryBg || ''}
                onChange={e => setForm(prev => ({ ...prev, primaryBg: e.target.value }))}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm text-gray-900 font-mono"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {/* Preview de cores */}
        <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-2">Pré-visualização</p>
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              className="px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm"
              style={{ backgroundColor: form.primaryColor }}
            >
              Botão Primário
            </button>
            <button 
              type="button" 
              className="px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm"
              style={{ backgroundColor: form.primaryDark }}
            >
              Botão Escuro
            </button>
            <div 
              className="px-3 py-1.5 rounded text-sm font-medium"
              style={{ backgroundColor: form.primaryBg, color: form.primaryDark }}
            >
              Badge
            </div>
          </div>
        </div>
      </div>

      {/* Cores da Sidebar */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Cores da Barra Lateral</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">Temas de Sidebar</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {sidebarPresets.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applySidebarPreset(preset)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition hover:scale-105 ${
                  form.sidebarFrom === preset.from 
                    ? 'border-gray-900 shadow-md' 
                    : 'border-transparent hover:border-gray-200'
                }`}
              >
                <div 
                  className="w-full h-10 rounded shadow-inner"
                  style={{ background: `linear-gradient(to bottom, ${preset.from}, ${preset.to})` }}
                />
                <span className="text-xs text-gray-600 font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Topo da Sidebar</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.sidebarFrom || '#1e293b'}
                onChange={e => setForm(prev => ({ ...prev, sidebarFrom: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={form.sidebarFrom || ''}
                onChange={e => setForm(prev => ({ ...prev, sidebarFrom: e.target.value }))}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm text-gray-900 font-mono"
                maxLength={7}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Base da Sidebar</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.sidebarTo || '#0f172a'}
                onChange={e => setForm(prev => ({ ...prev, sidebarTo: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={form.sidebarTo || ''}
                onChange={e => setForm(prev => ({ ...prev, sidebarTo: e.target.value }))}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm text-gray-900 font-mono"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {/* Preview sidebar */}
        <div className="mt-4 flex gap-3 items-stretch">
          <div 
            className="w-16 h-32 rounded-lg shadow-inner"
            style={{ background: `linear-gradient(to bottom, ${form.sidebarFrom}, ${form.sidebarTo})` }}
          />
          <div className="flex flex-col justify-center">
            <p className="text-xs text-gray-500">Pré-visualização da sidebar</p>
          </div>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium shadow-sm transition disabled:opacity-50"
          style={{ backgroundColor: branding.primaryColor }}
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Salvando...
            </>
          ) : (
            <>
              <HiCheck className="h-5 w-5" />
              Salvar Configurações de Marca
            </>
          )}
        </button>
      </div>
    </form>
  );
}
