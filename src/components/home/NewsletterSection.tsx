"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { subscribe } from "../../services/newsletter.service";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: subscribe,
    onSuccess: () => {
      setSuccess(true);
      setEmail("");
      setName("");
      setError("");
    },
    onError: () => {
      setError("Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    mutate({ email, name });
  };

  return (
    <section className="py-14 bg-tech_bg_color dark:bg-[#081621]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative bg-tech_orange rounded-3xl overflow-hidden px-6 py-12 md:px-16 md:py-14">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
            {/* Left */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
                <Mail size={24} className="text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Get the latest deals, new arrivals, and exclusive offers
                delivered straight to your inbox. No spam, ever.
              </p>
            </div>

            {/* Right */}
            <div className="lg:w-1/2 w-full">
              {success ? (
                <div className="flex flex-col items-center justify-center gap-3 bg-white/10 rounded-2xl px-6 py-8 text-center">
                  <CheckCircle2 size={40} className="text-white" />
                  <p className="text-white font-semibold text-lg">
                    You are subscribed!
                  </p>
                  <p className="text-white/80 text-sm">
                    Thank you for subscribing. We will be in touch soon.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-2 text-white/70 text-xs underline hover:text-white transition-colors"
                  >
                    Subscribe another email
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white/10 rounded-2xl px-6 py-6 flex flex-col gap-3"
                >
                  {/* Name */}
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/20 text-white placeholder:text-white/60 text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-white/40 transition-all"
                  />

                  {/* Email + Button */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className={cn(
                        "flex-1 bg-white/20 text-white placeholder:text-white/60 text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-white/40 transition-all",
                        error && "ring-2 ring-red-300"
                      )}
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex items-center gap-2 bg-white text-tech_orange font-semibold text-sm px-5 py-3 rounded-lg hover:bg-white/90 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                    >
                      {isPending ? (
                        <span className="w-4 h-4 border-2 border-tech_orange border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={15} />
                      )}
                      Subscribe
                    </button>
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-red-200 text-xs">{error}</p>
                  )}

                  <p className="text-white/60 text-xs text-center">
                    By subscribing, you agree to our Privacy Policy. Unsubscribe
                    anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}