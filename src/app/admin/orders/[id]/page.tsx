"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface OrderDetail {
  id: string;
  createdAt: string;
  status: string;
  totalAmountRub: number;
  customerFullName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingCountry: string;
  shippingCity: string;
  shippingAddress1: string;
  shippingAddress2: string | null;
  shippingPostalCode: string | null;
  notes: string | null;
  card: {
    id: string;
    fullName: string;
    company: string | null;
    title: string | null;
    phone: string | null;
    email: string | null;
    model: string;
    color: string;
  };
  paymentMethod: { name: string; type: string };
}

const allStatuses = ["NEW", "PAID", "IN_PRODUCTION", "SHIPPED", "COMPLETED", "CANCELED"];
const statusColors: Record<string, string> = {
  NEW: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PAID: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  IN_PRODUCTION: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  SHIPPED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then(setOrder);
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder((prev) => prev ? { ...prev, status: updated.status } : null);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/admin" className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Admin
          </Link>
          <span className="text-white/30">/</span>
          <Link href="/admin/orders" className="text-white/70 hover:text-white transition">Orders</Link>
          <span className="text-white/30">/</span>
          <span className="text-white/50 text-sm font-mono">{order.id.slice(0, 8)}</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status + Actions */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-sm text-white/40">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${statusColors[order.status]}`}>
              {order.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {allStatuses.map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                disabled={updating || s === order.status}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  s === order.status
                    ? "opacity-50 cursor-default bg-white/5 border-white/10"
                    : "bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card Info */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <h2 className="text-lg font-semibold mb-4">Card Info</h2>
            <dl className="space-y-2 text-sm">
              <InfoRow label="Name" value={order.card.fullName} />
              <InfoRow label="Company" value={order.card.company} />
              <InfoRow label="Title" value={order.card.title} />
              <InfoRow label="Phone" value={order.card.phone} />
              <InfoRow label="Email" value={order.card.email} />
              <InfoRow label="Model" value={order.card.model} />
              <InfoRow label="Color" value={order.card.color} />
            </dl>
            <div className="mt-4">
              <Link
                href={`/ru/a/${order.card.id}`}
                target="_blank"
                className="text-sm text-teal-400 hover:text-teal-300 transition"
              >
                View Digital Card
              </Link>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <h2 className="text-lg font-semibold mb-4">Customer & Shipping</h2>
            <dl className="space-y-2 text-sm">
              <InfoRow label="Name" value={order.customerFullName} />
              <InfoRow label="Phone" value={order.customerPhone} />
              <InfoRow label="Email" value={order.customerEmail} />
              <InfoRow label="Country" value={order.shippingCountry} />
              <InfoRow label="City" value={order.shippingCity} />
              <InfoRow label="Address" value={order.shippingAddress1} />
              <InfoRow label="Address 2" value={order.shippingAddress2} />
              <InfoRow label="Postal" value={order.shippingPostalCode} />
              <InfoRow label="Payment" value={order.paymentMethod.name} />
              <InfoRow label="Amount" value={`${order.totalAmountRub} RUB`} />
              {order.notes && <InfoRow label="Notes" value={order.notes} />}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <dt className="text-white/40">{label}</dt>
      <dd className="text-white/80">{value}</dd>
    </div>
  );
}
