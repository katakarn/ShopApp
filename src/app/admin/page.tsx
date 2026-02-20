import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminStats } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const stats = await getAdminStats();

  return (
    <section className="stack admin-shell">
      <header className="admin-head">
        <p className="checkout-kicker">Admin panel</p>
        <h1 className="page-title">Operations dashboard</h1>
        <p className="muted">Monitor catalog health, order volume, and revenue in real time.</p>
      </header>

      <div className="grid admin-stat-grid">
        <article className="panel metric-card" style={{ animationDelay: "40ms" }}>
          <p className="muted">Products</p>
          <h2>{stats.productCount.toLocaleString()}</h2>
        </article>

        <article className="panel metric-card" style={{ animationDelay: "100ms" }}>
          <p className="muted">Orders</p>
          <h2>{stats.orderCount.toLocaleString()}</h2>
        </article>

        <article className="panel metric-card" style={{ animationDelay: "160ms" }}>
          <p className="muted">Paid revenue</p>
          <h2>{formatCurrency(stats.paidRevenue)}</h2>
        </article>
      </div>

      <div className="panel admin-actions">
        <Link href="/admin/products" className="btn">
          Manage products
        </Link>
        <Link href="/admin/orders" className="btn btn-outline">
          Manage orders
        </Link>
      </div>
    </section>
  );
}
