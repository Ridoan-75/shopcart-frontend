import { useWishlistStore } from "@/stores/wishlist.store";

export function useWishlist() {
  const items = useWishlistStore((s) => s.items);
  const addItem = useWishlistStore((s) => s.addItem);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);

  const itemCount = items.length;

  return {
    items,
    itemCount,
    addItem,
    removeItem,
    isWishlisted,
  };
}