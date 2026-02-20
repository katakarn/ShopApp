import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import { auth } from "@/lib/auth";
import { getAllOrdersForAdmin } from "@/lib/queries";
import { updateOrderStatusAction } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";

type AdminOrdersPageProps = {
  searchParams?: Promise<{ updated?: string; error?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [orders, params] = await Promise.all([
    getAllOrdersForAdmin(),
    searchParams ? searchParams : Promise.resolve(undefined)
  ]);

  return (
    <section className="stack admin-shell">
      <header className="admin-head">
        <p className="checkout-kicker">Admin panel</p>
        <h1 className="page-title">Manage orders</h1>
        <p className="muted">Update fulfillment status and monitor customer purchase activity.</p>
      </header>
      {params?.updated ? (
        <p className="notice" role="status" aria-live="polite">
          Order status updated.
        </p>
      ) : null}
      {params?.error ? (
        <p className="error-text" role="alert" aria-live="assertive">
          Unable to update order status.
        </p>
      ) : null}

      <article className="panel admin-table-wrap">
        {orders.length === 0 ? <p className="muted">No orders yet.</p> : null}
        <table className="table admin-table">
          <caption className="sr-only">Admin orders table</caption>
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Date</th>
              <th scope="col">Customer</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
              <th scope="col">Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id} style={{ animationDelay: `${Math.min(index, 14) * 40}ms` }}>
                <td>{order.id.slice(0, 10)}...</td>
                <td>{new Date(order.createdAt).toLocaleDateString("en-US")}</td>
                <td>
                  <strong>{order.shippingName}</strong>
                  <div className="muted">{order.email}</div>
                </td>
                <td>{formatCurrency(Number(order.total))}</td>
                <td>
                  <span className={`badge ${order.status}`}>{order.status}</span>
                </td>
                <td>
                  <form action={updateOrderStatusAction} className="inline-form admin-inline-form">
                    <input type="hidden" name="orderId" value={order.id} />
                    <select name="status" defaultValue={order.status}>
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <SubmitButton className="btn btn-outline">Save</SubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
