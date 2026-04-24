'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useBranding } from '@/contexts/BrandingContext';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [randomImage, setRandomImage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { branding, getLogoUrl, getLoginImageUrls } = useBranding();

  // Selecionar imagem aleatória a partir das imagens configuradas no branding
  useEffect(() => {
    const images = getLoginImageUrls();
    if (images.length > 0) {
      setRandomImage(images[Math.floor(Math.random() * images.length)]);
    }
  }, [branding.loginImages]);

  useEffect(() => {
    // carregar email salvo
    try {
      const saved = localStorage.getItem('crm_saved_email');
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedPassword = password.replace(/[.\-\s]/g, '');
      const result = await signIn('credentials', {
        email,
        password: normalizedPassword,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha inválidos');
      } else {
        // salvar/remover email conforme checkbox
        try {
          if (remember) localStorage.setItem('crm_saved_email', email);
          else localStorage.removeItem('crm_saved_email');
        } catch (_) { }

        router.push('/home');
        router.refresh();
      }
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div 
        className="hidden lg:flex lg:w-2/3 relative items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(to bottom right, ${branding.sidebarFrom}, ${branding.sidebarTo})` }}
      >
        <div className="absolute inset-0">
          {randomImage && (
            randomImage.match(/\.(mp4|webm)$/i) ? (
              <video
                src={randomImage}
                autoPlay loop muted playsInline
                className={`w-full h-full object-cover ${branding.loginImageBlur ? 'blur-sm opacity-30' : 'opacity-100'}`}
              />
            ) : (
              <img
                src={randomImage}
                alt="Background"
                className={`w-full h-full object-cover ${branding.loginImageBlur ? 'blur-sm opacity-30' : 'opacity-100'}`}
              />
            )
          )}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <img
              src={getLogoUrl()}
              alt={branding.appName}
              className="max-w-[300px] max-h-[300px] object-contain"
            />
          </div>
          <h1 className="mt-8 text-4xl font-bold text-white text-center drop-shadow-lg">
            {branding.welcomeMessage} ao {branding.appName}
          </h1>
          <p className="mt-4 text-xl text-white/90 text-center max-w-md">
            {branding.appDescription}
          </p>
        </div>
      </div>

      <div className="flex-1 lg:w-1/3 flex items-center justify-center p-4 sm:p-8 bg-white lg:bg-white relative overflow-hidden">
        <div className="lg:hidden absolute inset-0">
          {randomImage && (
            randomImage.match(/\.(mp4|webm)$/i) ? (
              <video
                src={randomImage}
                autoPlay loop muted playsInline
                className={`w-full h-full object-cover ${branding.loginImageBlur ? 'blur-sm opacity-40' : 'opacity-100'}`}
              />
            ) : (
              <img
                src={randomImage}
                alt="Background"
                className={`w-full h-full object-cover ${branding.loginImageBlur ? 'blur-sm opacity-40' : 'opacity-100'}`}
              />
            )
          )}
        </div>

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="bg-white rounded-3xl p-8">
              <img
                src={getLogoUrl()}
                alt={branding.appName}
                className="max-w-[200px] max-h-[200px] object-contain"
              />
            </div>
          </div>


          <div className="lg:bg-transparent bg-white lg:p-0 p-6 lg:rounded-none rounded-3xl lg:shadow-none">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 text-center lg:text-left">
                Entrar na sua conta
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-center lg:text-left">Digite seu email e senha para continuar</p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                    style={{ '--tw-ring-color': branding.primaryLight } as any}
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                      style={{ '--tw-ring-color': branding.primaryLight } as any}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center p-1 text-gray-600 hover:text-gray-800"
                    >
                      {showPassword ? (
                        <HiEyeOff className="h-5 w-5" />
                      ) : (
                        <HiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 border-gray-300 rounded"
                      style={{ accentColor: branding.primaryColor }}
                    />
                    <span className="ml-2 text-gray-600">Lembrar meu email</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                style={{ 
                  backgroundColor: branding.primaryColor,
                  '--tw-ring-color': branding.primaryLight,
                } as any}
              >
                {loading ? (
                  <span className="flex items-center">
                    <AiOutlineLoading3Quarters className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>


            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
