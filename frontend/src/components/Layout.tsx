import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { financialYearService } from "../services/financialYearService";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  LogOut,
  ShoppingBag,
  FileText,
  Settings,
  Archive,
  BarChart3
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeFy, setActiveFy] = useState<string>("");

  useEffect(() => {
    financialYearService.getActive().then(fy => {
      setActiveFy(fy.name);
    }).catch(() => {});
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "billing", label: "Counter Sale / POS", icon: ShoppingCart },
    { id: "stock", label: "Stock Management", icon: Package },
    { id: "ready-for-sale", label: "Ready for Sale", icon: Archive },
    { id: "brands", label: "Brands", icon: Tag },
    { id: "bills", label: "Sales Register", icon: FileText },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 print:bg-white flex">
      {/* SIDEBAR LOGIC INSPIRED BY MODERN DASHBOARDS */}
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col min-h-screen print:hidden shadow-xl sticky top-0">
        
        {/* LOGO & BRAND */}
        <div className="h-20 flex items-center gap-3 px-6 bg-slate-950 shadow-sm border-b border-slate-800">
          <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Shivam <span className="text-indigo-400">Footwear</span></h1>
            <p className="text-xs text-slate-400 tracking-wider uppercase font-semibold">Shop System</p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const active =
              location.pathname === `/${item.id}` ||
              location.pathname.startsWith(`/${item.id}/`) ||
              (location.pathname === "/" && item.id === "dashboard");

            return (
              <button
                key={item.id}
                onClick={() => navigate(`/${item.id}`)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group
                  ${active 
                    ? "bg-indigo-500/10 text-indigo-400 shadow-sm shadow-indigo-500/5 ring-1 ring-indigo-500/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* USER PROFILE & LOGOUT */}
        <div className="p-4 bg-slate-950 mt-auto border-t border-slate-800">
          <div className="flex items-center justify-between px-2 py-1">
             <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Logged In</span>
                <span className="text-sm text-slate-200 font-medium truncate max-w-[120px]">{user?.name || "Administrator"}</span>
             </div>
             <button
               onClick={logout}
               className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 ring-1 ring-slate-800/50 group"
               title="Logout"
             >
               <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
             </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:block">
         
         {/* SUBTLE TOP NAVBAR */}
         <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10 flex items-center px-8 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] print:hidden">
            <div className="flex-1">
               {/* Could add breadcrumbs or page title here dynamically based on route */}
               <h2 className="text-lg font-semibold text-slate-700 capitalize">
                  {location.pathname === "/" ? "Dashboard" : location.pathname.substring(1).replace("-", " ")}
               </h2>
            </div>
            
            {/* Action Bar (Time, Notifications, etc - placeholders for now) */}
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                {activeFy && (
                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-semibold border border-indigo-100 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    {activeFy}
                  </span>
                )}
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
         </header>

         {/* CONTENT SCROLL AREA */}
         <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6 lg:p-10 hide-scrollbar">
            <div className="max-w-7xl mx-auto w-full animate-fade-in">
              {children}
            </div>
         </div>
      </main>
    </div>
  );
}
