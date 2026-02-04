import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  LogOut,
  ShoppingBag
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "stock", label: "Stock Management", icon: Package },
    { id: "billing", label: "Billing / POS", icon: ShoppingCart },
    { id: "brands", label: "Brand Management", icon: Tag }
  ];

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* TOP NAV */}
      <nav className="bg-slate-800 text-white shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Footwear Shop</h1>
                <p className="text-xs text-gray-300">Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* BODY */}
      <div className="flex print:block">
        <aside className="w-64 bg-white shadow-lg min-h-[calc(100vh-4rem)] print:hidden">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map(item => {
                const Icon = item.icon;
                const active =
                  location.pathname === `/${item.id}` ||
                  (location.pathname === "/" && item.id === "dashboard");

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => navigate(`/${item.id}`)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? "bg-slate-800 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6 print:p-0">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
