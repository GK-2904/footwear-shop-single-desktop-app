import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storage";
import { DashboardStats } from "../types";
import { fetchLowStockRows, LowStockRow } from "../utils/lowStock";
import {
  Package,
  Tag,
  AlertTriangle,
  DollarSign,
  FileText,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalStock: 0,
    totalBrands: 0,
    lowStockItems: 0,
    todaySales: 0,
    todayBills: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<LowStockRow[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const brands = await storageService.getBrands();
      const bills = await storageService.getBills();
      const lowStock = await fetchLowStockRows();
      const allStock = await storageService.getSizeStock();

      const today = new Date().toISOString().split("T")[0];
      const todayBills = bills.filter((b) => b.billDate === today);
      const todaySales = todayBills.reduce((sum, bill) => sum + Number(bill.netTotal ?? bill.totalAmount), 0);
      const totalStock = allStock.reduce((sum, s) => sum + s.quantity, 0);

      setStats({
        totalStock,
        totalBrands: brands.length,
        lowStockItems: lowStock.length,
        todaySales,
        todayBills: todayBills.length,
      });
      setLowStockItems(lowStock.slice(0, 10));
    } catch (error) {
      console.error("Dashboard load error:", error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-800">Overview</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/reports/daily")}
            className="px-4 py-2 bg-white text-slate-700 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 font-medium transition-all">
            Export Report
          </button>
          <button onClick={() => navigate("/billing")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 font-medium transition-all flex items-center gap-2">
            New Bill
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Earnings" value={`₹${stats.todaySales.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />} trend="+12.5%" trendUp colorClass="bg-emerald-50 text-emerald-600"
          onClick={() => navigate("/dashboard/sales-today")} />
        <StatCard title="Today's Bills" value={stats.todayBills}
          icon={<FileText className="w-6 h-6 text-indigo-600" />} trend="+4.2%" trendUp colorClass="bg-indigo-50 text-indigo-600"
          onClick={() => navigate("/bills?from=today&to=today")} />
        <StatCard title="Total Stock" value={stats.totalStock.toLocaleString()}
          icon={<Package className="w-6 h-6 text-blue-600" />} colorClass="bg-blue-50 text-blue-600"
          onClick={() => navigate("/dashboard/stock-overview")} />
        <StatCard title="Total Brands" value={stats.totalBrands}
          icon={<Tag className="w-6 h-6 text-purple-600" />} colorClass="bg-purple-50 text-purple-600"
          onClick={() => navigate("/brands")} />
        <StatCard title="Low Stock" value={stats.lowStockItems}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />} trend="Requires Action" trendUp={false} danger
          colorClass="bg-red-50 text-red-600 ring-1 ring-red-100"
          onClick={() => navigate("/dashboard/low-stock")} />
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-800">Critical Stock Alerts</h2>
            </div>
            <button onClick={() => navigate("/dashboard/low-stock")}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
              View all →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100/80">
                  {["Product Details", "Category & Type", "Location", "Status", "Quantity"].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockItems.map((item) => (
                  <tr key={item.stockId} onClick={() => navigate("/stock")}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{item.brandName}{item.subBrand ? ` · ${item.subBrand}` : ""}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.article || "-"} | Size {item.size} | {item.color}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{item.category}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.type}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 font-medium">
                        {item.section || item.rack ? `${item.section}-${item.rack}` : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        Warning
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 text-sm font-bold bg-red-100 text-red-700 rounded-lg">
                        {item.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title, value, icon, trend, trendUp, danger = false, colorClass, onClick
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  danger?: boolean;
  colorClass: string;
  onClick?: () => void;
}) {
  return (
    <div onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer ${danger ? "ring-1 ring-red-100" : ""}`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 transition-transform group-hover:scale-150 duration-700 ${danger ? "bg-red-500" : "bg-indigo-500"}`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className={`mt-2 text-3xl font-bold tracking-tight ${danger ? "text-red-600" : "text-slate-800"}`}>{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${danger ? "text-red-500" : trendUp ? "text-emerald-500" : "text-slate-500"}`}>
              {trendUp && !danger && <TrendingUp className="w-3 h-3" />}
              {trend}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClass} shadow-sm group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
      </div>
    </div>
  );
}
