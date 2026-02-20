export function getMergedCartItemQuantity(
  existingQuantity: number,
  incomingQuantity: number,
  inventory: number
) {
  const safeExisting = Math.max(0, Math.trunc(existingQuantity));
  const safeIncoming = Math.max(0, Math.trunc(incomingQuantity));
  const safeInventory = Math.max(0, Math.trunc(inventory));

  return Math.min(safeExisting + safeIncoming, safeInventory);
}
