// src/app/(main)/contact/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MapPin, Mail, Phone, Send, Loader2, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(4, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%",
  height: "44px",
  paddingLeft: "16px",
  paddingRight: "16px",
  borderRadius: "12px",
  fontSize: "14px",
  outline: "none",
  backgroundColor: "var(--color-background-secondary)",
  border: hasError ? "1.5px solid #f02757" : "1px solid var(--color-border-secondary)",
  color: "var(--color-text-primary)",
  fontFamily: "'Trebuchet MS', sans-serif",
});

function ContactCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-4 p-5 rounded-2xl"
      style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>{title}</p>
        <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{children}</div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      // POST /contacts or email endpoint
      await new Promise((res) => setTimeout(res, 1000)); // simulate API
      setSent(true);
      reset();
      toast.success("Message sent! We'll get back to you shortly.");
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-16">
      {/* header */}
      <div className="text-center mb-12">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23" }}>
          Get In Touch
        </span>
        <h1 className="text-3xl font-black mb-2" style={{ color: "var(--color-text-primary)" }}>Contact Us</h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Have a question or need help? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* left — contact info */}
        <div className="flex flex-col gap-4">
          <ContactCard icon={MapPin} title="Our Address">
            123 Commerce Street, Suite 100<br />
            New York, NY 10001, USA
          </ContactCard>
          <ContactCard icon={Mail} title="Email Us">
            <a href="mailto:support@shopcart.com" className="hover:text-[#ef4a23] transition-colors">
              support@shopcart.com
            </a>
          </ContactCard>
          <ContactCard icon={Phone} title="Call Us">
            <a href="tel:+18885550103" className="hover:text-[#ef4a23] transition-colors">
              +1 (888) 555-0103
            </a>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>Mon – Sat, 9am – 6pm EST</p>
          </ContactCard>

          {/* socials */}
          <div
            className="p-5 rounded-2xl"
            style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
          >
            <p className="text-sm font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>Follow Us</p>
            <div className="flex items-center gap-2">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23", border: "0.5px solid rgba(239,74,35,0.2)" }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* right — contact form */}
        <div
          className="lg:col-span-2 rounded-2xl p-7"
          style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
        >
          {sent ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
                <Send size={28} className="text-green-500" />
              </div>
              <h3 className="text-lg font-black" style={{ color: "var(--color-text-primary)" }}>Message Sent!</h3>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Thanks for reaching out. We'll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-2 text-sm font-semibold hover:underline"
                style={{ color: "#ef4a23" }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <h2 className="text-base font-black mb-1" style={{ color: "var(--color-text-primary)" }}>Send us a Message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>Full Name *</label>
                  <input {...register("name")} style={inputStyle(!!errors.name)} placeholder="John Doe" />
                  {errors.name && <p className="text-xs" style={{ color: "#f02757" }}>{errors.name.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>Email Address *</label>
                  <input {...register("email")} type="email" style={inputStyle(!!errors.email)} placeholder="you@example.com" />
                  {errors.email && <p className="text-xs" style={{ color: "#f02757" }}>{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>Phone (optional)</label>
                  <input {...register("phone")} style={inputStyle()} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>Subject *</label>
                  <input {...register("subject")} style={inputStyle(!!errors.subject)} placeholder="How can we help?" />
                  {errors.subject && <p className="text-xs" style={{ color: "#f02757" }}>{errors.subject.message}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>Message *</label>
                <textarea
                  {...register("message")}
                  rows={5}
                  placeholder="Write your message here..."
                  style={{
                    ...inputStyle(!!errors.message),
                    height: "auto",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    resize: "none",
                  }}
                />
                {errors.message && <p className="text-xs" style={{ color: "#f02757" }}>{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="self-start h-12 px-8 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50"
                style={{ backgroundColor: "#ef4a23" }}
              >
                {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}