import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Coupon } from "../types/cart.types";

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQty: (itemId: string, quantity: number) => void;
  setCoupon: (coupon: Coupon | null) => void;
  clearCart: () => void;
}

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: null,
      total: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          let updatedItems: CartItem[];

          if (existing) {
            updatedItems = state.items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
          } else {
            updatedItems = [...state.items, item];
          }

          return {
            items: updatedItems,
            total: calculateTotal(updatedItems),
          };
        }),

      removeItem: (itemId) =>
        set((state) => {
          const updatedItems = state.items.filter((i) => i.id !== itemId);
          return {
            items: updatedItems,
            total: calculateTotal(updatedItems),
          };
        }),

      updateQty: (itemId, quantity) =>
        set((state) => {
          const updatedItems = state.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          );
          return {
            items: updatedItems,
            total: calculateTotal(updatedItems),
          };
        }),

      setCoupon: (coupon) => set({ coupon }),

      clearCart: () => set({ items: [], coupon: null, total: 0 }),
    }),
    {
      name: "cart-storage",
    }
  )
);