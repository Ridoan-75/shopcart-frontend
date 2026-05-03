// src/components/common/Navbar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  Headphones,
  Zap,
  Tag,
  Shirt,
  Dumbbell,
  BookOpen,
  Sparkles,
  Home,
  Menu,
  LayoutGrid,
  Heart,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  Package,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "../../stores/auth.store";
import { useCartStore } from "../../stores/cart.store";
import { useWishlistStore } from "../../stores/wishlist.store";
import { useUIStore } from "../../stores/ui.store";
import { ROUTES } from "../../constants/routes";

// ── Static Data ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "Electronics", href: "/categories/electronics", icon: Zap },
  { label: "Fashion", href: "/categories/fashion", icon: Shirt },
  { label: "Home & Living", href: "/categories/home-living", icon: Home },
  { label: "Sports", href: "/categories/sports", icon: Dumbbell },
  { label: "Beauty", href: "/categories/beauty", icon: Sparkles },
  { label: "Books", href: "/categories/books", icon: BookOpen },
  { label: "Accessories", href: "/categories/accessories", icon: Tag },
  { label: "Packages", href: "/categories/packages", icon: Package },
];

const NAV_LINKS = [
  { label: "Home", href: ROUTES.HOME },
  { label: "Products", href: ROUTES.PRODUCTS },
  { label: "Flash Sale", href: ROUTES.FLASH_SALE },
  { label: "Blog", href: ROUTES.BLOG },
  { label: "About Us", href: ROUTES.ABOUT },
  { label: "Contact Us", href: ROUTES.CONTACT },
];

// ── TopBar ────────────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <div className="w-full hidden md:block" style={{ backgroundColor: "#ef4a23" }}>
      <div className="max-w-[1440px] mx-auto px-6 h-12 flex items-center justify-between text-white text-[14px]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Headphones size={16} className="opacity-90" />
            <span className="font-medium">Need Support? Call Us:</span>
            <span
              className="font-bold px-3 py-1 rounded-full text-[12px]"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}
            >
              (480) 555-0103
            </span>
          </div>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <Zap size={15} className="fill-white text-white" />
            <span className="font-medium">Flash Sale — Up to 40% OFF Today!</span>
          </div>
        </div>
        <div className="flex items-center gap-5 font-medium">
          <Link href={ROUTES.ABOUT} className="hover:text-white/70 transition-colors">About us</Link>
          <span className="text-white/20">|</span>
          <Link href="/wishlist" className="hover:text-white/70 transition-colors">My Wishlist</Link>
          <span className="text-white/20">|</span>
          <Link href={ROUTES.USER_ORDERS ?? "/orders"} className="hover:text-white/70 transition-colors">Order Tracking</Link>
        </div>
      </div>
    </div>
  );
}

