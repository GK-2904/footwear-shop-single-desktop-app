import { useEffect, useState } from "react";
import { API_BASE } from "../services/api";
import { Settings as SettingsIcon, Save, Database, CheckCircle, Calendar } from "lucide-react";
import { financialYearService, FinancialYear } from "../services/financialYearService";

interface ShopSettings {
  name: string;
  address: string;
  phone: string;
  gstin: string;
  pin: string;
}

interface DataInfo {
  dataPath: string;
  backupPath: string;
  databaseExists: boolean;
}

export function Settings() {
  const [settings, setSettings] = useState<ShopSettings>({
    name: "Shivam Footwear Shop",
    address: "",
    phone: "",
    gstin: "",
    pin: "1234",
  });
  const [dataInfo, setDataInfo] = useState<DataInfo | null>(null);
  const [backups, setBackups] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  // Financial Year States
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [newFyName, setNewFyName] = useState("");
  const [newFyStart, setNewFyStart] = useState("");
  const [newFyEnd, setNewFyEnd] = useState("");
  const [fyMessage, setFyMessage] = useState("");
  const [creatingFy, setCreatingFy] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadFinancialYears = async () => {
    try {
      const list = await financialYearService.getAll();
      setFinancialYears(list);
    } catch (err) {
      console.error("Failed to load financial years", err);
    }
  };

  const loadAll = async () => {
    try {
      const [s, info, list] = await Promise.all([
        fetch(`${API_BASE}/settings`).then((r) => r.json()),
        fetch(`${API_BASE}/backup/info`).then((r) => r.json()),
        fetch(`${API_BASE}/backup/list`).then((r) => r.json()),
      ]);
      setSettings(s);
      setDataInfo(info);
      setBackups(list);
      await loadFinancialYears();
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("Settings saved successfully!");
    } catch {
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const createBackup = async () => {
    setBackingUp(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/backup`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Backup failed");
      setMessage(`Backup created: ${data.files?.join(", ") || "success"}`);
      loadAll();
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Backup failed");
    } finally {
      setBackingUp(false);
    }
  };

  const handleCreateFy = async () => {
    if (!newFyName || !newFyStart || !newFyEnd) {
      setFyMessage("All fields are required");
      return;
    }
    setCreatingFy(true);
    setFyMessage("");
    try {
      await financialYearService.create({
        name: newFyName,
        startDate: newFyStart,
        endDate: newFyEnd,
      });
      setFyMessage("Financial year created successfully!");
      setNewFyName("");
      setNewFyStart("");
      setNewFyEnd("");
      loadFinancialYears();
    } catch (err) {
      setFyMessage(err instanceof Error ? err.message : "Failed to create financial year");
    } finally {
      setCreatingFy(false);
    }
  };

  const handleActivateFy = async (id: number) => {
    try {
      await financialYearService.activate(id);
      setFyMessage("Financial year activated! Reloading...");
      loadFinancialYears();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setFyMessage("Failed to activate financial year");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Settings</h1>

      {message && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      {/* Shop Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-600" />
          Shop Details (shown on invoice)
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Shop Name</label>
            <input
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Address</label>
            <input
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Phone</label>
              <input
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">GSTIN</label>
              <input
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Login PIN</label>
            <input
              type="password"
              value={settings.pin}
              onChange={(e) => setSettings({ ...settings, pin: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none max-w-xs"
            />
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Backup */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Data Backup
        </h2>

        {dataInfo && (
          <div className="text-sm text-slate-600 space-y-1 bg-slate-50 p-4 rounded-xl">
            <p><span className="font-medium">Data folder:</span> {dataInfo.dataPath}</p>
            <p><span className="font-medium">Backup folder:</span> {dataInfo.backupPath}</p>
            <p>
              <span className="font-medium">Database:</span>{" "}
              {dataInfo.databaseExists ? "Active" : "Will be created on first use"}
            </p>
          </div>
        )}

        <button
          onClick={createBackup}
          disabled={backingUp}
          className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <Database className="w-4 h-4" />
          {backingUp ? "Creating backup..." : "Backup Now"}
        </button>

        {backups.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">Recent backups:</p>
            <ul className="text-sm text-slate-500 space-y-1 max-h-32 overflow-y-auto">
              {backups.slice(0, 10).map((b) => (
                <li key={b} className="font-mono text-xs bg-slate-50 px-3 py-1.5 rounded-lg">{b}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-slate-400">
          Tip: Backup every week. All shop data is stored in the data/ folder.
        </p>
      </div>

      {/* Financial Year Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Financial Years (Fiscal Years)
        </h2>

        {fyMessage && (
          <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 rounded-xl text-sm">
            {fyMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-600">Configured Years</p>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y">
              {financialYears.length === 0 ? (
                <p className="p-4 text-center text-slate-400 text-sm">No financial years found</p>
              ) : (
                financialYears.map((fy) => (
                  <div key={fy.id} className="p-3 flex justify-between items-center text-sm hover:bg-slate-50">
                    <div>
                      <p className="font-bold flex items-center gap-2">
                        {fy.name}
                        {fy.isActive && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-semibold">Active</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {fy.startDate} to {fy.endDate}
                      </p>
                    </div>
                    {!fy.isActive && (
                      <button
                        onClick={() => handleActivateFy(fy.id)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Form */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <p className="text-sm font-semibold text-slate-600">Create Financial Year</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 font-medium">FY Name (e.g. FY 2026-27)</label>
                <input
                  placeholder="FY YYYY-YY"
                  value={newFyName}
                  onChange={(e) => setNewFyName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-white text-sm outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 font-medium">Start Date</label>
                  <input
                    type="date"
                    value={newFyStart}
                    onChange={(e) => setNewFyStart(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg bg-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium">End Date</label>
                  <input
                    type="date"
                    value={newFyEnd}
                    onChange={(e) => setNewFyEnd(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg bg-white text-sm outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateFy}
                disabled={creatingFy}
                className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {creatingFy ? "Creating..." : "Create Year"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
