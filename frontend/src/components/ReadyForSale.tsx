import { useEffect, useState } from "react";
import { storageService } from "../services/storage";
import { Tag, Package } from "lucide-react";
import { Stock } from "../types/models";

export function ReadyForSale() {
  const [items, setItems] = useState<Stock[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const data = await storageService.getSizeStock("READY_FOR_SALE");
    setItems(data.filter((s) => s.quantity > 0));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Ready for Sale</h1>
          <p className="text-slate-500 mt-1">Expiry / dead stock for clearance sale at discount</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-xl font-medium text-sm">
          <Tag className="w-4 h-4" /> {items.length} Items
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No clearance stock. Mark items as "Ready for Sale" in Stock Management.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-orange-50 text-xs uppercase text-orange-800">
              <tr>
                {["Brand", "Sub Brand", "Article", "Type", "Size", "Color", "MRP", "Selling", "Purchase", "Qty", "Location"].map((h) => (
                  <th key={h} className="p-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-orange-50/30">
                  <td className="p-3 font-medium">{item.product.brand?.name}</td>
                  <td className="p-3">{item.product.subBrand || "-"}</td>
                  <td className="p-3">{item.product.article || "-"}</td>
                  <td className="p-3">{item.product.type}</td>
                  <td className="p-3">{item.size}</td>
                  <td className="p-3">{item.product.color}</td>
                  <td className="p-3">₹{item.mrp}</td>
                  <td className="p-3 font-bold">₹{item.sellingPrice}</td>
                  <td className="p-3 text-slate-500">₹{item.purchasePrice}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3 text-xs">{item.section}-{item.rack}-{item.shelf}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="p-4 text-sm text-slate-500 bg-slate-50">
            Sell these from <strong>Counter Sale / POS</strong> — enable "Include Ready for Sale" checkbox and set manual discount price.
          </p>
        </div>
      )}
    </div>
  );
}
