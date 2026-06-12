import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { storageService } from "../services/storage";
import { Bill } from "../types/models";
import { formatDate } from "../constants/productOptions";

export function SalesTodayDetail() {
  const [bills, setBills] = useState<Bill[]>([]);
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    storageService.getBills()
      .then((data) => setBills(data.filter((b) => b.billDate === today).sort((a, b) => b.id - a.id)))
      .catch(console.error);
  }, [today]);

  const totalSales = bills.reduce((s, b) => s + Number(b.netTotal ?? b.totalAmount), 0);
  const totalMargin = bills.reduce((s, b) => s + Number(b.netMargin ?? b.totalMargin ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Today's Sales</h1>
            <p className="text-slate-500">{formatDate(today)}</p>
          </div>
        </div>
        <button onClick={() => navigate("/billing")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium">
          New Bill
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-sm text-emerald-600">Net Sales</p>
          <p className="text-2xl font-bold text-emerald-900">₹{totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4">
          <p className="text-sm text-indigo-600">Net Margin</p>
          <p className="text-2xl font-bold text-indigo-900">₹{totalMargin.toFixed(2)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-slate-600">Bills</p>
          <p className="text-2xl font-bold text-slate-900">{bills.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              {["Bill No", "Time", "Payment", "Total", "Margin", "Net", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {bills.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No bills today</td></tr>
            ) : bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold">{bill.billNo || "INV-" + bill.id.toString().padStart(4, "0")}</td>
                <td className="px-4 py-3">{bill.billTime?.substring(0, 5)}</td>
                <td className="px-4 py-3">{bill.paymentMode}</td>
                <td className="px-4 py-3">₹{Number(bill.totalAmount).toFixed(2)}</td>
                <td className="px-4 py-3 text-emerald-600">₹{Number(bill.totalMargin || 0).toFixed(2)}</td>
                <td className="px-4 py-3 font-bold">₹{Number(bill.netTotal ?? bill.totalAmount).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/invoice/${bill.id}`)}
                    className="text-indigo-600 text-xs font-medium">Print</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
