type UserRole = "ADMIN" | "USER" | null | undefined;

type OrderReceiptAccessInput = {
  sessionUserId?: string | null;
  sessionRole?: UserRole;
  orderUserId?: string | null;
  hasValidGuestReceiptToken: boolean;
};

export function isAdminRole(role: UserRole) {
  return role === "ADMIN";
}

export function assertAdminRole(role: UserRole) {
  if (!isAdminRole(role)) {
    throw new Error("Unauthorized");
  }
}

export function canAccessOrderReceipt(input: OrderReceiptAccessInput) {
  if (isAdminRole(input.sessionRole)) {
    return true;
  }

  if (input.sessionUserId) {
    return Boolean(input.orderUserId && input.orderUserId === input.sessionUserId);
  }

  if (input.orderUserId) {
    return false;
  }

  return input.hasValidGuestReceiptToken;
}
