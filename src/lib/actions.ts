"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdminRole } from "@/lib/access-control";
import { auth } from "@/lib/auth";
import { getCartSubtotal, getCurrentCart } from "@/lib/cart";
import { canCheckoutItem } from "@/lib/checkout-logic";
import {
  createEmailVerificationToken,
  createEmailVerificationUrl,
  sendEmailVerificationLink
} from "@/lib/email-verification";
import {
  createOrderReceiptToken,
  getOrderReceiptCookieOptions,
  ORDER_RECEIPT_COOKIE
} from "@/lib/order-receipt";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const addToCartSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().int().min(1).max(99)
});

const updateCartSchema = z.object({
  itemId: z.string().cuid(),
  quantity: z.coerce.number().int().min(1).max(99)
});

const removeCartSchema = z.object({
  itemId: z.string().cuid()
});

const checkoutSchema = z.object({
  shippingName: z.string().min(2),
  email: z.string().email(),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingPostalCode: z.string().min(2),
  shippingCountry: z.string().min(2)
});

const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6)
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  });

const resendVerificationSchema = z.object({
  email: z.string().email()
});

const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  inventory: z.coerce.number().int().min(0),
  categorySlug: z.string().min(2),
  imageUrl: z.string().url().or(z.literal(""))
});

const updateProductSchema = z.object({
  productId: z.string().cuid(),
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  inventory: z.coerce.number().int().min(0),
  categorySlug: z.string().min(2),
  imageUrl: z.string().url().or(z.literal("")),
  isActive: z.enum(["true", "false"])
});

const deleteProductSchema = z.object({
  productId: z.string().cuid()
});

const updateOrderSchema = z.object({
  orderId: z.string().cuid(),
  status: z.enum(["PENDING", "PAID", "SHIPPED", "CANCELLED"])
});

function refreshStorePages() {
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/checkout/success");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/products");
  revalidatePath("/orders");
}

async function issueVerificationLink(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const { rawToken } = await createEmailVerificationToken(normalizedEmail);
  const verificationUrl = createEmailVerificationUrl(normalizedEmail, rawToken);

  let deliveryFailed = false;
  try {
    await sendEmailVerificationLink(normalizedEmail, verificationUrl);
  } catch (error) {
    deliveryFailed = true;
    console.error("Failed to send verification email", error);
  }

  return {
    email: normalizedEmail,
    verificationUrl,
    deliveryFailed
  };
}

async function requireAdminUser() {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    throw new Error("Unauthorized");
  }

  assertAdminRole(user.role);
  return user;
}

export async function registerUserAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    redirect("/register?error=invalid");
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  const exists = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { emailVerified: true }
  });

  if (exists) {
    if (!exists.emailVerified) {
      const linkState = await issueVerificationLink(normalizedEmail);
      const params = new URLSearchParams({
        email: linkState.email
      });
      params.set("resent", "1");
      if (linkState.deliveryFailed) {
        params.set("delivery", "failed");
      }
      if (process.env.NODE_ENV !== "production") {
        params.set("devLink", linkState.verificationUrl);
      }
      redirect(`/verify-email/sent?${params.toString()}`);
    }
    redirect("/register?error=exists");
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: normalizedEmail,
      passwordHash: await hash(parsed.data.password, 10)
    }
  });

  const linkState = await issueVerificationLink(normalizedEmail);
  const params = new URLSearchParams({
    email: linkState.email
  });
  if (linkState.deliveryFailed) {
    params.set("delivery", "failed");
  }
  if (process.env.NODE_ENV !== "production") {
    params.set("devLink", linkState.verificationUrl);
  }
  redirect(`/verify-email/sent?${params.toString()}`);
}

export async function resendVerificationEmailAction(formData: FormData) {
  const parsed = resendVerificationSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    redirect("/verify-email/sent?error=invalid");
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { emailVerified: true }
  });

  if (existingUser?.emailVerified) {
    redirect("/login?verified=1");
  }

  const params = new URLSearchParams({
    email: normalizedEmail,
    resent: "1"
  });

  if (existingUser) {
    const linkState = await issueVerificationLink(normalizedEmail);
    if (linkState.deliveryFailed) {
      params.set("delivery", "failed");
    }
    if (process.env.NODE_ENV !== "production") {
      params.set("devLink", linkState.verificationUrl);
    }
  }

  redirect(`/verify-email/sent?${params.toString()}`);
}

export async function addToCartAction(formData: FormData) {
  const parsed = addToCartSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity")
  });

  if (!parsed.success) {
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId }
  });

  if (!product || !product.isActive || product.inventory < 1) {
    return;
  }

  const cart = await getCurrentCart(true);
  if (!cart) {
    return;
  }

  const quantityToAdd = Math.min(parsed.data.quantity, product.inventory);

  const existingItem = cart.items.find((item) => item.productId === parsed.data.productId);

  if (existingItem) {
    const nextQty = Math.min(existingItem.quantity + quantityToAdd, product.inventory);
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: nextQty }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: parsed.data.productId,
        quantity: quantityToAdd
      }
    });
  }

  refreshStorePages();
}

export async function updateCartItemAction(formData: FormData) {
  const parsed = updateCartSchema.safeParse({
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity")
  });

  if (!parsed.success) {
    return;
  }

  const cart = await getCurrentCart();
  if (!cart) {
    return;
  }

  const item = cart.items.find((cartItem) => cartItem.id === parsed.data.itemId);
  if (!item) {
    return;
  }

  const nextQty = Math.min(parsed.data.quantity, item.product.inventory);
  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: Math.max(1, nextQty) }
  });

  refreshStorePages();
}

