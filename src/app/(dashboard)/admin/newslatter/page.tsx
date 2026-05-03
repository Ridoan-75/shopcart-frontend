// src/app/(dashboard)/admin/newsletter/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Trash2,
  Search,
  Download,
  Send,
  X,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import { newsletterService } from "../../../../services/newsletter.service";

interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

const INPUT_STYLE = {
  border: "0.5px solid var(--color-border-secondary)",
  backgroundColor: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
};

export default function AdminNewsletterPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.NEWSLETTER],
    queryFn: () => newsletterService.getAll(),
  });

  const subscribers: Subscriber[] = (data?.data ?? []).filter((s: Subscriber) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsletterService.unsubscribe(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.NEWSLETTER] });
      toast.success("Subscriber removed!");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to remove subscriber"),
  });

  const handleExportCSV = () => {
    const rows = [
      ["Email", "Status", "Subscribed At"],
      ...subscribers.map((s) => [
        s.email,
        s.isActive ? "Active" : "Inactive",
        new Date(s.subscribedAt).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  const handleBroadcast = async () => {
    if (!broadcastForm.subject.trim()) return toast.error("Subject is required");
    if (!broadcastForm.message.trim()) return toast.error("Message is required");
    setSending(true);
    try {
      await newsletterService.broadcast(broadcastForm);
      toast.success("Broadcast sent successfully!");
      setBroadcastOpen(false);
      setBroadcastForm({ subject: "", message: "" });
    } catch {
      toast.error("Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  const activeCount = (data?.data ?? []).filter((s: Subscriber) => s.isActive).length;
  const totalCount = data?.data?.length ?? 0;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Newsletter
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Manage subscribers and send broadcasts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{
              border: "0.5px solid var(--color-border-secondary)",
              color: "var(--color-text-secondary)",
              backgroundColor: "var(--color-background-primary)",
            }}
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            onClick={() => setBroadcastOpen(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#ef4a23" }}
          >
            <Send size={15} />
            Send Broadcast
          </button>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          {
            label: "Total Subscribers",
            value: totalCount,
            icon: Users,
            color: "#3749bb",
            bg: "rgba(55,73,187,0.08)",
          },
          {
            label: "Active Subscribers",
            value: activeCount,
            icon: Mail,
            color: "#ef4a23",
            bg: "rgba(239,74,35,0.08)",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              backgroundColor: stat.bg,
              border: `0.5px solid ${stat.color}25`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div>
              <p
                className="text-2xl font-black leading-none"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs font-medium mt-0.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* search */}
      <div className="mb-5">
        <div
          className="flex items-center max-w-sm rounded-xl overflow-hidden"
          style={{ border: "0.5px solid var(--color-border-secondary)" }}
        >
          <div className="pl-3">
            <Search size={15} style={{ color: "var(--color-text-tertiary)" }} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="flex-1 h-10 px-3 text-sm outline-none"
            style={{
              backgroundColor: "var(--color-background-secondary)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>
      </div>

      {/* table */}
      {isLoading ? (
        <Loader fullPage={false} text="Loading subscribers..." />
      ) : subscribers.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <Mail size={32} style={{ color: "var(--color-text-tertiary)" }} className="mb-3" />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {search ? "No subscribers match your search." : "No subscribers yet."}
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--color-background-secondary)" }}>
                {["#", "Email", "Status", "Subscribed At", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub, i) => (
                <tr
                  key={sub._id}
                  style={{
                    borderTop: i > 0 ? "0.5px solid var(--color-border-tertiary)" : "none",
                    backgroundColor: "var(--color-background-primary)",
                  }}
                >
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: "rgba(239,74,35,0.1)",
                          color: "#ef4a23",
                        }}
                      >
                        <Mail size={13} />
                      </div>
                      <span
                        className="font-medium text-sm"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {sub.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={
                        sub.isActive
                          ? {
                              backgroundColor: "rgba(34,197,94,0.1)",
                              color: "#16a34a",
                            }
                          : {
                              backgroundColor: "rgba(240,39,87,0.1)",
                              color: "#f02757",
                            }
                      }
                    >
                      {sub.isActive ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {formatDate(sub.subscribedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteId(sub._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                      style={{ color: "#f02757" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Broadcast Modal */}
      {broadcastOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <h2 className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
                Send Broadcast
              </h2>
              <button
                onClick={() => setBroadcastOpen(false)}
                style={{ color: "var(--color-text-secondary)" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                style={{
                  backgroundColor: "rgba(239,74,35,0.06)",
                  border: "0.5px solid rgba(239,74,35,0.2)",
                  color: "#ef4a23",
                }}
              >
                <Users size={14} />
                Will be sent to {activeCount} active subscribers
              </div>
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Subject *
                </label>
                <input
                  type="text"
                  value={broadcastForm.subject}
                  onChange={(e) =>
                    setBroadcastForm((p) => ({ ...p, subject: e.target.value }))
                  }
                  placeholder="Email subject line"
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                  style={INPUT_STYLE}
                />
              </div>
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Message *
                </label>
                <textarea
                  value={broadcastForm.message}
                  onChange={(e) =>
                    setBroadcastForm((p) => ({ ...p, message: e.target.value }))
                  }
                  placeholder="Write your newsletter message here..."
                  rows={6}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                  style={INPUT_STYLE}
                />
              </div>
            </div>
            <div
              className="flex items-center justify-end gap-3 px-6 py-4 border-t"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <button
                onClick={() => setBroadcastOpen(false)}
                className="h-10 px-4 rounded-xl text-sm font-medium"
                style={{
                  border: "0.5px solid var(--color-border-secondary)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcast}
                disabled={sending}
                className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
                style={{ backgroundColor: "#ef4a23" }}
              >
                <Send size={14} />
                {sending ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
            }}
          >
            <h2 className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
              Remove Subscriber?
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              This will permanently remove the subscriber from the newsletter list.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="h-10 px-4 rounded-xl text-sm font-medium"
                style={{
                  border: "0.5px solid var(--color-border-secondary)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="h-10 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
                style={{ backgroundColor: "#f02757" }}
              >
                {deleteMutation.isPending ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}