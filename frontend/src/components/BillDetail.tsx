import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storageService } from "../services/storage";
import { Bill, BillItem } from "../types/models";
import { formatDate } from "../constants/productOptions";
import { ArrowLeft, Printer, RotateCcw } from "lucide-react";

export function BillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState<Bill | null>(null);
  const [returnQty, setReturnQty] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) loadBill();
  }, [id]);

  const loadBill = async () => {
    const data = await storageService.getBillById(Number(id));
    setBill(data);
  };

  const handleReturn = async (item: BillItem) => {
    const qty = returnQty[item.id!];
    if (!qty || qty <= 0) { alert("Enter return quantity"); return; }
    if (!confirm(`Return ${qty} item(s)? Stock will be restored.`)) return;
    setLoading(true);
    try {
      const updated = await storageService.returnBillItem(Number(id), item.id!, qty);
      setBill(updated);
      setReturnQty({ ...returnQty, [item.id!]: 0 });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Return failed");
    } finally {
      setLoading(false);
    }
  };

  if (!bill) return <p className="p-8 text-slate-500">Loading bill...</p>;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/bills")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Sales Register
        </button>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/invoice/${bill.id}`)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm">
            <Printer className="w-4 h-4" /> Reprint
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{bill.billNo || "INV-" + bill.id.toString().padStart(4, "0")}</h1>
            <p className="text-slate-500">{formatDate(bill.billDate)} · {bill.billTime?.substring(0, 5)} · {bill.paymentMode}</p>
          </div>
          <div className="text-right space-y-1 text-sm">
            <p>Total: <strong>₹{Number(bill.totalAmount).toFixed(2)}</strong></p>
            <p className="text-emerald-600">Margin: <strong>₹{Number(bill.totalMargin || 0).toFixed(2)}</strong></p>
            {(bill.totalReturned || 0) > 0 && (
              <p className="text-red-600">Returned: <strong>₹{Number(bill.totalReturned).toFixed(2)}</strong></p>
            )}
            <p className="font-bold text-lg">Net: ₹{Number(bill.netTotal || bill.totalAmount).toFixed(2)}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {["Item", "Size", "Qty", "MRP", "Purchase", "Sale Price", "Margin", "Returned", "Return"].map((h) => (
                <th key={h} className="p-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {(bill.items || []).map((item) => (
              <tr key={item.id}>
                <td className="p-3">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-slate-500">{item.article} · {item.type}</p>
                </td>
                <td className="p-3">{item.size}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">₹{Number(item.mrp || 0).toFixed(0)}</td>
                <td className="p-3 text-slate-500">₹{Number(item.purchasePrice || 0).toFixed(0)}</td>
                <td className="p-3 font-medium">₹{Number(item.actualUnitPrice).toFixed(0)}</td>
                <td className="p-3 text-emerald-600">₹{Number(item.lineMargin || 0).toFixed(0)}</td>
                <td className="p-3 text-red-600">
                  {item.returnedQty ? `${item.returnedQty} (₹${Number(item.returnedAmount).toFixed(0)})` : "-"}
                </td>
                <td className="p-3">
                  {(item.returnableQty ?? item.quantity) > 0 ? (
                    <div className="flex items-center gap-1">
                      <input type="number" min={1} max={item.returnableQty ?? item.quantity}
                        value={returnQty[item.id!] || ""}
                        onChange={(e) => setReturnQty({ ...returnQty, [item.id!]: Number(e.target.value) })}
                        className="w-14 border rounded px-1 py-0.5 text-xs" placeholder="Qty" />
                      <button disabled={loading} onClick={() => handleReturn(item)}
                        className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">
                        <RotateCcw className="w-3 h-3" /> Return
                      </button>
                    </div>
                  ) : <span className="text-xs text-slate-400">Fully returned</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
