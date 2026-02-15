"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  active: boolean;
  instructions: string | null;
  sortOrder: number;
}

interface Settings {
  currency: string;
  basePriceRub: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({ currency: "RUB", basePriceRub: 1490 });
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // New method form
  const [newMethod, setNewMethod] = useState({
    name: "",
    type: "manual",
    instructions: "",
    sortOrder: 0,
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/payment-methods").then((r) => r.json()),
    ]).then(([s, m]) => {
      if (s) setSettings(s);
      setMethods(m);
    });
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) setMessage("Settings saved!");
    } finally {
      setSaving(false);
    }
  };

  const addMethod = async () => {
    const res = await fetch("/api/admin/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newMethod, active: true }),
    });
    if (res.ok) {
      const created = await res.json();
      setMethods((prev) => [...prev, created]);
      setNewMethod({ name: "", type: "manual", instructions: "", sortOrder: 0 });
      setShowAddForm(false);
    }
  };

  const toggleMethod = async (id: string, active: boolean) => {
    const res = await fetch(`/api/admin/payment-methods/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    if (res.ok) {
      setMethods((prev) =>
        prev.map((m) => (m.id === id ? { ...m, active: !active } : m))
      );
    }
  };

  const deleteMethod = async (id: string) => {
    if (!confirm("Delete this payment method?")) return;
    const res = await fetch(`/api/admin/payment-methods/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMethods((prev) => prev.filter((m) => m.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "Cannot delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/admin" className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Admin
          </Link>
          <span className="text-white/30">/</span>
          <span className="text-white/70">Settings</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Price Settings */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <h2 className="text-lg font-semibold mb-4">Pricing</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Base Price</label>
              <input
                type="number"
                value={settings.basePriceRub}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    basePriceRub: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-teal-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Currency</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, currency: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-teal-500/50 transition"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {message && <span className="text-sm text-green-400">{message}</span>}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Payment Methods</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-sm text-white/70 hover:bg-white/20 transition"
            >
              {showAddForm ? "Cancel" : "+ Add"}
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={newMethod.name}
                onChange={(e) => setNewMethod((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none"
              />
              <select
                value={newMethod.type}
                onChange={(e) => setNewMethod((p) => ({ ...p, type: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none"
              >
                <option value="manual">Manual</option>
                <option value="bank">Bank</option>
                <option value="card">Card</option>
                <option value="crypto">Crypto</option>
              </select>
              <input
                type="text"
                placeholder="Instructions (optional)"
                value={newMethod.instructions}
                onChange={(e) => setNewMethod((p) => ({ ...p, instructions: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none"
              />
              <input
                type="number"
                placeholder="Sort Order"
                value={newMethod.sortOrder}
                onChange={(e) => setNewMethod((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none"
              />
              <button
                onClick={addMethod}
                className="px-4 py-2 rounded-lg bg-teal-500/20 text-teal-400 text-sm font-medium hover:bg-teal-500/30 transition"
              >
                Add Method
              </button>
            </div>
          )}

          <div className="space-y-3">
            {methods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              >
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {method.name}
                    <span className="text-xs text-white/30 px-2 py-0.5 rounded bg-white/5">
                      {method.type}
                    </span>
                  </div>
                  {method.instructions && (
                    <div className="text-sm text-white/40 mt-1">{method.instructions}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMethod(method.id, method.active)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      method.active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {method.active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => deleteMethod(method.id)}
                    className="px-3 py-1 rounded-lg text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
