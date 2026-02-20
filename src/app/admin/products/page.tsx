import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import { createProductAction, deleteProductAction } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { getAllProductsForAdmin } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

type AdminProductsPageProps = {
  searchParams?: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [products, params] = await Promise.all([
    getAllProductsForAdmin(),
    searchParams ? searchParams : Promise.resolve(undefined)
  ]);

  return (
    <section className="stack admin-shell">
      <header className="admin-head">
        <p className="checkout-kicker">Admin panel</p>
        <h1 className="page-title">Manage products</h1>
        <p className="muted">Create, update, hide, and clean up catalog inventory.</p>
      </header>

      {params?.created ? (
        <p className="notice" role="status" aria-live="polite">
          Product created.
        </p>
      ) : null}
      {params?.updated ? (
        <p className="notice" role="status" aria-live="polite">
          Product updated.
        </p>
      ) : null}
      {params?.deleted ? (
        <p className="notice" role="status" aria-live="polite">
          Product deleted.
        </p>
      ) : null}
      {params?.error === "invalid" ? (
        <p className="error-text" role="alert" aria-live="assertive">
          Unable to process request. Check form values.
        </p>
      ) : null}
      {params?.error === "not-found" ? (
        <p className="error-text" role="alert" aria-live="assertive">
          Product not found.
        </p>
      ) : null}
      {params?.error === "has-orders" ? (
        <p className="error-text" role="alert" aria-live="assertive">
          Cannot delete product because it already has order history.
        </p>
      ) : null}

      <article className="panel stack admin-form-panel">
        <h2>Add product</h2>

        <form action={createProductAction} className="stack admin-form">
          <div className="admin-form-grid">
            <label>
              Product name
              <input name="name" required minLength={2} />
            </label>

            <label>
              Category
              <input name="categorySlug" required placeholder="electronics" />
            </label>
          </div>

          <label>
            Description
            <textarea name="description" required minLength={10} />
          </label>

          <div className="admin-form-grid">
            <label>
              Price (USD)
              <input name="price" type="number" min="0.01" step="0.01" required />
            </label>

            <label>
              Inventory
              <input name="inventory" type="number" min="0" step="1" required />
            </label>
          </div>

          <label>
            Image URL
            <input name="imageUrl" type="url" placeholder="https://..." />
          </label>

          <SubmitButton className="btn">Create product</SubmitButton>
        </form>
      </article>

      <article className="panel admin-table-wrap">
        <h2>All products</h2>
        <table className="table admin-table">
          <caption className="sr-only">Admin products table</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
              <th scope="col">Stock</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id} style={{ animationDelay: `${Math.min(index, 16) * 35}ms` }}>
                <td>{product.name}</td>
                <td>{product.category?.name ?? "-"}</td>
                <td>{formatCurrency(Number(product.price))}</td>
                <td>{product.inventory}</td>
                <td>{product.isActive ? "Active" : "Hidden"}</td>
                <td>
                  <div className="inline-form admin-inline-form">
                    <Link href={`/admin/products/${product.id}`} className="btn btn-outline">
                      Edit
                    </Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <SubmitButton className="btn btn-danger">Delete</SubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
