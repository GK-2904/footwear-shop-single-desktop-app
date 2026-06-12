import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileSpreadsheet } from "lucide-react";
import { storageService } from "../services/storage";
import { Bill } from "../types/models";
import { formatDate } from "../constants/productOptions";

export function MonthlyReport() {
  const navigate = useNavigate();
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [bills, setBills] = useState<Bill[]>([]);
  const [dailyBreakdown, setDailyBreakdown] = useState<{ date: string; sales: number; margin: number; count: number }[]>([]);

  useEffect(() => {
    storageService.getBills().then((data) => {
      const [y, m] = month.split("-").map(Number);
      const filtered = data.filter((b) => {
        const [by, bm] = b.billDate.split("-").map(Number);
        return by === y && bm === m;
      });
      setBills(filtered);

      const byDay = new Map<string, { sales: number; margin: number; count: number }>();
      for (const bill of filtered) {
        const cur = byDay.get(bill.billDate) || { sales: 0, margin: 0, count: 0 };
        cur.sales += Number(bill.netTotal ?? bill.totalAmount);
        cur.margin += Number(bill.netMargin ?? bill.totalMargin ?? 0);
        cur.count += 1;
        byDay.set(bill.billDate, cur);
      }
      setDailyBreakdown(
        Array.from(byDay.entries())
          .map(([date, v]) => ({ date, ...v }))
          .sort((a, b) => a.date.localeCompare(b.date))
      );
    }).catch(console.error);
  }, [month]);

  const [y, m] = month.split("-").map(Number);
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const to = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const totalSales = bills.reduce((s, b) => s + Number(b.netTotal ?? b.totalAmount), 0);
  const totalMargin = bills.reduce((s, b) => s + Number(b.netMargin ?? b.totalMargin ?? 0), 0);

  const exportFile = async (type: "pdf" | "excel") => {
    try {
      const blob = type === "pdf"
        ? await storageService.downloadSalesPdf(from, to)
        : await storageService.downloadSalesExcel(from, to);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `monthly-report-${month}.${type === "pdf" ? "pdf" : "xlsx"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/reports")} className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Monthly Report</h1>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
              className="mt-1 border rounded-lg px-3 py-1.5 text-sm" />
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

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4"><p className="text-sm text-emerald-600">Month Net Sales</p><p className="text-2xl font-bold">₹{totalSales.toFixed(2)}</p></div>
        <div className="bg-indigo-50 rounded-xl p-4"><p className="text-sm text-indigo-600">Month Net Margin</p><p className="text-2xl font-bold">₹{totalMargin.toFixed(2)}</p></div>
        <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-600">Total Bills</p><p className="text-2xl font-bold">{bills.length}</p></div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 border-b bg-slate-50 font-semibold">Day-wise Breakdown</div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              {["Date", "Bills", "Net Sales", "Net Margin"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {dailyBreakdown.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No sales this month</td></tr>
            ) : dailyBreakdown.map((row) => (
              <tr key={row.date} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{formatDate(row.date)}</td>
                <td className="px-4 py-3">{row.count}</td>
                <td className="px-4 py-3 font-bold">₹{row.sales.toFixed(2)}</td>
                <td className="px-4 py-3 text-emerald-600">₹{row.margin.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
