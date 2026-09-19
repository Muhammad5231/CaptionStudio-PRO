'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, ApiError } from '@/lib/api-client';
import { SignUpDto } from '@captionstudio/types';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status?: string;
  avatarUrl?: string | null;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  workspace: WorkspaceSummary | null;
  workspaces: WorkspaceSummary[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (data: SignUpDto) => Promise<void>;
  logout: () => Promise<void>;
  setActiveWorkspace: (ws: WorkspaceSummary) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get<{
        success: boolean;
        data: {
          user: AuthUser;
          workspaces: WorkspaceSummary[];
          activeWorkspace: WorkspaceSummary | null;
        };
      }>('/auth/me');

      if (res.data?.user) {
        setUser(res.data.user);
        setWorkspaces(res.data.workspaces || []);
        setWorkspace((prev) => prev || res.data.activeWorkspace || res.data.workspaces[0] || null);
      } else {
        setUser(null);
        setWorkspace(null);
        setWorkspaces([]);
      }
    } catch {
      setUser(null);
      setWorkspace(null);
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string, rememberMe = true) => {
    const res = await api.post<{
      success: boolean;
      data: {
        user: AuthUser;
        workspace: WorkspaceSummary | null;
      };
    }>('/auth/login', { email, password, rememberMe });

    if (res.data?.user) {
      setUser(res.data.user);
      if (res.data.workspace) {
        setWorkspace(res.data.workspace);
        setWorkspaces([res.data.workspace]);
      }
      await refreshUser();
    }
  };

  const signup = async (data: SignUpDto) => {
    const res = await api.post<{
      success: boolean;
      data: {
        user: AuthUser;
        workspace: WorkspaceSummary | null;
      };
      message: string;
    }>('/auth/signup', data);

    if (res.data?.user) {
      setUser(res.data.user);
      if (res.data.workspace) {
        setWorkspace(res.data.workspace);
        setWorkspaces([res.data.workspace]);
      }
      await refreshUser();
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Proceed with local logout regardless of network state
    }
    setUser(null);
    setWorkspace(null);
    setWorkspaces([]);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        workspaces,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
        setActiveWorkspace: setWorkspace,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

