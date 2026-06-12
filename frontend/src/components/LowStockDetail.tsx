import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { fetchLowStockRows, LowStockRow } from "../utils/lowStock";

export function LowStockDetail() {
  const [items, setItems] = useState<LowStockRow[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLowStockRows().then(setItems).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Low Stock Items</h1>
          <p className="text-slate-500">All size stocks with quantity 5 or less</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-red-50 border-b">
            <tr>
              {["Brand", "Sub Brand", "Article", "Size", "Qty", "Category", "Type", "Location", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">No low stock items</td></tr>
            ) : items.map((item) => (
              <tr key={item.stockId} onClick={() => navigate("/stock")}
                className="hover:bg-slate-50 cursor-pointer">
                <td className="px-4 py-3 font-semibold">{item.brandName}</td>
                <td className="px-4 py-3">{item.subBrand || "-"}</td>
                <td className="px-4 py-3">{item.article || "-"}</td>
                <td className="px-4 py-3">{item.size}</td>
                <td className="px-4 py-3 font-bold text-red-600">{item.quantity}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">{item.type}</td>
                <td className="px-4 py-3">{item.section || item.rack ? `${item.section}-${item.rack}` : "-"}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-red-600 text-xs">
                    <AlertTriangle className="w-3 h-3" /> Low
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
