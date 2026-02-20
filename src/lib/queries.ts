import "server-only";
import { type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name-asc";

type GetProductsInput = {
  query?: string;
  category?: string;
  sort?: ProductSort;
};

export async function getProducts(input?: GetProductsInput) {
  const query = input?.query?.trim();
  const category = input?.category?.trim();
  const sort = input?.sort ?? "newest";

  const where: Prisma.ProductWhereInput = {
    isActive: true
  };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } }
    ];
  }

  if (category) {
    where.category = {
      is: { slug: category }
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : sort === "name-asc"
          ? { name: "asc" }
          : { createdAt: "desc" };

  return prisma.product.findMany({
    where,
    include: { category: true },
    orderBy
  });
}

export async function getCatalogCategories() {
  return prisma.category.findMany({
    where: {
      products: {
        some: {
          isActive: true
        }
      }
    },
    orderBy: { name: "asc" }
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true }
  });
}

export async function getAdminStats() {
  const [productCount, orderCount, paidOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { total: true }
    })
  ]);

  return {
    productCount,
    orderCount,
    paidRevenue: Number(paidOrders._sum.total ?? 0)
  };
}

export async function getAllProductsForAdmin() {
  return prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getAllOrdersForAdmin() {
  return prisma.order.findMany({
    include: { items: true, user: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });
}
