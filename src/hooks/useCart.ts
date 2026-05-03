import { useCartStore } from "@/stores/cart.store";

export function useCart() {
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const total = useCartStore((s) => s.total);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const clearCart = useCartStore((s) => s.clearCart);
  const setCoupon = useCartStore((s) => s.setCoupon);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    items,
    coupon,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    setCoupon,
  };
}