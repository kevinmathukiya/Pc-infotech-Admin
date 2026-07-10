'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAccessToken, getAccessToken } from '../lib/api';
import { login as loginApi, getMe, refreshAccessToken, logout as logoutApi } from '../lib/auth';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  age?: number;
  mobileNumber?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authenticating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const response = await getMe();
      // Backend response may structure user as response.data.data.user
      const userData = response.data?.data?.user || response.data?.data || response.data;
      setUser(userData);
    } catch (error) {
      setUser(null);
      setAccessToken(null);
    }
  };

  const initAuth = async () => {
    try {
      const isPublicPath = pathname === '/' || pathname === '/forgot-password';
      if (isPublicPath) {
        setLoading(false);
        return;
      }

      const storedToken = getAccessToken();
      if (storedToken) {
        await fetchUser();
      } else {
        // Attempt to refresh the access token via HttpOnly cookies
        const response = await refreshAccessToken();
        const token = response.data?.data?.accessToken;
        if (token) {
          setAccessToken(token);
          await fetchUser();
        }
      }
    } catch (error) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthenticating(true);
    try {
      const response = await loginApi(email, password);
      const token = response.data?.data?.accessToken;
      const userData = response.data?.data?.admin || response.data?.data?.user || response.data?.data;

      if (token) {
        setAccessToken(token);
        setUser(userData || null);
        router.push('/dashboard');
      } else {
        throw new Error('No access token received.');
      }
    } catch (error: any) {
      throw error;
    } finally {
      setAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push('/');
    }
  };

  // Auth routing protection
  useEffect(() => {
    if (!loading && !authenticating) {
      const isPublicPath = pathname === '/' || pathname === '/forgot-password';
      if (!user && !isPublicPath) {
        router.push('/');
      } else if (user && isPublicPath) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, authenticating, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, authenticating, login, logout, isAuthenticated: !!user, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