// ── MiddleBar ─────────────────────────────────────────────────────────────────

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    document.documentElement.classList.toggle("dark");
    setDark((p) => !p);
  };

  return (
    <button
      onClick={toggle}
      className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
      style={{
        backgroundColor: "rgba(239,74,35,0.08)",
        color: "#ef4a23",
        border: "1px solid rgba(239,74,35,0.2)",
      }}
      aria-label="Toggle theme"
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

function ProfileDropdown() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dashboardHref =
    user?.role === "ADMIN"
      ? ROUTES.ADMIN_OVERVIEW
      : user?.role === "SELLER"
      ? ROUTES.SELLER_OVERVIEW
      : ROUTES.DASHBOARD;

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div ref={ref} className="relative flex items-center gap-3 cursor-pointer" onClick={() => setOpen((p) => !p)}>
      {/* avatar circle */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-all hover:opacity-90"
        style={{ backgroundColor: "#ef4a23" }}
      >
        {initials}
      </div>
      <div className="hidden lg:block text-left">
        <p className="text-gray-500 text-[11px] uppercase font-bold leading-none mb-1">My Account</p>
        <p className="font-bold text-[16px] text-gray-800 dark:text-white">{user?.name?.split(" ")[0]}</p>
      </div>

      {/* dropdown */}
      {open && (
        <div
          className="absolute top-[calc(100%+12px)] right-0 w-56 rounded-2xl overflow-hidden z-50 shadow-2xl"
          style={{
            backgroundColor: "var(--color-background-primary, #fff)",
            border: "0.5px solid var(--color-border-secondary)",
          }}
        >
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: "var(--color-border-tertiary)" }}
          >
            <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{user?.name}</p>
            <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{user?.email}</p>
          </div>
          {[
            { icon: LayoutDashboard, label: "Dashboard", href: dashboardHref },
            { icon: Package, label: "My Orders", href: ROUTES.USER_ORDERS },
            { icon: User, label: "Profile", href: ROUTES.USER_PROFILE },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm border-t transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
            style={{ color: "#f02757", borderColor: "var(--color-border-tertiary)" }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function MiddleBar() {
  const { user } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { openCartDrawer } = useUIStore();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <div className="bg-white dark:bg-[#081621] py-5 md:py-6 border-b border-gray-100 dark:border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between gap-10">

        {/* Mobile Menu */}
        <div className="md:hidden">
          <MobileDrawer />
        </div>

        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-2xl"
            style={{ backgroundColor: "#ef4a23" }}
          >
            S
          </div>
          <span className="text-3xl font-bold tracking-tighter" style={{ color: "var(--color-text-primary)" }}>
            Shop<span style={{ color: "#ef4a23" }}>Cart</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-2xl relative">
          <Input
            placeholder="Search for products..."
            className="w-full h-14 rounded-full border-gray-200 dark:border-white/10 pl-7 pr-14 text-lg bg-gray-50/50 dark:bg-white/5"
            style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
          />
          <div
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white cursor-pointer transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#ef4a23" }}
          >
            <Search size={20} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative flex items-center gap-3 group"
          >
            <div
              className="relative w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-opacity group-hover:opacity-85"
              style={{ backgroundColor: "#ef4a23" }}
            >
              <Heart size={22} />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-bold border-2 border-white"
                  style={{ backgroundColor: "#f02757", color: "#fff" }}
                >
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-gray-500 text-[11px] uppercase font-bold leading-none mb-1">Wishlist</p>
              <p className="font-bold text-[16px] text-gray-800 dark:text-white">{wishlistCount} Items</p>
            </div>
          </Link>

          {/* Cart */}
          <button
            onClick={openCartDrawer}
            className="relative flex items-center gap-3 group"
          >
            <div
              className="relative w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-opacity group-hover:opacity-85"
              style={{ backgroundColor: "#ef4a23" }}
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-bold border-2"
                  style={{ borderColor: "#ef4a23", color: "#ef4a23" }}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-gray-500 text-[11px] uppercase font-bold leading-none mb-1">My Cart</p>
              <p className="font-bold text-[16px] text-gray-800 dark:text-white">{cartCount} Items</p>
            </div>
          </button>

          {/* Auth */}
          {user ? (
            <ProfileDropdown />
          ) : (
            <div className="flex items-center gap-3 group cursor-pointer">
              <Link href={ROUTES.LOGIN}>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-opacity hover:opacity-85"
                  style={{ backgroundColor: "#ef4a23" }}
                >
                  <User size={22} />
                </div>
              </Link>
              <div className="hidden lg:block text-left">
                <p className="text-gray-500 text-[11px] uppercase font-bold leading-none mb-1">My Account</p>
                <div className="flex items-center gap-2">
                  <Link href={ROUTES.LOGIN} className="font-bold text-[16px] text-gray-800 dark:text-white hover:text-[#ef4a23] transition-colors">
                    Log in
                  </Link>
                  <span className="text-gray-300">/</span>
                  <Link href={ROUTES.REGISTER} className="font-bold text-[16px] text-gray-800 dark:text-white hover:text-[#ef4a23] transition-colors">
                    Register
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── BottomBar ─────────────────────────────────────────────────────────────────

function BottomBar() {
  const pathname = usePathname();

  return (
    <div className="bg-white dark:bg-[#081621] border-b border-gray-100 dark:border-white/10 hidden md:block">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center">

        {/* Explore All Categories */}
        <div className="relative group">
          <button
            className="flex items-center gap-3 text-white px-6 h-12 rounded-xl font-medium text-[16px] transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#ef4a23" }}
          >
            <LayoutGrid size={20} />
            <span>Explore All Categories</span>
            <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-200" />
          </button>

          {/* Categories Dropdown */}
          <div className="absolute top-full left-0 w-64 bg-white dark:bg-[#081621] border border-gray-100 dark:border-white/10 shadow-2xl rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 mt-1">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-white/5 group/item"
              >
                <cat.icon size={18} style={{ color: "#ef4a23" }} />
                <span className="text-[15px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex justify-center items-center gap-8">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <div key={link.label} className="relative group h-20 flex items-center">
                <Link
                  href={link.href}
                  className="text-[17px] font-medium flex items-center gap-1 transition-colors"
                  style={{ color: active ? "#ef4a23" : "var(--color-text-primary)" }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "#ef4a23"; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-primary)"; }}
                >
                  {link.label}
                  {/* active underline */}
                  {active && (
                    <span
                      className="absolute bottom-3 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: "#ef4a23" }}
                    />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Support Info */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center border"
            style={{
              backgroundColor: "rgba(239,74,35,0.08)",
              borderColor: "rgba(239,74,35,0.2)",
              color: "#ef4a23",
            }}
          >
            <Headphones size={20} />
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400 font-bold leading-none mb-1 uppercase">24/7 Support</p>
            <p className="text-[17px] font-bold leading-none" style={{ color: "var(--color-text-primary)" }}>
              888-777-999
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mobile Drawer ─────────────────────────────────────────────────────────────

function MobileDrawer() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
          aria-label="Menu"
        >
          <Menu size={22} />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-72 p-0 flex flex-col"
        style={{ backgroundColor: "var(--color-background-primary)" }}
      >
        {/* header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--color-border-tertiary)" }}
        >
          <Link href={ROUTES.HOME} className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: "#ef4a23" }}>S</div>
            <span className="text-lg font-black tracking-tight" style={{ color: "var(--color-text-primary)" }}>
              Shop<span style={{ color: "#ef4a23" }}>Cart</span>
            </span>
          </Link>
          <button onClick={() => setOpen(false)} style={{ color: "var(--color-text-secondary)" }}>
            <X size={20} />
          </button>
        </div>

        {/* search */}
        <div className="px-5 py-3">
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--color-border-secondary)", backgroundColor: "var(--color-background-secondary)" }}
          >
            <input
              placeholder="Search products..."
              className="flex-1 h-10 px-3 text-sm bg-transparent outline-none"
              style={{ color: "var(--color-text-primary)" }}
            />
            <button className="h-10 px-3" style={{ color: "#ef4a23" }} aria-label="Search">
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* nav links */}
        <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-widest px-2 mt-2 mb-1" style={{ color: "var(--color-text-tertiary)" }}>
            Navigation
          </p>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center h-11 px-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  color: active ? "#ef4a23" : "var(--color-text-primary)",
                  backgroundColor: active ? "rgba(239,74,35,0.08)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}

          <p className="text-xs font-semibold uppercase tracking-widest px-2 mt-4 mb-1" style={{ color: "var(--color-text-tertiary)" }}>
            Categories
          </p>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 h-11 px-3 rounded-xl text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <cat.icon size={16} style={{ color: "#ef4a23" }} />
              {cat.label}
            </Link>
          ))}
        </nav>

        {/* footer */}
        <div
          className="px-4 py-4 border-t flex flex-col gap-2"
          style={{ borderColor: "var(--color-border-tertiary)" }}
        >
          {user ? (
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(240,39,87,0.08)", color: "#f02757", border: "0.5px solid rgba(240,39,87,0.25)" }}
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                href={ROUTES.LOGIN}
                onClick={() => setOpen(false)}
                className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ border: "1px solid #ef4a23", color: "#ef4a23" }}
              >
                Login
              </Link>
              <Link
                href={ROUTES.REGISTER}
                onClick={() => setOpen(false)}
                className="flex-1 h-10 rounded-xl text-sm font-semibold text-white flex items-center justify-center transition-opacity hover:opacity-85"
                style={{ backgroundColor: "#ef4a23" }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function Navbar() {
  return (
    <header className="w-full sticky top-0 z-50 shadow-sm">
      <TopBar />
      <MiddleBar />
      <BottomBar />
    </header>
  );
}