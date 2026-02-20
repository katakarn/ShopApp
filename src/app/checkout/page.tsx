import { redirect } from "next/navigation";
import { checkoutAction } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { getCartSubtotal, getCurrentCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";
import { SubmitButton } from "@/components/submit-button";

type CheckoutPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const [session, cart, params] = await Promise.all([
    auth(),
    getCurrentCart(),
    searchParams ? searchParams : Promise.resolve(undefined)
  ]);

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const total = getCartSubtotal(cart);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="two-col checkout-layout">
      <section className="panel stack checkout-stage">
        <header className="checkout-heading">
          <p className="checkout-kicker">Checkout</p>
          <h1 className="page-title">Shipping and payment details</h1>
          <p className="muted">One final step and your order is ready.</p>
        </header>

        {params?.error === "invalid" ? (
          <p className="notice" role="alert" aria-live="assertive">
            Please fill all required fields correctly.
          </p>
        ) : null}

        <form action={checkoutAction} className="stack checkout-form">
          <div className="checkout-grid">
            <label>
              Full name
              <input name="shippingName" required minLength={2} defaultValue={session?.user?.name ?? ""} />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                required
                defaultValue={session?.user?.email ?? ""}
                placeholder="customer@example.com"
              />
            </label>
          </div>

          <label>
            Street address
            <input name="shippingAddress" required minLength={5} placeholder="123 Main St" />
          </label>

          <div className="checkout-grid">
            <label>
              City
              <input name="shippingCity" required minLength={2} />
            </label>

            <label>
              Postal code
              <input name="shippingPostalCode" required minLength={2} />
            </label>
          </div>

          <label>
            Country
            <input name="shippingCountry" required minLength={2} />
          </label>

          <div className="checkout-actions">
            <SubmitButton className="btn">Place order (mock payment)</SubmitButton>
            <p className="muted">This demo uses a simulated payment flow.</p>
          </div>
        </form>
      </section>

      <aside className="panel stack summary-panel">
        <h2>Order Summary</h2>
        <p className="summary-row">
          <span className="muted">Items in order</span>
          <strong>{itemCount}</strong>
        </p>

        <div className="stack summary-items">
          {cart.items.map((item, index) => (
            <div
              key={item.id}
              className="summary-item"
              style={{ animationDelay: `${Math.min(index, 8) * 65}ms` }}
            >
              <span className="summary-label">
                {item.product.name} x {item.quantity}
              </span>
              <strong className="summary-price">{formatCurrency(Number(item.product.price) * item.quantity)}</strong>
            </div>
          ))}
        </div>

        <div className="summary-row summary-total">
          <span>Total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>

        <ul className="checkout-safe-list muted">
          <li>Inventory is checked before order creation.</li>
          <li>Shipping details are stored with the order.</li>
          <li>You can track status from your orders page.</li>
        </ul>
      </aside>
    </div>
  );
}
