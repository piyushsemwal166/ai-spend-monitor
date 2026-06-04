"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import type { User } from "@/types";

export interface LoginValues {
  email: string;
  password: string;
}

export interface RegisterValues {
  name: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (values: LoginValues) => Promise<void>;
  signUp: (values: RegisterValues) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const TOKEN_KEY = "ai-spend-token";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const persistSession = (nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    window.localStorage.setItem(TOKEN_KEY, nextToken);
  };

  const clearSession = (options?: { clearCache?: boolean }) => {
    setToken(null);
    setUser(null);
    window.localStorage.removeItem(TOKEN_KEY);
    if (options?.clearCache) {
      queryClient.clear();
    }
  };

  useEffect(() => {
    const hydrate = async () => {
      const storedToken = window.localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const profile = await authService.getProfile();
        setUser(profile.user);
      } catch {
        clearSession({ clearCache: true });
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, []);

  const signIn = async (values: LoginValues) => {
    const response = await authService.login(values);
    persistSession(response.token, response.user);
  };

  const signUp = async (values: RegisterValues) => {
    const response = await authService.register(values);
    persistSession(response.token, response.user);
  };

  const signOut = () => {
    // clear server-side cookie and local session
    void authService.logout().catch(() => {
      /* ignore */
    });
    clearSession({ clearCache: true });
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile.user);
    } catch {
      clearSession({ clearCache: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}