// src/app/(dashboard)/admin/coupons/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight, Tag } from "lucide-react";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import { couponService } from "../../../../services/coupon.service";

type DiscountType = "PERCENTAGE" | "FIXED";

interface Coupon {
  _id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

interface CouponForm {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  usageLimit: number;
  expiresAt: string;
  isActive: boolean;
}

const DEFAULT_FORM: CouponForm = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 10,
  minOrderAmount: 0,
  maxDiscount: 0,
  usageLimit: 0,
  expiresAt: "",
  isActive: true,
};

const INPUT_STYLE = {
  border: "0.5px solid var(--color-border-secondary)",
  backgroundColor: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
};

function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function AdminCouponsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(DEFAULT_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.COUPONS],
    queryFn: () => couponService.getAll(),
  });

  const coupons: Coupon[] = (data?.data ?? []).filter((c: Coupon) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (payload: any) => couponService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.COUPONS] });
      toast.success("Coupon created!");
      closeModal();
    },
    onError: () => toast.error("Failed to create coupon"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      couponService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.COUPONS] });
      toast.success("Coupon updated!");
      closeModal();
    },
    onError: () => toast.error("Failed to update coupon"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.COUPONS] });
      toast.success("Coupon deleted!");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete coupon"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      couponService.update(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.COUPONS] }),
    onError: () => toast.error("Failed to toggle coupon"),
  });

  const openCreate = () => {
    setEditId(null);
    setForm({ ...DEFAULT_FORM, code: generateCode() });
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditId(coupon._id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount ?? 0,
      maxDiscount: coupon.maxDiscount ?? 0,
      usageLimit: coupon.usageLimit ?? 0,
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().slice(0, 10)
        : "",
      isActive: coupon.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(DEFAULT_FORM);
  };

  const handleSubmit = () => {
    if (!form.code.trim()) return toast.error("Code is required");
    if (form.discountValue <= 0) return toast.error("Discount value must be greater than 0");
    if (form.discountType === "PERCENTAGE" && form.discountValue > 100)
      return toast.error("Percentage discount cannot exceed 100%");

    const payload = {
      code: form.code.toUpperCase().trim(),
      discountType: form.discountType,
      discountValue: form.discountValue,
      minOrderAmount: form.minOrderAmount || undefined,
      maxDiscount: form.maxDiscount || undefined,
      usageLimit: form.usageLimit || undefined,
      expiresAt: form.expiresAt || undefined,
      isActive: form.isActive,
    };

    if (editId) {
      updateMutation.mutate({ id: editId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const isExpired = (expiresAt?: string) =>
    expiresAt ? new Date(expiresAt) < new Date() : false;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Coupons
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Manage discount coupons and promo codes
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <Plus size={16} />
          Add Coupon
        </button>
      </div>

      {/* search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by coupon code..."
          className="w-full max-w-sm h-10 px-3 rounded-xl text-sm outline-none"
          style={INPUT_STYLE}
        />
      </div>

      {/* table */}
      {isLoading ? (
        <Loader fullPage={false} text="Loading coupons..." />
      ) : coupons.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <Tag size={32} style={{ color: "var(--color-text-tertiary)" }} className="mb-3" />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {search
              ? "No coupons match your search."
              : 'No coupons yet. Click "Add Coupon" to create one.'}
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
                {[
                  "Code",
                  "Type",
                  "Discount",
                  "Min Order",
                  "Usage",
                  "Expires",
                  "Status",
                  "Actions",
                ].map((h) => (
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
              {coupons.map((coupon, i) => {
                const expired = isExpired(coupon.expiresAt);
                return (
                  <tr
                    key={coupon._id}
                    style={{
                      borderTop:
                        i > 0 ? "0.5px solid var(--color-border-tertiary)" : "none",
                      backgroundColor: "var(--color-background-primary)",
                    }}
                  >
                    {/* code */}
                    <td className="px-4 py-3">
                      <span
                        className="px-3 py-1 rounded-lg text-sm font-mono font-bold tracking-widest"
                        style={{
                          backgroundColor: "rgba(239,74,35,0.08)",
                          color: "#ef4a23",
                          border: "0.5px solid rgba(239,74,35,0.2)",
                        }}
                      >
                        {coupon.code}
                      </span>
                    </td>

                    {/* type */}
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={
                          coupon.discountType === "PERCENTAGE"
                            ? {
                                backgroundColor: "rgba(55,73,187,0.1)",
                                color: "#3749bb",
                              }
                            : {
                                backgroundColor: "rgba(239,74,35,0.1)",
                                color: "#ef4a23",
                              }
                        }
                      >
                        {coupon.discountType === "PERCENTAGE" ? "%" : "$"} Fixed
                      </span>
                    </td>

                    {/* discount */}
                    <td
                      className="px-4 py-3 font-bold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}%`
                        : `$${coupon.discountValue}`}
                      {coupon.maxDiscount && coupon.discountType === "PERCENTAGE" ? (
                        <span
                          className="text-xs font-normal ml-1"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          (max ${coupon.maxDiscount})
                        </span>
                      ) : null}
                    </td>

                    {/* min order */}
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {coupon.minOrderAmount ? `$${coupon.minOrderAmount}` : "—"}
                    </td>

                    {/* usage */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {coupon.usedCount}
                        </span>
                        {coupon.usageLimit ? (
                          <span
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                          >
                            / {coupon.usageLimit}
                          </span>
                        ) : (
                          <span
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                          >
                            / ∞
                          </span>
                        )}
                      </div>
                      {coupon.usageLimit && coupon.usedCount >= coupon.usageLimit && (
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: "#f02757" }}
                        >
                          Limit reached
                        </span>
                      )}
                    </td>

                    {/* expires */}
                    <td className="px-4 py-3">
                      {coupon.expiresAt ? (
                        <span
                          className="text-xs font-medium"
                          style={{ color: expired ? "#f02757" : "var(--color-text-secondary)" }}
                        >
                          {expired ? "Expired " : ""}
                          {formatDate(coupon.expiresAt)}
                        </span>
                      ) : (
                        <span
                          className="text-xs"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          No expiry
                        </span>
                      )}
                    </td>

                    {/* toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          toggleMutation.mutate({
                            id: coupon._id,
                            isActive: !coupon.isActive,
                          })
                        }
                        className="transition-opacity hover:opacity-70"
                      >
                        {coupon.isActive ? (
                          <ToggleRight size={28} style={{ color: "#ef4a23" }} />
                        ) : (
                          <ToggleLeft
                            size={28}
                            style={{ color: "var(--color-text-tertiary)" }}
                          />
                        )}
                      </button>
                    </td>

                    {/* actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          style={{ color: "#3749bb" }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(coupon._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                          style={{ color: "#f02757" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
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
            {/* modal header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <h2
                className="font-bold text-base"
                style={{ color: "var(--color-text-primary)" }}
              >
                {editId ? "Edit Coupon" : "Add Coupon"}
              </h2>
              <button onClick={closeModal} style={{ color: "var(--color-text-secondary)" }}>
                <X size={18} />
              </button>
            </div>

            {/* modal body */}
            <div className="p-6 flex flex-col gap-4">
              {/* code + generate */}
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Coupon Code *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. SAVE20"
                    className="flex-1 h-10 px-3 rounded-xl text-sm outline-none font-mono font-bold tracking-widest"
                    style={INPUT_STYLE}
                  />
                  {!editId && (
                    <button
                      onClick={() =>
                        setForm((p) => ({ ...p, code: generateCode() }))
                      }
                      className="h-10 px-3 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80 flex-shrink-0"
                      style={{
                        border: "0.5px solid var(--color-border-secondary)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Generate
                    </button>
                  )}
                </div>
              </div>

              {/* discount type */}
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Discount Type
                </label>
                <div className="flex gap-2">
                  {(["PERCENTAGE", "FIXED"] as DiscountType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm((p) => ({ ...p, discountType: type }))}
                      className="flex-1 h-10 rounded-xl text-sm font-semibold transition-all"
                      style={
                        form.discountType === type
                          ? {
                              backgroundColor: "#ef4a23",
                              color: "#fff",
                              border: "0.5px solid #ef4a23",
                            }
                          : {
                              backgroundColor: "var(--color-background-secondary)",
                              color: "var(--color-text-secondary)",
                              border: "0.5px solid var(--color-border-secondary)",
                            }
                      }
                    >
                      {type === "PERCENTAGE" ? "Percentage (%)" : "Fixed Amount ($)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* discount value + max discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="text-xs font-bold uppercase tracking-widest mb-2 block"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Discount Value *
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold"
                      style={{ color: "#ef4a23" }}
                    >
                      {form.discountType === "PERCENTAGE" ? "%" : "$"}
                    </span>
                    <input
                      type="number"
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          discountValue: Number(e.target.value),
                        }))
                      }
                      min={1}
                      max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                      className="w-full h-10 pl-7 pr-3 rounded-xl text-sm outline-none"
                      style={INPUT_STYLE}
                    />
                  </div>
                </div>

                {form.discountType === "PERCENTAGE" && (
                  <div>
                    <label
                      className="text-xs font-bold uppercase tracking-widest mb-2 block"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      Max Discount ($)
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        $
                      </span>
                      <input
                        type="number"
                        value={form.maxDiscount}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            maxDiscount: Number(e.target.value),
                          }))
                        }
                        min={0}
                        placeholder="0 = no limit"
                        className="w-full h-10 pl-7 pr-3 rounded-xl text-sm outline-none"
                        style={INPUT_STYLE}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* min order + usage limit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="text-xs font-bold uppercase tracking-widest mb-2 block"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Min Order ($)
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      value={form.minOrderAmount}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          minOrderAmount: Number(e.target.value),
                        }))
                      }
                      min={0}
                      placeholder="0 = no minimum"
                      className="w-full h-10 pl-7 pr-3 rounded-xl text-sm outline-none"
                      style={INPUT_STYLE}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="text-xs font-bold uppercase tracking-widest mb-2 block"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        usageLimit: Number(e.target.value),
                      }))
                    }
                    min={0}
                    placeholder="0 = unlimited"
                    className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                    style={INPUT_STYLE}
                  />
                </div>
              </div>

              {/* expiry date */}
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, expiresAt: e.target.value }))
                  }
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                  style={INPUT_STYLE}
                />
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Leave empty for no expiry
                </p>
              </div>

              {/* active toggle */}
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Active
                </label>
                <button
                  onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                  className="transition-opacity hover:opacity-70"
                >
                  {form.isActive ? (
                    <ToggleRight size={32} style={{ color: "#ef4a23" }} />
                  ) : (
                    <ToggleLeft
                      size={32}
                      style={{ color: "var(--color-text-tertiary)" }}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* modal footer */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4 border-t"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <button
                onClick={closeModal}
                className="h-10 px-4 rounded-xl text-sm font-medium"
                style={{
                  border: "0.5px solid var(--color-border-secondary)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="h-10 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
                style={{ backgroundColor: "#ef4a23" }}
              >
                {isSaving ? "Saving..." : editId ? "Update" : "Create"}
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
            <h2
              className="font-bold text-base"
              style={{ color: "var(--color-text-primary)" }}
            >
              Delete Coupon?
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              This will permanently delete the coupon. Users will no longer be
              able to use this code.
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
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}