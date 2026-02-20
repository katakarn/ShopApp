import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import { updateProductAction } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AdminEditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  });

  if (!product) {
    redirect("/admin/products?error=not-found");
  }

  return (
    <section className="panel stack admin-edit-shell">
      <header className="admin-head">
        <p className="checkout-kicker">Admin panel</p>
        <h1 className="page-title">Edit product</h1>
        <p className="muted">Fine-tune pricing, stock, visibility, and product metadata.</p>
      </header>

      <form action={updateProductAction} className="stack admin-form">
        <input type="hidden" name="productId" value={product.id} />

        <div className="admin-form-grid">
          <label>
            Product name
            <input name="name" required minLength={2} defaultValue={product.name} />
          </label>

          <label>
            Category
            <input
              name="categorySlug"
              required
              defaultValue={product.category?.slug ?? product.category?.name ?? "general"}
            />
          </label>
        </div>

        <label>
          Description
          <textarea name="description" required minLength={10} defaultValue={product.description} />
        </label>

        <div className="admin-form-grid">
          <label>
            Price (USD)
            <input
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              required
              defaultValue={Number(product.price)}
            />
          </label>

          <label>
            Inventory
            <input name="inventory" type="number" min="0" step="1" required defaultValue={product.inventory} />
          </label>
        </div>

        <div className="admin-form-grid">
          <label>
            Image URL
            <input name="imageUrl" type="url" defaultValue={product.imageUrl ?? ""} placeholder="https://..." />
          </label>

          <label>
            Status
            <select name="isActive" defaultValue={product.isActive ? "true" : "false"}>
              <option value="true">Active</option>
              <option value="false">Hidden</option>
            </select>
          </label>
        </div>

        <div className="inline-form admin-edit-actions">
          <Link href="/admin/products" className="btn btn-outline">
            Back
          </Link>
          <SubmitButton className="btn">Save changes</SubmitButton>
        </div>
      </form>
    </section>
  );
}
