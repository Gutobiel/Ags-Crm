'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface BrandingConfig {
  id?: number;
  appName: string;
  appDescription: string;
  welcomeMessage: string;
  logoPath: string | null;
  faviconPath: string | null;
  primaryColor: string;
  primaryDark: string;
  primaryLight: string;
  primaryBg: string;
  sidebarFrom: string;
  sidebarTo: string;
  loginImages: string | null;
  loginImageBlur: boolean;
}

const defaultBranding: BrandingConfig = {
  appName: 'AGS CRM',
  appDescription: 'Sistema de Gerenciamento',
  welcomeMessage: 'Bem-vindo',
  logoPath: null,
  faviconPath: null,
  primaryColor: '#059669',
  primaryDark: '#047857',
  primaryLight: '#10b981',
  primaryBg: '#d1fae5',
  sidebarFrom: '#1e293b',
  sidebarTo: '#0f172a',
  loginImages: null,
  loginImageBlur: true,
};

interface BrandingContextType {
  branding: BrandingConfig;
  loading: boolean;
  refreshBranding: () => Promise<void>;
  getLogoUrl: () => string;
  getFaviconUrl: () => string;
  getLoginImageUrls: () => string[];
}

const defaultLoginImages = [
  '/image/imagem1.jpg',
  '/image/fundo2.mp4',
  '/image/video2.mp4',

];

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  loading: true,
  refreshBranding: async () => { },
  getLogoUrl: () => '/logo.png',
  getFaviconUrl: () => '/favicon.ico',
  getLoginImageUrls: () => defaultLoginImages,
});

// Converte hex para RGB
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

// Gera variações de cor a partir de uma cor base
function generateColorShades(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return {
    50: `rgb(${Math.min(r + 190, 255)}, ${Math.min(g + 190, 255)}, ${Math.min(b + 190, 255)})`,
    100: `rgb(${Math.min(r + 160, 255)}, ${Math.min(g + 160, 255)}, ${Math.min(b + 160, 255)})`,
    200: `rgb(${Math.min(r + 120, 255)}, ${Math.min(g + 120, 255)}, ${Math.min(b + 120, 255)})`,
    300: `rgb(${Math.min(r + 80, 255)}, ${Math.min(g + 80, 255)}, ${Math.min(b + 80, 255)})`,
    400: `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`,
    500: `rgb(${r}, ${g}, ${b})`,
    600: `rgb(${Math.max(r - 20, 0)}, ${Math.max(g - 20, 0)}, ${Math.max(b - 20, 0)})`,
    700: `rgb(${Math.max(r - 50, 0)}, ${Math.max(g - 50, 0)}, ${Math.max(b - 50, 0)})`,
    800: `rgb(${Math.max(r - 80, 0)}, ${Math.max(g - 80, 0)}, ${Math.max(b - 80, 0)})`,
    900: `rgb(${Math.max(r - 110, 0)}, ${Math.max(g - 110, 0)}, ${Math.max(b - 110, 0)})`,
  };
}

function applyBrandingCSS(branding: BrandingConfig) {
  const root = document.documentElement;
  const shades = generateColorShades(branding.primaryColor);

  // Cores primárias geradas
  root.style.setProperty('--brand-50', shades[50]);
  root.style.setProperty('--brand-100', shades[100]);
  root.style.setProperty('--brand-200', shades[200]);
  root.style.setProperty('--brand-300', shades[300]);
  root.style.setProperty('--brand-400', shades[400]);
  root.style.setProperty('--brand-500', shades[500]);
  root.style.setProperty('--brand-600', shades[600]);
  root.style.setProperty('--brand-700', shades[700]);
  root.style.setProperty('--brand-800', shades[800]);
  root.style.setProperty('--brand-900', shades[900]);

  // Cores específicas configuráveis
  root.style.setProperty('--brand-primary', branding.primaryColor);
  root.style.setProperty('--brand-primary-dark', branding.primaryDark);
  root.style.setProperty('--brand-primary-light', branding.primaryLight);
  root.style.setProperty('--brand-primary-bg', branding.primaryBg);

  // Sidebar
  root.style.setProperty('--brand-sidebar-from', branding.sidebarFrom);
  root.style.setProperty('--brand-sidebar-to', branding.sidebarTo);

  // Título da aba do navegador
  document.title = branding.appName || 'AGS CRM';

  // Favicon dinâmico
  if (branding.faviconPath) {
    const faviconUrl = `${API_URL}/branding/file/${branding.faviconPath}`;
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [loading, setLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      const res = await fetch(`${API_URL}/branding`);
      if (res.ok) {
        const data = await res.json();
        setBranding(data);
        applyBrandingCSS(data);
      }
    } catch (err) {
      console.warn('Não foi possível carregar branding, usando padrão');
      applyBrandingCSS(defaultBranding);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const getLogoUrl = () => {
    if (branding.logoPath) {
      return `${API_URL}/branding/file/${branding.logoPath}`;
    }
    return '/logo.png';
  };

  const getFaviconUrl = () => {
    if (branding.faviconPath) {
      return `${API_URL}/branding/file/${branding.faviconPath}`;
    }
    return '/favicon.ico';
  };

  const getLoginImageUrls = (): string[] => {
    if (branding.loginImages) {
      try {
        const images: string[] = JSON.parse(branding.loginImages);
        if (images.length > 0) {
          return images.map(img => `${API_URL}/branding/file/${img}`);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    // Fallback para imagens padrão
    return defaultLoginImages;
  };

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding: fetchBranding, getLogoUrl, getFaviconUrl, getLoginImageUrls }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
