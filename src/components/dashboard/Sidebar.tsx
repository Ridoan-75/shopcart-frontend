// src/components/dashboard/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Heart, MapPin, Star, User,
  BarChart3, Package, ClipboardList, Warehouse, Users, Tag,
  Megaphone, BookOpen, Mail, Bell, Percent, Zap, Image,
  ChevronLeft, ChevronRight, LogOut, X,
} from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { ROUTES } from "../../constants/routes";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const USER_MENU: MenuItem[] = [
  { label: "Overview", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "My Orders", href: ROUTES.USER_ORDERS, icon: ShoppingBag },
  { label: "Wishlist", href: "/user/wishlist", icon: Heart },
  { label: "Addresses", href: "/user/addresses", icon: MapPin },
  { label: "Reviews", href: "/user/reviews", icon: Star },
  { label: "Profile", href: ROUTES.USER_PROFILE, icon: User },
];

const SELLER_MENU: MenuItem[] = [
  { label: "Overview", href: ROUTES.SELLER_OVERVIEW, icon: BarChart3 },
  { label: "Products", href: "/seller/products", icon: Package },
  { label: "Orders", href: "/seller/orders", icon: ClipboardList },
  { label: "Inventory", href: "/seller/inventory", icon: Warehouse },
  { label: "Reviews", href: "/seller/reviews", icon: Star },
  { label: "Profile", href: "/seller/profile", icon: User },
];

const ADMIN_MENU: MenuItem[] = [
  { label: "Overview", href: ROUTES.ADMIN_OVERVIEW, icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Brands", href: "/admin/brands", icon: Megaphone },
  { label: "Tags", href: "/admin/tags", icon: Tag },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Sellers", href: "/admin/sellers", icon: User },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Coupons", href: "/admin/coupons", icon: Percent },
  { label: "Flash Sales", href: "/admin/flash-sales", icon: Zap },
  { label: "Banners", href: "/admin/banners", icon: Image },
  { label: "Blogs", href: "/admin/blogs", icon: BookOpen },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
];

function getMenu(role?: string): MenuItem[] {
  if (role === "ADMIN") return ADMIN_MENU;
  if (role === "SELLER") return SELLER_MENU;
  return USER_MENU;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const menu = getMenu(user?.role);
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const SidebarContent = (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#081621" }}
    >
      {/* logo + collapse toggle */}
      <div
        className="flex items-center justify-between px-4 h-16 border-b flex-shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black"
              style={{ backgroundColor: "#ef4a23" }}
            >
              S
            </div>
            <span className="text-base font-black text-white tracking-tight">
              Shop<span style={{ color: "#ef4a23" }}>Cart</span>
            </span>
          </Link>
        )}

        {/* mobile close */}
        {onMobileClose ? (
          <button
            onClick={onMobileClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center ml-auto"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <X size={16} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="w-8 h-8 rounded-lg flex items-center justify-center ml-auto transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.5)" }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
      </div>

      {/* user info */}
      {!collapsed && (
        <div
          className="flex items-center gap-3 px-4 py-4 border-b flex-shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              backgroundColor: "rgba(239,74,35,0.2)",
              color: "#ef4a23",
              border: "1.5px solid rgba(239,74,35,0.35)",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p
              className="text-xs px-1.5 py-0.5 rounded-full w-fit mt-0.5"
              style={{
                backgroundColor: "rgba(239,74,35,0.15)",
                color: "#ef4a23",
              }}
            >
              {user?.role ?? "USER"}
            </p>
          </div>
        </div>
      )}

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1"
        style={{ scrollbarWidth: "none" }}
      >
        {menu.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition-all duration-150 group relative"
              style={{
                backgroundColor: active ? "rgba(239,74,35,0.15)" : "transparent",
                color: active ? "#ef4a23" : "rgba(255,255,255,0.55)",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.05)";
                if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)";
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ backgroundColor: "#ef4a23" }}
                />
              )}
              <item.icon size={16} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* logout */}
      <div
        className="px-3 py-4 border-t flex-shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition-all hover:bg-red-950/40"
          style={{ color: "rgba(240,39,87,0.7)" }}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* desktop sidebar */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 transition-all duration-300"
        style={{ width: collapsed ? "64px" : "240px" }}
      >
        {SidebarContent}
      </aside>

      {/* mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onMobileClose}
          />
          <div className="relative w-64 h-full z-10">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}