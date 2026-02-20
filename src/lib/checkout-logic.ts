type ProductState = {
  stock: number;
  isActive: boolean;
};

export function canCheckoutItem(productState: ProductState | undefined, quantity: number) {
  if (!productState || !productState.isActive) {
    return false;
  }

  return quantity > 0 && quantity <= productState.stock;
}
