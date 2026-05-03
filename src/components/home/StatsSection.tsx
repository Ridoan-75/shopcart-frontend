// src/components/home/StatsSection.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Package, Award, ThumbsUp } from "lucide-react";

interface StatItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  {
    icon: <Users className="w-8 h-8" />,
    value: 10000,
    suffix: "+",
    label: "Happy Customers",
  },
  {
    icon: <Package className="w-8 h-8" />,
    value: 5000,
    suffix: "+",
    label: "Products",
  },
  {
    icon: <Award className="w-8 h-8" />,
    value: 50,
    suffix: "+",
    label: "Brands",
  },
  {
    icon: <ThumbsUp className="w-8 h-8" />,
    value: 99,
    suffix: "%",
    label: "Satisfaction Rate",
  },
];

function useCountUp(target: number, duration: number, triggered: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!triggered) return;

    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [triggered, target, duration]);

  return count;
}

interface StatCardProps {
  stat: StatItem;
  triggered: boolean;
  index: number;
}

function StatCard({ stat, triggered, index }: StatCardProps) {
  const count = useCountUp(stat.value, 2000, triggered);

  const formatted =
    stat.value >= 1000 ? `${(count / 1000).toFixed(count < stat.value ? 0 : 0)}K` : count;

  const displayValue =
    stat.value >= 1000
      ? `${Math.floor(count / 1000)}K${stat.suffix}`
      : `${count}${stat.suffix}`;

  return (
    <div
      className="flex flex-col items-center text-center gap-4 p-8 group"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div
        className="p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: "rgba(239,74,35,0.15)", color: "#ef4a23" }}
      >
        {stat.icon}
      </div>

      <div>
        <p
          className="text-4xl font-bold tracking-tight"
          style={{ color: "#ffffff" }}
        >
          {displayValue}
        </p>
        <p
          className="mt-1 text-sm font-medium tracking-wide uppercase"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          {stat.label}
        </p>
      </div>
    </div>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 relative overflow-hidden"
      style={{ backgroundColor: "#081621" }}
    >
      {/* subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(239,74,35,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(239,74,35,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* glow blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(239,74,35,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4">
        {/* section heading */}
        <div className="text-center mb-14">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
            style={{
              backgroundColor: "rgba(239,74,35,0.15)",
              color: "#ef4a23",
            }}
          >
            By the numbers
          </span>
          <h2 className="text-3xl font-bold" style={{ color: "#ffffff" }}>
            Trusted by thousands
          </h2>
        </div>

        {/* divider lines between cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 border border-white/10 rounded-2xl overflow-hidden">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} triggered={triggered} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}