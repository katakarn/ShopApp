import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { canAccessOrderReceipt } from "@/lib/access-control";
import { auth } from "@/lib/auth";
import { ORDER_RECEIPT_COOKIE, verifyOrderReceiptToken } from "@/lib/order-receipt";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

type CheckoutSuccessPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function CheckoutSuccessPage({ params }: CheckoutSuccessPageProps) {
  const session = await auth();
  const cookieStore = await cookies();
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });

  if (!order) {
    notFound();
  }

  const receiptToken = cookieStore.get(ORDER_RECEIPT_COOKIE)?.value;
  const canAccess = canAccessOrderReceipt({
    sessionUserId: session?.user?.id,
    sessionRole: session?.user?.role,
    orderUserId: order.userId,
    hasValidGuestReceiptToken: verifyOrderReceiptToken(receiptToken, order.id)
  });

  if (!canAccess) {
    notFound();
  }

  return (
    <section className="panel stack" style={{ maxWidth: "760px", marginInline: "auto" }}>
      <h1 className="page-title">Order Confirmed</h1>
      <p className="notice" role="status" aria-live="polite">
        Thanks for your purchase. Your order was placed successfully.
      </p>

      <div className="stack" style={{ gap: "6px" }}>
        <p style={{ margin: 0 }}>
          <strong>Order ID:</strong> {order.id}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Status:</strong> <span className={`badge ${order.status}`}>{order.status}</span>
        </p>
        <p style={{ margin: 0 }}>
          <strong>Total:</strong> {formatCurrency(Number(order.total))}
        </p>
      </div>

      <article className="panel stack">
        <h2>Items</h2>
        {order.items.map((item) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
            <span className="muted">
              {item.productName} x {item.quantity}
            </span>
            <strong>{formatCurrency(Number(item.unitPrice) * item.quantity)}</strong>
          </div>
        ))}
      </article>

      <div className="inline-form" style={{ justifyContent: "space-between" }}>
        <Link href="/" className="btn btn-outline">
          Continue shopping
        </Link>
        {session?.user ? (
          <Link href="/orders" className="btn">
            View my orders
          </Link>
        ) : (
          <Link href="/login" className="btn">
            Sign in to track orders
          </Link>
        )}
      </div>
    </section>
  );
}
