import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { StockManagement } from "./components/StockManagement";
import { Billing } from "./components/Billing";
import { BrandManagement } from "./components/BrandManagement";
import { Invoice } from "./components/Invoice"; // ✅ IMPORT HERE

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
        <Route path="/stock" element={<StockManagement />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/brands" element={<BrandManagement />} />

        {/* ✅ INVOICE ROUTE */}
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
