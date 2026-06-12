import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileSpreadsheet } from "lucide-react";
import { storageService } from "../services/storage";
import { Bill } from "../types/models";
import { formatDate } from "../constants/productOptions";

export function DailyReport() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    storageService.getBills()
      .then((data) => setBills(data.filter((b) => b.billDate === today)))
      .catch(console.error);
  }, [today]);

  const totalSales = bills.reduce((s, b) => s + Number(b.netTotal ?? b.totalAmount), 0);
  const totalMargin = bills.reduce((s, b) => s + Number(b.netMargin ?? b.totalMargin ?? 0), 0);
  const totalReturned = bills.reduce((s, b) => s + Number(b.totalReturned ?? 0), 0);
  const cashTotal = bills.filter((b) => b.paymentMode === "CASH").reduce((s, b) => s + Number(b.netTotal ?? b.totalAmount), 0);
  const upiTotal = bills.filter((b) => b.paymentMode === "UPI").reduce((s, b) => s + Number(b.netTotal ?? b.totalAmount), 0);

  const exportFile = async (type: "pdf" | "excel") => {
    try {
      const blob = type === "pdf"
        ? await storageService.downloadSalesPdf(today, today)
        : await storageService.downloadSalesExcel(today, today);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily-report-${today}.${type === "pdf" ? "pdf" : "xlsx"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/reports")} className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Daily Report</h1>
            <p className="text-slate-500">{formatDate(today)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportFile("pdf")}
            className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => exportFile("excel")}
            className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4"><p className="text-sm text-emerald-600">Net Sales</p><p className="text-2xl font-bold">₹{totalSales.toFixed(2)}</p></div>
        <div className="bg-indigo-50 rounded-xl p-4"><p className="text-sm text-indigo-600">Net Margin</p><p className="text-2xl font-bold">₹{totalMargin.toFixed(2)}</p></div>
        <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-600">Cash / UPI</p><p className="text-lg font-bold">₹{cashTotal.toFixed(0)} / ₹{upiTotal.toFixed(0)}</p></div>
        <div className="bg-red-50 rounded-xl p-4"><p className="text-sm text-red-600">Returns</p><p className="text-2xl font-bold">₹{totalReturned.toFixed(2)}</p></div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              {["Bill No", "Time", "Payment", "Total", "Margin", "Returned", "Net"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {bills.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No sales today</td></tr>
            ) : bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold">{bill.billNo || "INV-" + bill.id.toString().padStart(4, "0")}</td>
                <td className="px-4 py-3">{bill.billTime?.substring(0, 5)}</td>
                <td className="px-4 py-3">{bill.paymentMode}</td>
                <td className="px-4 py-3">₹{Number(bill.totalAmount).toFixed(2)}</td>
                <td className="px-4 py-3 text-emerald-600">₹{Number(bill.totalMargin || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-red-600">{(bill.totalReturned || 0) > 0 ? `₹${Number(bill.totalReturned).toFixed(2)}` : "-"}</td>
                <td className="px-4 py-3 font-bold">₹{Number(bill.netTotal ?? bill.totalAmount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
