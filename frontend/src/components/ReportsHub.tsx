import { useNavigate } from "react-router-dom";
import { BarChart3, Calendar, CalendarDays } from "lucide-react";

export function ReportsHub() {
  const navigate = useNavigate();

  const reports = [
    {
      title: "Daily Report",
      desc: "Today's sales, margin, bills and export",
      icon: Calendar,
      path: "/reports/daily",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Monthly Report",
      desc: "Month-wise sales breakdown and export",
      icon: CalendarDays,
      path: "/reports/monthly",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Reports</h1>
          <p className="text-slate-500">Sales and margin reports for your shop</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <button key={r.path} onClick={() => navigate(r.path)}
              className="bg-white rounded-2xl border p-6 text-left hover:shadow-md hover:border-indigo-200 transition-all group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${r.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600">{r.title}</h2>
              <p className="text-slate-500 mt-1">{r.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
