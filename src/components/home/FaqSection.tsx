"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const faqs = [
  {
    id: "1",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Cash on Delivery for eligible locations.",
  },
  {
    id: "2",
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 3–7 business days. Express shipping is available at checkout and typically delivers within 1–2 business days.",
  },
  {
    id: "3",
    question: "Can I return or exchange a product?",
    answer:
      "Yes, we offer a 30-day return policy. Items must be unused and in original packaging. Visit our Returns page to initiate a return.",
  },
  {
    id: "4",
    question: "How do I track my order?",
    answer:
      "Once your order is shipped, you'll receive an email with a tracking number. You can also track your order from your dashboard under 'My Orders'.",
  },
  {
    id: "5",
    question: "Are the products covered by warranty?",
    answer:
      "Yes, most products come with a manufacturer's warranty. Warranty details are listed on each product page.",
  },
  {
    id: "6",
    question: "Do you offer discounts for bulk orders?",
    answer:
      "Yes, we offer special pricing for bulk orders. Please contact our support team for more information.",
  },
];

function FaqItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "border border-border rounded-xl overflow-hidden transition-all duration-200",
        isOpen
          ? "bg-white dark:bg-tech-dark shadow-md"
          : "bg-white dark:bg-tech-dark hover:shadow-sm"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span
          className={cn(
            "font-semibold text-sm md:text-base transition-colors duration-200",
            isOpen
              ? "text-tech_orange"
              : "text-tech_black dark:text-white"
          )}
        >
          {faq.question}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 transition-transform duration-300 text-tech_orange",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <p className="px-5 pb-4 text-sm text-tech_light_color dark:text-muted-foreground leading-relaxed">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("1");

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-14 bg-white dark:bg-[#081621]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left */}
          <div className="lg:w-1/3 lg:sticky lg:top-24">
            <p className="text-tech_orange font-semibold text-sm uppercase tracking-widest mb-2">
              Got Questions?
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-tech_black dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-tech_light_color dark:text-muted-foreground leading-relaxed mb-6">
              Can not find the answer you are looking for? Feel free to reach
              out to our support team.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-tech_orange text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-tech_dark_red transition-colors duration-200"
            >
              Contact Support
            </a>
          </div>

          {/* Right */}
          <div className="lg:w-2/3 w-full flex flex-col gap-3">
            {faqs.map((faq) => (
              <FaqItem
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                onToggle={() => handleToggle(faq.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}