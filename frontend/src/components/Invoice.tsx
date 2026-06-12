import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft, CheckCircle2 } from "lucide-react";
import { storageService } from "../services/storage";
import { API_BASE } from "../services/api";
import { DEFAULT_SHOP } from "../config/shop";
import { Bill } from "../types/models";
import { formatDate } from "../constants/productOptions";

export function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState<Bill | null>(null);
  const [shop, setShop] = useState(DEFAULT_SHOP);

  useEffect(() => {
    if (!id) return;
    storageService.getBillById(Number(id)).then(setBill).catch(console.error);
    fetch(`${API_BASE}/settings`).then((r) => r.json()).then((s) => setShop({
      name: s.name || DEFAULT_SHOP.name,
      address: s.address || DEFAULT_SHOP.address,
      phone: s.phone || DEFAULT_SHOP.phone,
      gstin: s.gstin || DEFAULT_SHOP.gstin,
    })).catch(() => {});
  }, [id]);

  if (!bill) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Generating Invoice...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 print:p-0 print:bg-white">
      <div className="max-w-2xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 bg-white px-4 py-2 rounded-xl border">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl">
          <Printer className="w-4 h-4" /> Print Receipt
        </button>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow-xl print:shadow-none print:p-0 relative">
        <div className="absolute top-6 right-6 flex items-center gap-2 text-emerald-600 font-bold print:hidden">
          <CheckCircle2 className="w-5 h-5" /> PAID
        </div>

        <div className="text-center mb-8 pb-6 border-b-2 border-dashed border-slate-200">
          <h1 className="text-3xl font-extrabold text-slate-900">{shop.name}</h1>
          <p className="text-slate-500">Footwear Retail Invoice</p>
          {shop.address && <p className="text-slate-400 text-sm mt-1">{shop.address}</p>}
          <p className="text-slate-400 text-sm">Ph: {shop.phone}</p>
        </div>

        <div className="flex justify-between mb-8 text-sm">
          <div>
            <p className="text-slate-500">Payment</p>
            <p className="font-bold text-lg">{bill.paymentMode}</p>
          </div>
          <div className="text-right">
            <p><span className="text-slate-500">Receipt:</span> <strong>{bill.billNo || "INV-" + bill.id.toString().padStart(4, "0")}</strong></p>
            <p><span className="text-slate-500">Date:</span> {formatDate(bill.billDate)}</p>
            <p><span className="text-slate-500">Time:</span> {bill.billTime?.substring(0, 5)}</p>
          </div>
        </div>

        <table className="w-full text-left mb-6">
          <thead>
            <tr className="border-b-2 border-slate-800 text-xs uppercase">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">MRP</th>
              <th className="py-2 text-right">Sale Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(bill.items || []).map((item, i) => (
              <tr key={i}>
                <td className="py-3">
                  <p className="font-bold">{item.productName}{item.article ? ` · ${item.article}` : ""}</p>
                  <p className="text-xs text-slate-500">{item.type} · Size {item.size}</p>
                </td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right text-slate-500">₹{Number(item.mrp || 0).toFixed(0)}</td>
                <td className="py-3 text-right font-medium">₹{Number(item.actualUnitPrice).toFixed(0)}</td>
                <td className="py-3 text-right font-bold">₹{Number(item.total).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end border-t-2 border-slate-800 pt-4">
          <div className="w-56 space-y-2">
            <div className="flex justify-between text-lg font-black">
              <span>TOTAL</span>
              <span>₹{Number(bill.totalAmount).toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-400 text-right">Paid via {bill.paymentMode}</p>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-slate-500">
          <p className="font-bold text-slate-800">Thank you for shopping with us!</p>
          <p className="mt-2 text-xs">Returns accepted within 15 days with original receipt.</p>
        </div>
      </div>
    </div>
  );
}
