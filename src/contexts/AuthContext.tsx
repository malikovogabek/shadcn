import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User } from "@/types";
import { authApi } from "@/api/auth";
import { setToken, getToken } from "@/api/client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      return;
    }
    // If token exists but user yo'q bo'lsa, backenddan 'me' orqali yuklaymiz
    const token = getToken();
    if (token) {
      (async () => {
        const data = await authApi.me();
        const apiUser: {
          id?: string;
          fullName?: string;
          username?: string;
          role?: string;
        } = (data as unknown as { user?: Record<string, unknown> }).user || {};
        if (apiUser?.username) {
          const normalizedUser: User = {
            id: apiUser.id ?? "",
            name: apiUser.fullName ?? apiUser.username ?? "",
            username: apiUser.username ?? "",
            password: "",
            role: apiUser.role === "ADMIN" ? "admin" : "tergovchi",
            lastActivity: new Date().toISOString(),
          };
          setUser(normalizedUser);
          setIsAuthenticated(true);
          localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
        }
      })();
    }
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const data = await authApi.login(username, password);
      if (!data) return false;

      const accessToken: string | undefined = data.access_token;
      const apiUser: {
        id?: string;
        fullName?: string;
        username?: string;
        role?: string;
      } = (data as unknown as { user?: Record<string, unknown> }).user || {};

      const normalizedUser: User = {
        id: apiUser?.id ?? "",
        name: apiUser?.fullName ?? apiUser?.username ?? "",
        username: apiUser?.username ?? username,
        password: "",
        role: apiUser?.role === "ADMIN" ? "admin" : "tergovchi",
        lastActivity: new Date().toISOString(),
      };

      setUser(normalizedUser);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
      setToken(accessToken ?? null);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("currentUser");
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
