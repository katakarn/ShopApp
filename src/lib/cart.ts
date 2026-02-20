import "server-only";
import { type Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { getMergedCartItemQuantity } from "@/lib/cart-logic";
import { prisma } from "@/lib/prisma";

const CART_COOKIE = "cart_session_id";
const cartInclude = {
  items: {
    include: { product: true },
    orderBy: { createdAt: "asc" }
  }
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

function cartCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  };
}

async function getOrCreateSessionId(createIfMissing: boolean) {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE)?.value;
  if (existing) {
    return existing;
  }

  if (!createIfMissing) {
    return null;
  }

  const sessionId = crypto.randomUUID();
  cookieStore.set(CART_COOKIE, sessionId, cartCookieOptions());
  return sessionId;
}

async function mergeCarts(targetCartId: string, sourceCart: CartWithItems) {
  await prisma.$transaction(async (tx) => {
    for (const sourceItem of sourceCart.items) {
      const availableInventory =
        sourceItem.product.isActive && sourceItem.product.inventory > 0 ? sourceItem.product.inventory : 0;

      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: targetCartId,
            productId: sourceItem.productId
          }
        }
      });

      if (existingItem) {
        const mergedQuantity = getMergedCartItemQuantity(
          existingItem.quantity,
          sourceItem.quantity,
          availableInventory
        );

        if (mergedQuantity <= 0) {
          await tx.cartItem.delete({
            where: { id: existingItem.id }
          });
        } else if (mergedQuantity !== existingItem.quantity) {
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: mergedQuantity }
          });
        }
      } else {
        const mergedQuantity = getMergedCartItemQuantity(0, sourceItem.quantity, availableInventory);
        if (mergedQuantity > 0) {
          await tx.cartItem.create({
            data: {
              cartId: targetCartId,
              productId: sourceItem.productId,
              quantity: mergedQuantity
            }
          });
        }
      }
    }

    await tx.cart.delete({ where: { id: sourceCart.id } });
  });
}

export async function getCurrentCart(createIfMissing = false): Promise<CartWithItems | null> {
  const session = await auth();
  const sessionId = await getOrCreateSessionId(createIfMissing);

  if (session?.user?.id) {
    let userCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: cartInclude
    });

    if (sessionId) {
      const sessionCart = await prisma.cart.findUnique({
        where: { sessionId },
        include: cartInclude
      });

      if (sessionCart && sessionCart.userId !== session.user.id) {
        if (!userCart) {
          userCart = await prisma.cart.update({
            where: { id: sessionCart.id },
            data: { userId: session.user.id },
            include: cartInclude
          });
        } else if (sessionCart.id !== userCart.id) {
          await mergeCarts(userCart.id, sessionCart);
          userCart = await prisma.cart.findUnique({
            where: { id: userCart.id },
            include: cartInclude
          });
        }
      }
    }

    if (!userCart && createIfMissing) {
      userCart = await prisma.cart.create({
        data: { userId: session.user.id, sessionId: sessionId ?? undefined },
        include: cartInclude
      });
    }

    return userCart;
  }

  if (!sessionId) {
    return null;
  }

  let guestCart = await prisma.cart.findUnique({
    where: { sessionId },
    include: cartInclude
  });

  if (!guestCart && createIfMissing) {
    guestCart = await prisma.cart.create({
      data: { sessionId },
      include: cartInclude
    });
  }

  return guestCart;
}

export function getCartItemCount(cart: CartWithItems | null) {
  if (!cart) {
    return 0;
  }

  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(cart: CartWithItems | null) {
  if (!cart) {
    return 0;
  }

  return cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
}
