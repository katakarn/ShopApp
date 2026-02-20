import assert from "node:assert/strict";
import test from "node:test";
import { getMergedCartItemQuantity } from "@/lib/cart-logic";

test("getMergedCartItemQuantity caps total quantity to inventory", () => {
  assert.equal(getMergedCartItemQuantity(2, 4, 5), 5);
  assert.equal(getMergedCartItemQuantity(1, 1, 10), 2);
});

test("getMergedCartItemQuantity never returns negative values", () => {
  assert.equal(getMergedCartItemQuantity(-2, 3, 4), 3);
  assert.equal(getMergedCartItemQuantity(2, 2, -1), 0);
});

test("getMergedCartItemQuantity truncates decimal input safely", () => {
  assert.equal(getMergedCartItemQuantity(1.9, 2.4, 10.8), 3);
});
