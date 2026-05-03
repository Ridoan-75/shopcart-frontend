// src/components/home/TestimonialsSection.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  review: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Verified Buyer",
    avatar: "SJ",
    rating: 5,
    review:
      "Absolutely love ShopCart! The delivery was lightning fast and the product quality exceeded my expectations. Will definitely be ordering again soon.",
  },
  {
    id: 2,
    name: "Mohammed Al-Rashid",
    role: "Regular Customer",
    avatar: "MA",
    rating: 5,
    review:
      "Best e-commerce experience I've had. The AI chatbot helped me find exactly what I was looking for, and checkout was seamless. Highly recommend!",
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Verified Buyer",
    avatar: "PS",
    rating: 4,
    review:
      "Great selection of products and competitive prices. The flash sale feature is amazing — I saved over 40% on my last purchase. Customer support is top notch.",
  },
  {
    id: 4,
    name: "James Whitfield",
    role: "Tech Enthusiast",
    avatar: "JW",
    rating: 5,
    review:
      "Incredible platform. The product pages are detailed, reviews are genuine, and shipping tracking is real-time. Nothing comes close to this experience.",
  },
  {
    id: 5,
    name: "Anika Rahman",
    role: "Fashion Lover",
    avatar: "AR",
    rating: 5,
    review:
      "I've tried many online shops but ShopCart stands out. The wishlist feature and personalized recommendations make shopping so enjoyable and easy.",
  },
  {
    id: 6,
    name: "Carlos Mendez",
    role: "Small Business Owner",
    avatar: "CM",
    rating: 4,
    review:
      "I bulk order for my business regularly. ShopCart's pricing, coupon system, and reliable delivery make it my go-to platform every single time.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-4 h-4"
          fill={i < rating ? "#ef4a23" : "none"}
          stroke={i < rating ? "#ef4a23" : "#d1d5db"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function AvatarCircle({ initials }: { initials: string }) {
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{
        backgroundColor: "rgba(239,74,35,0.12)",
        color: "#ef4a23",
        border: "2px solid rgba(239,74,35,0.25)",
      }}
    >
      {initials}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  active,
}: {
  testimonial: Testimonial;
  active: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-4 p-6 rounded-2xl h-full transition-all duration-300"
      style={{
        backgroundColor: active
          ? "rgba(239,74,35,0.05)"
          : "var(--color-background-primary, #fff)",
        border: active
          ? "1px solid rgba(239,74,35,0.3)"
          : "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
        transform: active ? "translateY(-4px)" : "none",
      }}
    >
      {/* quote icon */}
      <Quote
        className="w-7 h-7 flex-shrink-0"
        style={{ color: "#ef4a23", opacity: 0.4 }}
        fill="#ef4a23"
      />

      {/* review text */}
      <p
        className="text-sm leading-relaxed flex-1"
        style={{ color: "var(--color-text-secondary, #52525b)" }}
      >
        {testimonial.review}
      </p>

      {/* rating */}
      <StarRating rating={testimonial.rating} />

      {/* author */}
      <div className="flex items-center gap-3 pt-2 border-t"
        style={{ borderColor: "var(--color-border-tertiary, rgba(0,0,0,0.08))" }}
      >
        <AvatarCircle initials={testimonial.avatar} />
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-primary, #000)" }}
          >
            {testimonial.name}
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--color-text-tertiary, #9ca3af)" }}
          >
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
}

const CARDS_PER_VIEW = 3;
const AUTO_SLIDE_INTERVAL = 4000;

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxIndex = testimonials.length - CARDS_PER_VIEW;

  const next = () => setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  const prev = () => setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTO_SLIDE_INTERVAL);
  };

  useEffect(() => {
    timerRef.current = setInterval(next, AUTO_SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };
  const handleDot = (i: number) => { setActiveIndex(i); resetTimer(); };

  // visible 3 cards based on activeIndex
  const visible = testimonials.slice(activeIndex, activeIndex + CARDS_PER_VIEW);

  return (
    <section className="py-20" style={{ backgroundColor: "var(--color-background-tertiary, #f2f4f8)" }}>
      <div className="max-w-6xl mx-auto px-4">

        {/* header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
              style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
            >
              Testimonials
            </span>
            <h2
              className="text-3xl font-bold"
              style={{ color: "var(--color-text-primary, #000)" }}
            >
              What our customers say
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--color-text-secondary, #52525b)" }}
            >
              Real reviews from real people who love shopping with us.
            </p>
          </div>

          {/* nav buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                border: "1px solid rgba(239,74,35,0.35)",
                color: "#ef4a23",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ef4a23";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#ef4a23";
              }}
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: "#ef4a23",
                color: "#fff",
                border: "1px solid #ef4a23",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              }}
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* cards grid — desktop 3 col, tablet 2, mobile 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((t, i) => (
            <TestimonialCard
              key={t.id}
              testimonial={t}
              active={i === 1}
            />
          ))}
        </div>

        {/* dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleDot(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: activeIndex === i ? "24px" : "8px",
                height: "8px",
                backgroundColor:
                  activeIndex === i ? "#ef4a23" : "rgba(239,74,35,0.25)",
                border: "none",
                cursor: "pointer",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}