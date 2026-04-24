import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import NotificationContainer from "@/components/NotificationContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AGS CRM",
  description: "Sistema de Gerenciamento Comercial",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <BrandingProvider>
            <NotificationProvider>
              {children}
              <NotificationContainer />
            </NotificationProvider>
          </BrandingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
