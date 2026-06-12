import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchAllStockRows, LowStockRow } from "../utils/lowStock";

export function StockOverviewDetail() {
  const [items, setItems] = useState<LowStockRow[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllStockRows().then(setItems).catch(console.error);
  }, []);

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Stock Overview</h1>
            <p className="text-slate-500">{items.length} size entries · {totalQty} total pairs</p>
          </div>
        </div>
        <button onClick={() => navigate("/stock")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium">
          Manage Stock
        </button>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              {["Brand", "Article", "Size", "Qty", "Category", "Type", "Color", "Location", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.stockId} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{item.brandName}</td>
                <td className="px-4 py-3">{item.article || "-"}</td>
                <td className="px-4 py-3">{item.size}</td>
                <td className="px-4 py-3 font-bold">{item.quantity}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">{item.type}</td>
                <td className="px-4 py-3">{item.color}</td>
                <td className="px-4 py-3">{item.section || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${item.stockStatus === "READY_FOR_SALE" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                    {item.stockStatus === "READY_FOR_SALE" ? "Clearance" : "Active"}
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
