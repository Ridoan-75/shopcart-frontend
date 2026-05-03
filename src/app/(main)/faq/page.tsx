// src/app/(main)/faq/page.tsx
"use client";

import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  // Orders
  { id: "1", category: "Orders", question: "How do I track my order?", answer: "You can track your order by visiting the 'My Orders' section in your account dashboard. Each order has a tracking number once it's shipped, which you can use on the carrier's website for real-time updates." },
  { id: "2", category: "Orders", question: "Can I cancel or modify my order after placing it?", answer: "Orders can be cancelled or modified within 1 hour of placement. After that, the order enters processing and changes may not be possible. Contact our support team immediately if you need to make changes." },
  { id: "3", category: "Orders", question: "What payment methods do you accept?", answer: "We accept all major credit/debit cards (Visa, Mastercard, American Express), PayPal, and Stripe. We also offer Cash on Delivery (COD) for eligible areas." },
  { id: "4", category: "Orders", question: "Is it safe to use my credit card on ShopCart?", answer: "Absolutely. We use industry-standard SSL encryption and all payments are processed through Stripe, one of the world's most trusted payment platforms. We never store your card details." },
  // Shipping
  { id: "5", category: "Shipping", question: "How long does delivery take?", answer: "Standard delivery takes 3–7 business days. Express delivery (1–2 days) is available for an additional fee. Free shipping is offered on orders above $50." },
  { id: "6", category: "Shipping", question: "Do you ship internationally?", answer: "Currently, we ship to the US, Canada, and most EU countries. International shipping times vary between 7–21 business days depending on the destination." },
  { id: "7", category: "Shipping", question: "What if my package is damaged during shipping?", answer: "If your package arrives damaged, please take photos immediately and contact our support team within 48 hours. We'll arrange a replacement or refund at no extra cost to you." },
  // Returns
  { id: "8", category: "Returns", question: "What is your return policy?", answer: "We offer a 30-day hassle-free return policy. Items must be in original condition with tags attached. Some categories like personal care and digital downloads are non-returnable." },
  { id: "9", category: "Returns", question: "How long does a refund take?", answer: "Once we receive your returned item, refunds are processed within 2–3 business days. It may take an additional 3–5 days to appear in your account depending on your bank." },
  { id: "10", category: "Returns", question: "Who pays for return shipping?", answer: "If the return is due to our error (wrong item, defective product), we cover the return shipping cost. For change-of-mind returns, the customer is responsible for shipping costs." },
  // Account
  { id: "11", category: "Account", question: "How do I create an account?", answer: "Click 'Register' in the top navigation. Fill in your name, email, and password. You'll receive a verification email to activate your account." },
  { id: "12", category: "Account", question: "I forgot my password. How do I reset it?", answer: "Click 'Login' then 'Forgot Password'. Enter your registered email and we'll send you a password reset link valid for 24 hours." },
  { id: "13", category: "Account", question: "How do I update my delivery address?", answer: "Go to your account dashboard and select 'Addresses'. You can add, edit, or delete addresses there. You can also set a default address for faster checkout." },
  // Products
  { id: "14", category: "Products", question: "Are all products on ShopCart authentic?", answer: "Yes. We only partner with verified sellers and authorized brand distributors. Every product goes through our quality verification process before being listed." },
  { id: "15", category: "Products", question: "Can I leave a review for a product?", answer: "Yes! After purchasing a product, you can leave a review from your order history page. Reviews are only accepted from verified buyers to ensure authenticity." },
];

const CATEGORIES = ["All", "Orders", "Shipping", "Returns", "Account", "Products"];

function FaqAccordion({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: isOpen ? "1.5px solid rgba(239,74,35,0.3)" : "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span
          className="text-sm font-semibold pr-4"
          style={{ color: isOpen ? "#ef4a23" : "var(--color-text-primary)" }}
        >
          {item.question}
        </span>
        <ChevronDown
          size={18}
          className="flex-shrink-0 transition-transform duration-300"
          style={{
            color: isOpen ? "#ef4a23" : "var(--color-text-tertiary)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? "400px" : "0px" }}
      >
        <p
          className="px-5 pb-5 text-sm leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = FAQS.filter((faq) => {
    const matchCat = category === "All" || faq.category === category;
    const matchSearch =
      !search ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-16">
      {/* header */}
      <div className="text-center mb-10">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23" }}>
          Help Center
        </span>
        <h1 className="text-3xl font-black mb-2" style={{ color: "var(--color-text-primary)" }}>
          Frequently Asked Questions
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Find answers to the most common questions about ShopCart.
        </p>
      </div>

      {/* search */}
      <div
        className="flex items-center rounded-2xl overflow-hidden mb-6"
        style={{ border: "1px solid var(--color-border-secondary)", backgroundColor: "var(--color-background-primary)" }}
      >
        <div className="px-4" style={{ color: "#ef4a23" }}>
          <Search size={16} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search FAQ..."
          className="flex-1 h-12 text-sm bg-transparent outline-none"
          style={{ color: "var(--color-text-primary)", fontFamily: "'Trebuchet MS', sans-serif" }}
        />
        {search && (
          <button onClick={() => setSearch("")} className="px-4" style={{ color: "var(--color-text-tertiary)" }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* category tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl overflow-x-auto mb-8"
        style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="px-4 h-8 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
            style={{
              backgroundColor: category === cat ? "#ef4a23" : "transparent",
              color: category === cat ? "#fff" : "var(--color-text-secondary)",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* result count */}
      <p className="text-xs mb-4" style={{ color: "var(--color-text-tertiary)" }}>
        {filtered.length} {filtered.length === 1 ? "result" : "results"} found
        {search && ` for "${search}"`}
      </p>

      {/* accordion list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No results found</p>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Try a different keyword or browse all categories.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((faq) => (
            <FaqAccordion
              key={faq.id}
              item={faq}
              isOpen={openId === faq.id}
              onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
            />
          ))}
        </div>
      )}

      {/* still need help */}
      <div
        className="mt-12 p-7 rounded-2xl text-center"
        style={{ backgroundColor: "rgba(239,74,35,0.05)", border: "1px solid rgba(239,74,35,0.2)" }}
      >
        <p className="text-base font-black mb-1" style={{ color: "var(--color-text-primary)" }}>
          Still have questions?
        </p>
        <p className="text-sm mb-5" style={{ color: "var(--color-text-secondary)" }}>
          Our support team is available 7 days a week.
        </p>
        <a
          href="/contact"
          className="inline-flex h-10 px-6 rounded-xl text-sm font-bold text-white items-center gap-2 transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}