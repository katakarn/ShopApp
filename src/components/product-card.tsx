import Image from "next/image";
import Link from "next/link";
import { addToCartAction } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";
import { SubmitButton } from "@/components/submit-button";

type ProductCardProps = {
  id: string;
  index: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  imageUrl?: string | null;
};

export function ProductCard({
  id,
  index,
  slug,
  name,
  description,
  price,
  inventory,
  imageUrl
}: ProductCardProps) {
  const isOutOfStock = inventory <= 0;
  const isLowStock = inventory > 0 && inventory <= 5;
  const stockLabel = isOutOfStock ? "Out of stock" : isLowStock ? `Only ${inventory} left` : `${inventory} in stock`;

  return (
    <article className="card product-card" style={{ animationDelay: `${Math.min(index, 10) * 80}ms` }}>
      <Link href={`/products/${slug}`} className="card-media">
        <Image
          src={imageUrl ?? "https://placehold.co/800x500?text=Product"}
          alt={name}
          className="product-image"
          width={800}
          height={500}
        />
      </Link>

      <div className="card-content">
        <div className="card-top">
          <h3>
            <Link href={`/products/${slug}`}>{name}</Link>
          </h3>
          <strong className="card-price">{formatCurrency(price)}</strong>
        </div>

        <p className="muted card-description">{description}</p>

        <form action={addToCartAction} className="card-actions">
          <input type="hidden" name="productId" value={id} />
          <input type="hidden" name="quantity" value="1" />
          <SubmitButton className="btn" disabled={isOutOfStock}>
            {isOutOfStock ? "Unavailable" : "Add to cart"}
          </SubmitButton>
          <span className={`stock-badge ${isOutOfStock ? "out" : isLowStock ? "low" : ""}`}>{stockLabel}</span>
        </form>
      </div>
    </article>
  );
}
