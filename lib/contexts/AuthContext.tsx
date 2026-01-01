"use client";

import { IUser } from "@/types/User";
import React, { useCallback, useEffect, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  setTokenToLS,
  getTokenFromLS,
  removeTokenFromLS,
  authStore,
} from "@/lib/utils/localStorage";

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthState = {
  user: IUser | null;
  tokens: Tokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (tokens: Tokens) => void;
  logout: () => void;
};

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(true);

  const tokens = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot
  )
    ? (JSON.parse(authStore.getSnapshot()!) as Tokens)
    : null;

  const profileQuery = queryClient.getQueryData<IUser>(["profile"]);

  useEffect(() => {
    const savedTokens = getTokenFromLS();
    if (savedTokens) {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
    setIsLoading(false);
  }, [queryClient]);

  useEffect(() => {
    if (!tokens) {
      queryClient.clear();
    }
  }, [tokens, queryClient]);

  const login = useCallback(
    (newTokens: Tokens) => {
      setTokenToLS(newTokens);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    removeTokenFromLS();
    queryClient.clear();
  }, [queryClient]);

  const value: AuthState = {
    user: profileQuery ?? null,
    tokens,
    isLoading,
    isAuthenticated: !!tokens && !!profileQuery,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
