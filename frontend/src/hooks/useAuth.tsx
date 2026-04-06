import React, { createContext, useContext, useState, useCallback } from "react";
import { Role, User } from "@/types";

export const DEMO_ACCOUNTS = {
  admin: {
    email: "alice@finco.io",
    password: "admin123",
    name: "Alice Chen",
    role: "Admin" as Role,
    avatar: "purple" as const,
  },
  analyst: {
    email: "bob@finco.io",
    password: "analyst123",
    name: "Bob Martinez",
    role: "Analyst" as Role,
    avatar: "blue" as const,
  },
  viewer: {
    email: "cathy@finco.io",
    password: "viewer123",
    name: "Cathy Lee",
    role: "Viewer" as Role,
    avatar: "green" as const,
  },
} as const;

export type DemoAccountKey = keyof typeof DEMO_ACCOUNTS;

const roleLevel: Record<Role, number> = { Viewer: 0, Analyst: 1, Admin: 2 };

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  hasAccess: (minRole: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, password: string) => {
    const e = email.trim();
    const p = password.trim();
    const match = Object.values(DEMO_ACCOUNTS).find((a) => a.email === e && a.password === p);
    if (!match) return false;
    setUser({
      id: crypto.randomUUID(),
      email: match.email,
      name: match.name,
      role: match.role,
      isActive: true,
      avatarTone: match.avatar === "green" ? "green" : match.avatar === "blue" ? "blue" : "purple",
    });
    return true;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const hasAccess = useCallback(
    (minRole: Role) => (user ? roleLevel[user.role] >= roleLevel[minRole] : false),
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
