// src/components/common/AiChatbot.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "bot",
  content:
    "Hi there! 👋 I'm ShopCart AI. Ask me anything about products, orders, or deals!",
  timestamp: new Date(),
};

export default function AiChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        content: data?.reply ?? "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "bot",
          content: "Something went wrong. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* chat window */}
      <div
        className="fixed bottom-24 right-5 z-50 w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: "var(--color-background-primary, #fff)",
          border: "0.5px solid var(--color-border-secondary)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
          maxHeight: open ? "520px" : "0px",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transform: open ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
        }}
      >
        {/* header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <Bot size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-bold leading-none">ShopCart AI</p>
            <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block"
              />
              Online
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/20"
            aria-label="Close chat"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
          style={{
            minHeight: 0,
            maxHeight: "360px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(239,74,35,0.2) transparent",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* bot avatar */}
              {msg.role === "bot" && (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-auto"
                  style={{
                    backgroundColor: "rgba(239,74,35,0.1)",
                    border: "0.5px solid rgba(239,74,35,0.2)",
                  }}
                >
                  <Bot size={13} style={{ color: "#ef4a23" }} />
                </div>
              )}

              <div
                className={`flex flex-col gap-1 max-w-[78%] ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? {
                          backgroundColor: "#ef4a23",
                          color: "#fff",
                          borderBottomRightRadius: "4px",
                        }
                      : {
                          backgroundColor: "var(--color-background-secondary, #f4f4f5)",
                          color: "var(--color-text-primary)",
                          borderBottomLeftRadius: "4px",
                        }
                  }
                >
                  {msg.content}
                </div>
                <span
                  className="text-[10px] px-1"
                  style={{ color: "var(--color-text-tertiary, #9ca3af)" }}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {/* typing indicator */}
          {loading && (
            <div className="flex gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "rgba(239,74,35,0.1)",
                  border: "0.5px solid rgba(239,74,35,0.2)",
                }}
              >
                <Bot size={13} style={{ color: "#ef4a23" }} />
              </div>
              <div
                className="flex items-center gap-1 px-4 py-3 rounded-2xl"
                style={{
                  backgroundColor: "var(--color-background-secondary, #f4f4f5)",
                  borderBottomLeftRadius: "4px",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "#ef4a23",
                      opacity: 0.6,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* input row */}
        <div
          className="flex items-center gap-2 px-3 py-3 flex-shrink-0 border-t"
          style={{ borderColor: "var(--color-border-tertiary)" }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask me anything..."
            disabled={loading}
            className="flex-1 h-10 px-3 rounded-xl text-sm outline-none transition-all"
            style={{
              backgroundColor: "var(--color-background-secondary, #f4f4f5)",
              color: "var(--color-text-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              fontFamily: "'Trebuchet MS', sans-serif",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-opacity hover:opacity-85 disabled:opacity-35 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#ef4a23" }}
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>

      {/* FAB toggle button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "#ef4a23",
          boxShadow: "0 4px 20px rgba(239,74,35,0.4)",
        }}
        aria-label="Toggle AI chat"
      >
        <div
          className="transition-all duration-200"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          {open ? <X size={22} /> : <MessageCircle size={22} />}
        </div>
      </button>
    </>
  );
}