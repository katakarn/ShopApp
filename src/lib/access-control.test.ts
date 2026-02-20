import assert from "node:assert/strict";
import test from "node:test";
import { assertAdminRole, canAccessOrderReceipt, isAdminRole } from "@/lib/access-control";

test("isAdminRole returns true only for ADMIN", () => {
  assert.equal(isAdminRole("ADMIN"), true);
  assert.equal(isAdminRole("USER"), false);
  assert.equal(isAdminRole(undefined), false);
});

test("assertAdminRole throws for non-admin users", () => {
  assert.doesNotThrow(() => assertAdminRole("ADMIN"));
  assert.throws(() => assertAdminRole("USER"), /Unauthorized/);
});

test("canAccessOrderReceipt grants admin access to any order", () => {
  assert.equal(
    canAccessOrderReceipt({
      sessionUserId: "user_1",
      sessionRole: "ADMIN",
      orderUserId: "user_2",
      hasValidGuestReceiptToken: false
    }),
    true
  );
});

test("canAccessOrderReceipt restricts user to own order", () => {
  assert.equal(
    canAccessOrderReceipt({
      sessionUserId: "user_1",
      sessionRole: "USER",
      orderUserId: "user_1",
      hasValidGuestReceiptToken: false
    }),
    true
  );

  assert.equal(
    canAccessOrderReceipt({
      sessionUserId: "user_1",
      sessionRole: "USER",
      orderUserId: "user_2",
      hasValidGuestReceiptToken: true
    }),
    false
  );
});

test("canAccessOrderReceipt allows guest only with valid token and guest order", () => {
  assert.equal(
    canAccessOrderReceipt({
      sessionRole: undefined,
      orderUserId: null,
      hasValidGuestReceiptToken: true
    }),
    true
  );

  assert.equal(
    canAccessOrderReceipt({
      sessionRole: undefined,
      orderUserId: "user_2",
      hasValidGuestReceiptToken: true
    }),
    false
  );
});
