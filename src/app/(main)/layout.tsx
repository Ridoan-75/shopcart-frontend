// src/app/(main)/layout.tsx
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import CartDrawer from "../../components/cart/CartDrawer";
import AiChatbot from "../../components/common/AiChatbot";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-background-tertiary, #f2f4f8)" }}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <AiChatbot />
    </div>
  );
}