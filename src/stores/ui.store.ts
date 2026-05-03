import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  cartDrawerOpen: boolean;
  chatbotOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCartDrawer: () => void;
  setCartDrawerOpen: (open: boolean) => void;
  toggleChatbot: () => void;
  setChatbotOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  cartDrawerOpen: false,
  chatbotOpen: false,

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleCartDrawer: () =>
    set((state) => ({ cartDrawerOpen: !state.cartDrawerOpen })),

  setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),

  toggleChatbot: () =>
    set((state) => ({ chatbotOpen: !state.chatbotOpen })),

  setChatbotOpen: (open) => set({ chatbotOpen: open }),
}));