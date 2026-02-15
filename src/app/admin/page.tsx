import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/admin/login");

  const [totalOrders, newOrders, paidOrders, completedOrders, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "NEW" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          card: { select: { fullName: true } },
          paymentMethod: { select: { name: true } },
        },
      }),
    ]);

  const metrics = [
    { label: "Total Orders", value: totalOrders, color: "text-white" },
    { label: "New", value: newOrders, color: "text-yellow-400" },
    { label: "Paid", value: paidOrders, color: "text-blue-400" },
    { label: "Completed", value: completedOrders, color: "text-green-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <div className="flex gap-4">
            <Link href="/admin/orders" className="text-sm text-white/70 hover:text-white transition">
              Orders
            </Link>
            <Link href="/admin/settings" className="text-sm text-white/70 hover:text-white transition">
              Settings
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((m) => (
            <div key={m.label} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-sm text-white/50 mb-1">{m.label}</div>
              <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-teal-400 hover:text-teal-300 transition">
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-white/40">No orders yet</div>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.03] transition"
                >
                  <div>
                    <div className="font-medium">{order.card.fullName}</div>
                    <div className="text-sm text-white/50">
                      {order.customerFullName} &middot; {order.paymentMethod.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-sm text-white/40">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    NEW: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    PAID: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    IN_PRODUCTION: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    SHIPPED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
    CANCELED: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${colors[status] || colors.NEW}`}>
      {status}
    </span>
  );
}
