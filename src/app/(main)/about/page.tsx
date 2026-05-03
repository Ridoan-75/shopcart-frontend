// src/app/(main)/about/page.tsx
import Link from "next/link";
import { Users, Package, Award, ThumbsUp, ArrowRight, Heart, Shield, Zap } from "lucide-react";
import { ROUTES } from "../../../constants/routes";

const STATS = [
  { icon: Users, value: "10K+", label: "Happy Customers", color: "#ef4a23" },
  { icon: Package, value: "5K+", label: "Products", color: "#3749bb" },
  { icon: Award, value: "50+", label: "Brands", color: "#8b5cf6" },
  { icon: ThumbsUp, value: "99%", label: "Satisfaction Rate", color: "#22c55e" },
];

const TEAM = [
  { name: "Alex Morgan", role: "CEO & Founder", initials: "AM" },
  { name: "Sarah Chen", role: "Head of Design", initials: "SC" },
  { name: "James Wright", role: "CTO", initials: "JW" },
  { name: "Priya Patel", role: "Head of Marketing", initials: "PP" },
];

const VALUES = [
  { icon: Heart, title: "Customer First", description: "Everything we do starts with our customers. Their satisfaction drives every decision we make." },
  { icon: Shield, title: "Trust & Security", description: "We ensure every transaction is safe, secure, and protected with industry-leading standards." },
  { icon: Zap, title: "Fast & Reliable", description: "Lightning-fast delivery and a platform built for speed, reliability, and ease of use." },
];

export default function AboutPage() {
  return (
    <div>
      {/* hero */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #ef4a23 0%, #c73d1a 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            About Us
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
            We're Building the Future of Shopping
          </h1>
          <p className="text-white/75 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            ShopCart was founded with a simple mission: make premium products accessible to everyone, everywhere — with a shopping experience that's actually enjoyable.
          </p>
        </div>
      </section>

      {/* mission & vision */}
      <section className="py-20" style={{ backgroundColor: "var(--color-background-primary)" }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: "var(--color-background-tertiary)", border: "0.5px solid var(--color-border-tertiary)" }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block" style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}>
              Our Mission
            </span>
            <h2 className="text-xl font-black mb-3" style={{ color: "var(--color-text-primary)" }}>
              Empowering Every Shopper
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Our mission is to connect people with the products they love at prices that make sense. We partner with top brands and emerging sellers to offer an unmatched selection, backed by fast delivery and real customer support.
            </p>
          </div>
          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: "var(--color-background-tertiary)", border: "0.5px solid var(--color-border-tertiary)" }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block" style={{ backgroundColor: "rgba(55,73,187,0.1)", color: "#3749bb" }}>
              Our Vision
            </span>
            <h2 className="text-xl font-black mb-3" style={{ color: "var(--color-text-primary)" }}>
              The World's Most Trusted Store
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              We envision a world where shopping is effortless, transparent, and personal. A platform where technology meets humanity — where AI helps you find exactly what you need before you even know you need it.
            </p>
          </div>
        </div>
      </section>

      {/* values */}
      <section className="py-20" style={{ backgroundColor: "var(--color-background-tertiary)" }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23" }}>
              What We Stand For
            </span>
            <h2 className="text-2xl md:text-3xl font-black" style={{ color: "var(--color-text-primary)" }}>Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((val) => (
              <div
                key={val.title}
                className="flex flex-col gap-4 p-7 rounded-2xl"
                style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
                >
                  <val.icon size={22} />
                </div>
                <h3 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>{val.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="py-20" style={{ backgroundColor: "#081621" }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-white">ShopCart by the Numbers</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                  <stat.icon size={22} />
                </div>
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* team */}
      <section className="py-20" style={{ backgroundColor: "var(--color-background-primary)" }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23" }}>
              The People
            </span>
            <h2 className="text-2xl md:text-3xl font-black" style={{ color: "var(--color-text-primary)" }}>Meet Our Team</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl text-center"
                style={{ backgroundColor: "var(--color-background-tertiary)", border: "0.5px solid var(--color-border-tertiary)" }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-black"
                  style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23", border: "2px solid rgba(239,74,35,0.2)" }}
                >
                  {member.initials}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{member.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16 text-center"
        style={{ backgroundColor: "var(--color-background-tertiary)" }}
      >
        <div className="max-w-lg mx-auto px-4">
          <h2 className="text-2xl font-black mb-3" style={{ color: "var(--color-text-primary)" }}>Ready to Start Shopping?</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
            Join thousands of happy customers who trust ShopCart every day.
          </p>
          <Link
            href={ROUTES.PRODUCTS}
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#ef4a23" }}
          >
            Browse Products <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}