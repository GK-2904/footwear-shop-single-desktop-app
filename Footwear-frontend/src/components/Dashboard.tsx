import { useEffect, useState } from "react";
import { storageService } from "../services/storage";
import { DashboardStats, Footwear } from "../types";
import {
  Package,
  Tag,
  AlertTriangle,
  DollarSign,
  FileText,
} from "lucide-react";

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStock: 0,
    totalBrands: 0,
    lowStockItems: 0,
    todaySales: 0,
    todayBills: 0,
  });

  const [lowStockItems, setLowStockItems] = useState<Footwear[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // 1️⃣ Fetch base data
      const products = await storageService.getFootwear();
      const brands = await storageService.getBrands();
      const bills = await storageService.getBills();

      // 2️⃣ Today bills & sales
      const today = new Date().toISOString().split("T")[0];

      const todayBills = bills.filter(
        (b) => b.billDate === today
      );

      const todaySales = todayBills.reduce(
        (sum, bill) => sum + bill.totalAmount,
        0
      );

      // 3️⃣ Stock calculation (product + size stocks)
      let totalStock = 0;
      const lowStock: Footwear[] = [];

      for (const product of products) {
        const stocks = await storageService.getStockByProduct(product.id);

        const productQty = stocks.reduce(
          (sum, s) => sum + s.quantity,
          0
        );

        totalStock += productQty;

        if (productQty <= 5) {
          lowStock.push({
            ...product,
            quantity: productQty, // derived field
          });
        }
      }

      // 4️⃣ Update dashboard
      setStats({
        totalStock,
        totalBrands: brands.length,
        lowStockItems: lowStock.length,
        todaySales,
        todayBills: todayBills.length,
      });

      setLowStockItems(lowStock);
    } catch (error) {
      console.error("Dashboard load error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* ===== Stats Cards ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Stock" value={stats.totalStock} icon={<Package className="w-12 h-12 text-blue-500" />} />
        <StatCard title="Total Brands" value={stats.totalBrands} icon={<Tag className="w-12 h-12 text-green-500" />} />
        <StatCard title="Low Stock" value={stats.lowStockItems} icon={<AlertTriangle className="w-12 h-12 text-red-500" />} danger />
        <StatCard title="Today Sales" value={`₹${stats.todaySales}`} icon={<DollarSign className="w-12 h-12 text-emerald-500" />} />
        <StatCard title="Today Bills" value={stats.todayBills} icon={<FileText className="w-12 h-12 text-orange-500" />} />
      </div>

      {/* ===== Low Stock Table ===== */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Brand", "Category", "Type", "Size", "Color", "Location", "Quantity"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{item.brandName}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3">{item.type}</td>
                    <td className="px-4 py-3">{item.size}</td>
                    <td className="px-4 py-3">{item.color}</td>
                    <td className="px-4 py-3">
                      {item.section}-{item.rack}-{item.shelf}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
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

/* ===== Reusable Card ===== */
function StatCard({
  title,
  value,
  icon,
  danger = false,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`mt-2 font-bold ${danger ? "text-red-600 text-3xl" : "text-gray-900 text-3xl"}`}>
          {value}
        </p>
      </div>
      {icon}
    </div>
  );
}
