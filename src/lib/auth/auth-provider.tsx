"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api/client";
import type { AuthTokens, Me } from "@/lib/api/types";
import { clearTokens, getRefreshToken, loadTokens, setTokens } from "@/lib/auth/tokens";

interface AuthState {
  user: Me | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (tenantName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      setUser(await api<Me>("/auth/me"));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadTokens();
    (async () => {
      if (getRefreshToken()) await loadMe();
      setLoading(false);
    })();
  }, [loadMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await api<AuthTokens>("/auth/login", {
        method: "POST",
        anonymous: true,
        body: { email, password },
      });
      setTokens(tokens.access_token, tokens.refresh_token);
      await loadMe();
    },
    [loadMe],
  );

  const register = useCallback(
    async (tenantName: string, email: string, password: string) => {
      const tokens = await api<AuthTokens>("/auth/register", {
        method: "POST",
        anonymous: true,
        body: { tenant_name: tenantName, email, password },
      });
      setTokens(tokens.access_token, tokens.refresh_token);
      await loadMe();
    },
    [loadMe],
  );

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      /* best effort */
    }
    clearTokens();
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (permission: string) => user?.permissions.includes(permission) ?? false,
    [user],
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, hasPermission }),
    [user, loading, login, register, logout, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
