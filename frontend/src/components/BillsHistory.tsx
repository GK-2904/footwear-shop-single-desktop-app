import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { storageService } from "../services/storage";
import { Bill } from "../types/models";
import { formatDate, PAYMENT_MODES } from "../constants/productOptions";
import { FileText, Search, Download, FileSpreadsheet } from "lucide-react";

export function BillsHistory() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(
    searchParams.get("from") === "today" ? today : searchParams.get("from") || ""
  );
  const [toDate, setToDate] = useState(
    searchParams.get("to") === "today" ? today : searchParams.get("to") || ""
  );
  const [paymentFilter, setPaymentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadBills(); }, []);

  const loadBills = async () => {
    try {
      const data = await storageService.getBills();
      setBills(data.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error("Failed to load bills", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = bills.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = b.id.toString().includes(q) || (b.billNo && b.billNo.toLowerCase().includes(q)) || b.paymentMode?.toLowerCase().includes(q) ||
      formatDate(b.billDate).includes(q);
    const matchFrom = !fromDate || b.billDate >= fromDate;
    const matchTo = !toDate || b.billDate <= toDate;
    const matchPayment = !paymentFilter || b.paymentMode === paymentFilter;
    return matchSearch && matchFrom && matchTo && matchPayment;
  });

  const exportFile = async (type: "pdf" | "excel") => {
    const from = fromDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0];
    const to = toDate || new Date().toISOString().split("T")[0];
    try {
      const blob = type === "pdf"
        ? await storageService.downloadSalesPdf(from, to, paymentFilter || undefined)
        : await storageService.downloadSalesExcel(from, to, paymentFilter || undefined);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-report-${from}-to-${to}.${type === "pdf" ? "pdf" : "xlsx"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed. Make sure date range is set.");
    }
  };

  const totalSales = filtered.reduce((s, b) => s + Number(b.netTotal ?? b.totalAmount), 0);
  const totalMargin = filtered.reduce((s, b) => s + Number(b.netMargin ?? b.totalMargin ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Sales Register</h1>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-medium text-sm">
          <FileText className="w-4 h-4" /> {filtered.length} Bills
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-slate-500">From Date</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-xs text-slate-500">To Date</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-xs text-slate-500">Payment</label>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1">
            <option value="">All</option>
            {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button onClick={() => exportFile("pdf")}
            className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => exportFile("excel")}
            className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 rounded-xl p-4">
          <p className="text-sm text-indigo-600">Filtered Net Sales</p>
          <p className="text-2xl font-bold text-indigo-900">₹{totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-sm text-emerald-600">Filtered Net Margin</p>
          <p className="text-2xl font-bold text-emerald-900">₹{totalMargin.toFixed(2)}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bill no. or date..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? <p className="p-8 text-center text-slate-500">Loading...</p> : filtered.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No bills found</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                {["Bill No.", "Date", "Time", "Payment", "Total", "Margin", "Returned", "Net", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold">{bill.billNo || "INV-" + bill.id.toString().padStart(4, "0")}</td>
                  <td className="px-4 py-3">{formatDate(bill.billDate)}</td>
                  <td className="px-4 py-3">{bill.billTime?.substring(0, 5)}</td>
                  <td className="px-4 py-3"><span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{bill.paymentMode}</span></td>
                  <td className="px-4 py-3 font-medium">₹{Number(bill.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-emerald-600">₹{Number(bill.totalMargin || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-red-600">{(bill.totalReturned || 0) > 0 ? `₹${Number(bill.totalReturned).toFixed(2)}` : "-"}</td>
                  <td className="px-4 py-3 font-bold">₹{Number(bill.netTotal ?? bill.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/bills/${bill.id}`)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-xs mr-2">View / Return</button>
                    <button onClick={() => navigate(`/invoice/${bill.id}`)}
                      className="text-slate-500 hover:text-slate-700 text-xs">Print</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
