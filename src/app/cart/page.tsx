import Image from "next/image";
import Link from "next/link";
import { removeCartItemAction, updateCartItemAction } from "@/lib/actions";
import { getCartSubtotal, getCurrentCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";
import { SubmitButton } from "@/components/submit-button";

type CartPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const cart = await getCurrentCart();
  const params = searchParams ? await searchParams : undefined;
  const subtotal = getCartSubtotal(cart);
  const itemCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  if (!cart || cart.items.length === 0) {
    return (
      <section className="panel stack empty-state">
        <h1 className="page-title">Your cart is empty</h1>
        <p className="muted">Add products from the shop to start checkout.</p>
        <Link href="/" className="btn" style={{ width: "fit-content" }}>
          Explore products
        </Link>
      </section>
    );
  }

  return (
    <div className="two-col cart-layout">
      <section className="panel stack cart-stage">
        <header className="cart-head">
          <div>
            <p className="checkout-kicker">Shopping cart</p>
            <h1 className="page-title cart-headline">Review your picks</h1>
          </div>
          <span className="chip cart-count">{itemCount} item{itemCount === 1 ? "" : "s"}</span>
        </header>

        {params?.error === "inventory" ? (
          <p className="notice" role="alert" aria-live="assertive">
            Some items exceeded stock level. Please review quantities and retry.
          </p>
        ) : null}

        <div className="stack cart-list">
          {cart.items.map((item, index) => (
            <article
              key={item.id}
              className="cart-item cart-item-card"
              style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
            >
              <Image
                src={item.product.imageUrl ?? "https://placehold.co/240x180?text=Item"}
                alt={item.product.name}
                className="product-image cart-thumb"
                width={240}
                height={180}
              />

              <div className="stack cart-details" style={{ gap: "4px" }}>
                <strong className="cart-product">{item.product.name}</strong>
                <span className="muted cart-price">{formatCurrency(Number(item.product.price))}</span>
                <span className="muted cart-meta">
                  Line total {formatCurrency(Number(item.product.price) * item.quantity)}
                </span>
              </div>

              <div className="stack cart-controls" style={{ justifyItems: "end" }}>
                <form action={updateCartItemAction} className="qty-form cart-qty-form">
                  <input type="hidden" name="itemId" value={item.id} />
                  <label className="sr-only" htmlFor={`cart-qty-${item.id}`}>
                    Quantity for {item.product.name}
                  </label>
                  <input
                    id={`cart-qty-${item.id}`}
                    type="number"
                    name="quantity"
                    min={1}
                    max={Math.max(1, item.product.inventory)}
                    defaultValue={item.quantity}
                  />
                  <SubmitButton className="btn btn-outline">Update</SubmitButton>
                </form>

                <form action={removeCartItemAction} className="cart-remove-form">
                  <input type="hidden" name="itemId" value={item.id} />
                  <SubmitButton className="btn btn-danger">Remove</SubmitButton>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="panel stack summary-panel">
        <h2>Summary</h2>
        <div className="stack summary-lines" style={{ gap: "6px" }}>
          <p className="summary-row">
            <span className="muted">Items</span>
            <strong>{itemCount}</strong>
          </p>
          <p className="summary-row">
            <span className="muted">Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </p>
          <p className="summary-row">
            <span className="muted">Shipping</span>
            <strong>Calculated next step</strong>
          </p>
          <p className="summary-row summary-total">
            <span>Total estimate</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </p>
        </div>

        <p className="muted summary-note">Stocks are confirmed during checkout.</p>
        <Link href="/checkout" className="btn" style={{ width: "100%", textAlign: "center" }}>
          Continue to checkout
        </Link>
        <Link href="/" className="btn btn-outline" style={{ width: "100%", textAlign: "center" }}>
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
