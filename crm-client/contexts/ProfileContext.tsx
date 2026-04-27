'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface ProfileContextType {
  fotoPerfil: string | null;
  setFotoPerfil: (url: string | null) => void;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  fotoPerfil: null,
  setFotoPerfil: () => {},
  isLoading: true,
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken && session.user?.id) {
      setIsLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(data => {
        if (data && data.fotoPerfil) {
          setFotoPerfil(data.fotoPerfil);
        } else {
          setFotoPerfil(null);
        }
      })
      .catch(err => {
        console.error('Error fetching profile pic', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else if (!session) {
      setFotoPerfil(null);
      setIsLoading(false);
    }
  }, [session?.accessToken, session?.user?.id]);

  return (
    <ProfileContext.Provider value={{ fotoPerfil, setFotoPerfil, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
