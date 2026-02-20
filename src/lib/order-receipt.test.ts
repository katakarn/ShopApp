import assert from "node:assert/strict";
import test from "node:test";
import { createOrderReceiptToken, verifyOrderReceiptToken } from "@/lib/order-receipt";

test("verifyOrderReceiptToken accepts a freshly generated token", () => {
  const orderId = "test_order_123";
  const token = createOrderReceiptToken(orderId);
  assert.equal(verifyOrderReceiptToken(token, orderId), true);
});

test("verifyOrderReceiptToken rejects mismatched order id", () => {
  const token = createOrderReceiptToken("order_a");
  assert.equal(verifyOrderReceiptToken(token, "order_b"), false);
});

test("verifyOrderReceiptToken rejects tampered signature", () => {
  const token = createOrderReceiptToken("order_x");
  const parts = token.split(".");
  const tampered = `${parts[0]}.${parts[1]}.deadbeef${parts[2]?.slice(8) ?? ""}`;
  assert.equal(verifyOrderReceiptToken(tampered, "order_x"), false);
});

test("verifyOrderReceiptToken rejects expired tokens", () => {
  const expiredToken = "order_x.1.invalidsignature";
  assert.equal(verifyOrderReceiptToken(expiredToken, "order_x"), false);
});