export async function removeCartItemAction(formData: FormData) {
  const parsed = removeCartSchema.safeParse({
    itemId: formData.get("itemId")
  });

  if (!parsed.success) {
    return;
  }

  const cart = await getCurrentCart();
  if (!cart) {
    return;
  }

  const item = cart.items.find((cartItem) => cartItem.id === parsed.data.itemId);
  if (!item) {
    return;
  }

  await prisma.cartItem.delete({ where: { id: item.id } });
  refreshStorePages();
}

export async function checkoutAction(formData: FormData) {
  const session = await auth();

  const parsed = checkoutSchema.safeParse({
    shippingName: formData.get("shippingName"),
    email: formData.get("email") ?? session?.user?.email ?? "",
    shippingAddress: formData.get("shippingAddress"),
    shippingCity: formData.get("shippingCity"),
    shippingPostalCode: formData.get("shippingPostalCode"),
    shippingCountry: formData.get("shippingCountry")
  });

  if (!parsed.success) {
    redirect("/checkout?error=invalid");
  }

  const cart = await getCurrentCart();
  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const inventoryMap = new Map(
    cart.items.map((item) => [item.productId, { stock: item.product.inventory, isActive: item.product.isActive }])
  );

  for (const item of cart.items) {
    const productState = inventoryMap.get(item.productId);
    if (!canCheckoutItem(productState, item.quantity)) {
      redirect("/cart?error=inventory");
    }
  }

  const total = getCartSubtotal(cart);

  let createdOrderId = "";
  try {
    createdOrderId = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            isActive: true,
            inventory: { gte: item.quantity }
          },
          data: {
            inventory: {
              decrement: item.quantity
            }
          }
        });

        if (updated.count === 0) {
          throw new Error("INSUFFICIENT_STOCK");
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: session?.user?.id,
          status: "PENDING",
          total,
          email: parsed.data.email,
          shippingName: parsed.data.shippingName,
          shippingAddress: parsed.data.shippingAddress,
          shippingCity: parsed.data.shippingCity,
          shippingPostalCode: parsed.data.shippingPostalCode,
          shippingCountry: parsed.data.shippingCountry,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              unitPrice: item.product.price,
              quantity: item.quantity
            }))
          }
        }
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return createdOrder.id;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      redirect("/cart?error=inventory");
    }
    throw error;
  }

  const cookieStore = await cookies();
  cookieStore.set(ORDER_RECEIPT_COOKIE, createOrderReceiptToken(createdOrderId), getOrderReceiptCookieOptions());

  refreshStorePages();
  redirect(`/checkout/success/${createdOrderId}`);
}

export async function createProductAction(formData: FormData) {
  await requireAdminUser();

  const parsed = createProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    inventory: formData.get("inventory"),
    categorySlug: formData.get("categorySlug"),
    imageUrl: formData.get("imageUrl")
  });

  if (!parsed.success) {
    redirect("/admin/products?error=invalid");
  }

  const category = await prisma.category.upsert({
    where: { slug: slugify(parsed.data.categorySlug) },
    update: { name: parsed.data.categorySlug },
    create: {
      slug: slugify(parsed.data.categorySlug),
      name: parsed.data.categorySlug
    }
  });

  const baseSlug = slugify(parsed.data.name);
  const existing = await prisma.product.findUnique({ where: { slug: baseSlug } });
  const slug = existing ? `${baseSlug}-${Math.floor(Math.random() * 10000)}` : baseSlug;

  await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      inventory: parsed.data.inventory,
      categoryId: category.id,
      imageUrl: parsed.data.imageUrl || null
    }
  });

  refreshStorePages();
  redirect("/admin/products?created=1");
}

export async function updateProductAction(formData: FormData) {
  await requireAdminUser();

  const parsed = updateProductSchema.safeParse({
    productId: formData.get("productId"),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    inventory: formData.get("inventory"),
    categorySlug: formData.get("categorySlug"),
    imageUrl: formData.get("imageUrl"),
    isActive: formData.get("isActive")
  });

  if (!parsed.success) {
    redirect("/admin/products?error=invalid");
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId }
  });

  if (!product) {
    redirect("/admin/products?error=not-found");
  }

  const category = await prisma.category.upsert({
    where: { slug: slugify(parsed.data.categorySlug) },
    update: { name: parsed.data.categorySlug },
    create: {
      slug: slugify(parsed.data.categorySlug),
      name: parsed.data.categorySlug
    }
  });

  const baseSlug = slugify(parsed.data.name);
  const conflict = await prisma.product.findFirst({
    where: {
      slug: baseSlug,
      NOT: { id: parsed.data.productId }
    }
  });
  const slug = conflict ? `${baseSlug}-${parsed.data.productId.slice(-6)}` : baseSlug;

  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      inventory: parsed.data.inventory,
      categoryId: category.id,
      imageUrl: parsed.data.imageUrl || null,
      isActive: parsed.data.isActive === "true"
    }
  });

  refreshStorePages();
  redirect("/admin/products?updated=1");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminUser();

  const parsed = deleteProductSchema.safeParse({
    productId: formData.get("productId")
  });

  if (!parsed.success) {
    redirect("/admin/products?error=invalid");
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: {
      id: true,
      _count: { select: { orderItems: true } }
    }
  });

  if (!product) {
    redirect("/admin/products?error=not-found");
  }

  if (product._count.orderItems > 0) {
    redirect("/admin/products?error=has-orders");
  }

  await prisma.product.delete({
    where: { id: parsed.data.productId }
  });

  refreshStorePages();
  redirect("/admin/products?deleted=1");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdminUser();

  const parsed = updateOrderSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    redirect("/admin/orders?error=invalid");
  }

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { status: parsed.data.status }
  });

  refreshStorePages();
  redirect("/admin/orders?updated=1");
}
