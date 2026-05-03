// src/components/common/Footer.tsx
"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Mail,
  Phone,
  ChevronRight,
  Zap,
} from "lucide-react";
import { ROUTES } from "../../constants/routes";

// ── Static Data ───────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: "Home", href: ROUTES.HOME },
  { label: "Products", href: ROUTES.PRODUCTS },
  { label: "Flash Sale", href: ROUTES.FLASH_SALE },
  { label: "Blog", href: ROUTES.BLOG },
  { label: "About Us", href: ROUTES.ABOUT },
  { label: "Contact Us", href: ROUTES.CONTACT },
];

const CUSTOMER_SERVICE = [
  { label: "FAQ", href: ROUTES.FAQ ?? "/faq" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Track My Order", href: ROUTES.USER_ORDERS ?? "/orders" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const SOCIAL_LINKS = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function FooterLinkList({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4
        className="text-base font-bold mb-5 relative inline-block"
        style={{ color: "#ffffff" }}
      >
        {title}
        <span
          className="absolute -bottom-1.5 left-0 w-8 h-0.5 rounded-full"
          style={{ backgroundColor: "#ef4a23" }}
        />
      </h4>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="flex items-center gap-2 text-sm transition-all duration-150 group"
              style={{ color: "rgba(255,255,255,0.55)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#ef4a23";
                (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "4px";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(255,255,255,0.55)";
                (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "0px";
              }}
            >
              <ChevronRight
                size={13}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "#ef4a23" }}
              />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactItem({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          backgroundColor: "rgba(239,74,35,0.15)",
          color: "#ef4a23",
        }}
      >
        <Icon size={15} />
      </div>
      <span
        className="text-sm leading-relaxed"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        {children}
      </span>
    </div>
  );
}

// ── Main Footer ───────────────────────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "#081621" }}>
      {/* newsletter strip */}
      <div
        className="border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(239,74,35,0.15)", color: "#ef4a23" }}
            >
              <Zap size={20} fill="#ef4a23" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                Subscribe to our newsletter
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                Get the latest deals and updates delivered to your inbox.
              </p>
            </div>
          </div>

          <div className="flex w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 md:w-72 h-11 px-4 text-sm outline-none rounded-l-xl"
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                borderRight: "none",
                color: "#fff",
                fontFamily: "'Trebuchet MS', sans-serif",
              }}
            />
            <button
              className="h-11 px-5 text-sm font-semibold text-white rounded-r-xl transition-opacity hover:opacity-85 flex-shrink-0"
              style={{ backgroundColor: "#ef4a23" }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* main grid */}
      <div className="max-w-[1440px] mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* col 1 — brand */}
        <div className="flex flex-col gap-5">
          {/* logo */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2 w-fit">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
              style={{ backgroundColor: "#ef4a23" }}
            >
              S
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Shop<span style={{ color: "#ef4a23" }}>Cart</span>
            </span>
          </Link>

          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            Your one-stop destination for premium products at unbeatable prices.
            Fast delivery, easy returns, and 24/7 customer support.
          </p>

          {/* social icons */}
          <div className="flex items-center gap-2 mt-1">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    "#ef4a23";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "#ef4a23";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(255,255,255,0.6)";
                }}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* col 2 — quick links */}
        <FooterLinkList title="Quick Links" links={QUICK_LINKS} />

        {/* col 3 — customer service */}
        <FooterLinkList title="Customer Service" links={CUSTOMER_SERVICE} />

        {/* col 4 — contact */}
        <div>
          <h4
            className="text-base font-bold mb-5 relative inline-block"
            style={{ color: "#ffffff" }}
          >
            Contact Us
            <span
              className="absolute -bottom-1.5 left-0 w-8 h-0.5 rounded-full"
              style={{ backgroundColor: "#ef4a23" }}
            />
          </h4>

          <div className="flex flex-col gap-4">
            <ContactItem icon={MapPin}>
              123 Commerce Street, Suite 100,
              <br />
              New York, NY 10001, USA
            </ContactItem>
            <ContactItem icon={Mail}>
              <a
                href="mailto:support@shopcart.com"
                className="transition-colors hover:text-[#ef4a23]"
              >
                support@shopcart.com
              </a>
            </ContactItem>
            <ContactItem icon={Phone}>
              <a
                href="tel:+18885550103"
                className="transition-colors hover:text-[#ef4a23]"
              >
                +1 (888) 555-0103
              </a>
              <br />
              Mon – Sat, 9am – 6pm EST
            </ContactItem>
          </div>

          {/* payment badges */}
          <div className="mt-6">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              We Accept
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {["Visa", "Mastercard", "Amex", "PayPal", "Stripe"].map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-md text-[11px] font-bold"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div
        className="border-t"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="max-w-[1440px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            © {year} ShopCart. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Cookie Policy", href: "/cookies" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs transition-colors hover:text-[#ef4a23]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}