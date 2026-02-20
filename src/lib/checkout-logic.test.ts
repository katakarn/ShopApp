import assert from "node:assert/strict";
import test from "node:test";
import { canCheckoutItem } from "@/lib/checkout-logic";

test("canCheckoutItem allows active product with enough stock", () => {
  assert.equal(canCheckoutItem({ stock: 5, isActive: true }, 3), true);
});

test("canCheckoutItem rejects when product is inactive or missing", () => {
  assert.equal(canCheckoutItem({ stock: 5, isActive: false }, 1), false);
  assert.equal(canCheckoutItem(undefined, 1), false);
});

test("canCheckoutItem rejects non-positive or over-stock quantity", () => {
  assert.equal(canCheckoutItem({ stock: 5, isActive: true }, 0), false);
  assert.equal(canCheckoutItem({ stock: 5, isActive: true }, 6), false);
});
