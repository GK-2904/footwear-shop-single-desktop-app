import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ShoppingBag, Lock } from "lucide-react";

export function Login() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!pin) {
      setError("Please enter your PIN");
      return;
    }
    setLoading(true);
    const success = await login(pin);
    setLoading(false);
    if (!success) {
      setError("Invalid PIN. Default PIN is 1234");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-xl mr-3">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Shivam Footwear</h1>
            <p className="text-sm text-slate-500">Shop Management System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter PIN to Login
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg tracking-widest"
                placeholder="••••"
                maxLength={8}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Open Shop"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Offline desktop app — no internet required
        </p>
      </div>
    </div>
  );
}
