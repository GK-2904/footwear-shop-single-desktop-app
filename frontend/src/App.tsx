import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { StockManagement } from "./components/StockManagement";
import { Billing } from "./components/Billing";
import { BrandManagement } from "./components/BrandManagement";
import { Invoice } from "./components/Invoice";
import { BillsHistory } from "./components/BillsHistory";
import { BillDetail } from "./components/BillDetail";
import { ReadyForSale } from "./components/ReadyForSale";
import { Settings } from "./components/Settings";
import { ReportsHub } from "./components/ReportsHub";
import { DailyReport } from "./components/DailyReport";
import { MonthlyReport } from "./components/MonthlyReport";
import { SalesTodayDetail } from "./components/SalesTodayDetail";
import { StockOverviewDetail } from "./components/StockOverviewDetail";
import { LowStockDetail } from "./components/LowStockDetail";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/sales-today" element={<SalesTodayDetail />} />
        <Route path="/dashboard/stock-overview" element={<StockOverviewDetail />} />
        <Route path="/dashboard/low-stock" element={<LowStockDetail />} />
        <Route path="/reports" element={<ReportsHub />} />
        <Route path="/reports/daily" element={<DailyReport />} />
        <Route path="/reports/monthly" element={<MonthlyReport />} />
        <Route path="/stock" element={<StockManagement />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/brands" element={<BrandManagement />} />
        <Route path="/bills" element={<BillsHistory />} />
        <Route path="/bills/:id" element={<BillDetail />} />
        <Route path="/ready-for-sale" element={<ReadyForSale />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/invoice/:id" element={<Invoice />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
