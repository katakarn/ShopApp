import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await getOrdersForUser(session.user.id);
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <section className="stack orders-shell">
      <header className="orders-head">
        <p className="checkout-kicker">Order history</p>
        <h1 className="page-title">My orders</h1>
        <p className="muted">Track every purchase and shipping status from one place.</p>
      </header>

      {orders.length === 0 ? (
        <article className="panel empty-state">
          <h2>No orders yet</h2>
          <p className="muted">Complete your first checkout to start building order history.</p>
        </article>
      ) : (
        <div className="stack orders-list">
          {orders.map((order, index) => (
            <article
              key={order.id}
              className="panel order-card"
              style={{ animationDelay: `${Math.min(index, 10) * 70}ms` }}
            >
              <div className="order-card-head">
                <div>
                  <p className="muted order-date">{dateFormatter.format(order.createdAt)}</p>
                  <h2 className="order-code">Order {order.id.slice(0, 10)}...</h2>
                </div>
                <span className={`badge ${order.status}`}>{order.status}</span>
              </div>

              <div className="order-metrics">
                <p className="summary-row">
                  <span className="muted">Total</span>
                  <strong>{formatCurrency(Number(order.total))}</strong>
                </p>
                <p className="summary-row">
                  <span className="muted">Items</span>
                  <strong>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</strong>
                </p>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 3).map((item) => (
                  <span key={item.id} className="chip">
                    {item.productName} x {item.quantity}
                  </span>
                ))}
                {order.items.length > 3 ? <span className="chip">+{order.items.length - 3} more</span> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
