import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_BASE } from "../services/api";

type AuthContextType = {
  isAuthenticated: boolean;
  user: { name: string } | null;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("shivam_auth") === "true"
  );
  const [user, setUser] = useState<{ name: string } | null>(() => {
    const name = sessionStorage.getItem("shivam_user_name");
    return name ? { name } : null;
  });

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetch(`${API_BASE}/settings`)
        .then((r) => r.json())
        .then((s) => setUser({ name: s.name || "Shop Owner" }))
        .catch(() => setUser({ name: "Shop Owner" }));
    }
  }, [isAuthenticated, user]);

  const login = async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/settings/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setUser({ name: data.name || "Shop Owner" });
        sessionStorage.setItem("shivam_auth", "true");
        sessionStorage.setItem("shivam_user_name", data.name || "Shop Owner");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem("shivam_auth");
    sessionStorage.removeItem("shivam_user_name");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
