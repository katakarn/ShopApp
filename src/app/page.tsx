import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getCatalogCategories, getProducts, type ProductSort } from "@/lib/queries";

type HomePageProps = {
  searchParams?: Promise<{
    flash?: string;
    q?: string;
    category?: string;
    sort?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const queryText = typeof params?.q === "string" ? params.q.trim() : "";
  const selectedCategory = typeof params?.category === "string" ? params.category.trim() : "";
  const requestedSort = typeof params?.sort === "string" ? params.sort.trim() : "";

  const sort: ProductSort =
    requestedSort === "price-asc" ||
    requestedSort === "price-desc" ||
    requestedSort === "name-asc" ||
    requestedSort === "newest"
      ? requestedSort
      : "newest";

  const [products, categories] = await Promise.all([
    getProducts({
      query: queryText || undefined,
      category: selectedCategory || undefined,
      sort
    }),
    getCatalogCategories()
  ]);

  const flashMessage =
    params?.flash === "signed-in"
      ? "Signed in successfully."
      : params?.flash === "signed-out"
        ? "Signed out successfully."
        : null;

  const hasFilters = Boolean(queryText || selectedCategory || sort !== "newest");

  return (
    <div className="stack home-shell">
      {flashMessage ? (
        <p className="notice" role="status" aria-live="polite">
          {flashMessage}
        </p>
      ) : null}

      <section className="hero">
        <p className="hero-kicker">New season drop</p>
        <h1>Curated products, smoother shopping flow</h1>
        <p>
          Product catalog, cart, checkout, order tracking, and admin controls in one clean Next.js app.
        </p>
        <div className="hero-actions">
          <a href="#catalog" className="btn btn-light">
            Explore products
          </a>
          <Link href="/cart" className="btn btn-ghost-light">
            View cart
          </Link>
        </div>
      </section>

      <section className="panel stack catalog-panel" id="catalog">
        <form className="catalog-form" method="get">
          <div className="catalog-row">
            <label className="catalog-field">
              Search
              <input name="q" placeholder="Search by product name..." defaultValue={queryText} />
            </label>

            <label className="catalog-field">
              Category
              <select name="category" defaultValue={selectedCategory}>
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="catalog-field">
              Sort
              <select name="sort" defaultValue={sort}>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to high</option>
                <option value="price-desc">Price: High to low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </label>
          </div>

          <div className="catalog-actions">
            <button type="submit" className="btn">
              Apply
            </button>
            {hasFilters ? (
              <Link href="/" className="btn btn-outline">
                Clear filters
              </Link>
            ) : null}
          </div>
        </form>

        <p className="catalog-stat">
          Showing <strong>{products.length}</strong> product{products.length === 1 ? "" : "s"}
          {queryText ? (
            <>
              {" "}
              for <span className="chip">&quot;{queryText}&quot;</span>
            </>
          ) : null}
        </p>
      </section>

      <section className="grid products-grid catalog-grid">
        {products.length > 0 ? (
          products.map((product, index) => (
            <ProductCard
              key={product.id}
              id={product.id}
              index={index}
              slug={product.slug}
              name={product.name}
              description={product.description}
              price={Number(product.price)}
              inventory={product.inventory}
              imageUrl={product.imageUrl}
            />
          ))
        ) : (
          <article className="panel empty-state">
            <h2>No matching products</h2>
            <p className="muted">Try a different search term or clear filters to explore everything.</p>
            <Link href="/" className="btn btn-outline">
              Reset and browse all
            </Link>
          </article>
        )}
      </section>
    </div>
  );
}
