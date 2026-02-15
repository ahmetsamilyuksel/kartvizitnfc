"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Order {
  id: string;
  createdAt: string;
  status: string;
  totalAmountRub: number;
  customerFullName: string;
  customerPhone: string;
  card: { fullName: string; model: string; color: string };
  paymentMethod: { name: string };
}

const statuses = ["ALL", "NEW", "PAID", "IN_PRODUCTION", "SHIPPED", "COMPLETED", "CANCELED"];

const statusColors: Record<string, string> = {
  NEW: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PAID: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  IN_PRODUCTION: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  SHIPPED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    if (search) params.set("search", search);

    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  }, [filter, search]);

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              Admin
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white/70">Orders</span>
          </div>
          <Link href="/admin/settings" className="text-sm text-white/70 hover:text-white transition">
            Settings
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-teal-500/50 transition"
          />
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  filter === s
                    ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                    : "bg-white/5 text-white/50 border border-white/10 hover:text-white/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-white/40">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-white/40">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 text-sm text-white/40 font-medium">Card</th>
                    <th className="text-left px-4 py-3 text-sm text-white/40 font-medium">Customer</th>
                    <th className="text-left px-4 py-3 text-sm text-white/40 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-sm text-white/40 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 text-sm text-white/40 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.03] transition">
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="text-teal-400 hover:text-teal-300">
                          {order.card.fullName}
                        </Link>
                        <div className="text-xs text-white/30">{order.card.model} / {order.card.color}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{order.customerFullName}</div>
                        <div className="text-xs text-white/40">{order.customerPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${statusColors[order.status] || statusColors.NEW}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{order.totalAmountRub} RUB</td>
                      <td className="px-4 py-3 text-sm text-white/40">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
