import { createHmac, timingSafeEqual } from "crypto";

export const ORDER_RECEIPT_COOKIE = "order_receipt";
const ORDER_RECEIPT_TTL_SECONDS = 60 * 30;

function getOrderReceiptSecret() {
  return process.env.NEXTAUTH_SECRET ?? "dev-order-receipt-secret";
}

function signPayload(orderId: string, expiresAtUnix: number) {
  return createHmac("sha256", getOrderReceiptSecret())
    .update(`${orderId}.${expiresAtUnix}`)
    .digest("hex");
}

export function createOrderReceiptToken(orderId: string) {
  const expiresAtUnix = Math.floor(Date.now() / 1000) + ORDER_RECEIPT_TTL_SECONDS;
  const signature = signPayload(orderId, expiresAtUnix);
  return `${orderId}.${expiresAtUnix}.${signature}`;
}

export function verifyOrderReceiptToken(token: string | undefined, orderId: string) {
  if (!token) {
    return false;
  }

  const [tokenOrderId, expiresAtRaw, signature] = token.split(".");
  if (!tokenOrderId || !expiresAtRaw || !signature || tokenOrderId !== orderId) {
    return false;
  }

  const expiresAtUnix = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAtUnix) || expiresAtUnix < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expectedSignature = signPayload(tokenOrderId, expiresAtUnix);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export function getOrderReceiptCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ORDER_RECEIPT_TTL_SECONDS
  };
}
