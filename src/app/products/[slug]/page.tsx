import Image from "next/image";
import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import { addToCartAction } from "@/lib/actions";
import { getProductBySlug } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isActive) {
    notFound();
  }

  return (
    <div className="two-col">
      <div className="panel">
        <Image
          src={product.imageUrl ?? "https://placehold.co/1200x800?text=Product"}
          alt={product.name}
          className="product-image"
          style={{ height: "380px", width: "100%" }}
          width={1200}
          height={800}
        />
      </div>

      <div className="panel stack">
        <div>
          <p className="muted">{product.category?.name ?? "General"}</p>
          <h1 className="page-title">{product.name}</h1>
          <p>{product.description}</p>
        </div>

        <strong>{formatCurrency(Number(product.price))}</strong>
        <p className="muted">{product.inventory} in stock</p>

        <form action={addToCartAction} className="inline-form">
          <input type="hidden" name="productId" value={product.id} />
          <label>
            Quantity
            <input type="number" name="quantity" min={1} max={Math.max(1, product.inventory)} defaultValue={1} />
          </label>
          <SubmitButton className="btn">Add to cart</SubmitButton>
        </form>
      </div>
    </div>
  );
}
