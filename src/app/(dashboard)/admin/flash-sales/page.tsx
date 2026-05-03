// src/app/(dashboard)/admin/flash-sales/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  Zap,
  Clock,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import { flashSaleService } from "../../../../services/flashSale.service";
import { productService } from "../../../../services/product.service";

interface FlashSaleItem {
  productId: string;
  salePrice: number;
  discountPercent: number;
}

interface FlashSale {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  items: {
    product: { _id: string; name: string; price: number; thumbnail?: string };
    salePrice: number;
    discountPercent: number;
  }[];
}

interface FlashSaleForm {
  title: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  items: FlashSaleItem[];
}

const DEFAULT_FORM: FlashSaleForm = {
  title: "",
  startTime: "",
  endTime: "",
  isActive: true,
  items: [],
};

const INPUT_STYLE = {
  border: "0.5px solid var(--color-border-secondary)",
  backgroundColor: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
};

function toLocalDatetime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function getStatus(sale: FlashSale): "upcoming" | "active" | "ended" {
  const now = new Date();
  const start = new Date(sale.startTime);
  const end = new Date(sale.endTime);
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "active";
}

const STATUS_STYLE = {
  active: { backgroundColor: "rgba(34,197,94,0.1)", color: "#16a34a" },
  upcoming: { backgroundColor: "rgba(55,73,187,0.1)", color: "#3749bb" },
  ended: { backgroundColor: "rgba(240,39,87,0.1)", color: "#f02757" },
};

export default function AdminFlashSalesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FlashSaleForm>(DEFAULT_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.FLASH_SALES],
    queryFn: () => flashSaleService.getAll(),
  });

  const { data: productsData } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, productSearch],
    queryFn: () => productService.getAll({ search: productSearch, limit: 10 }),
    enabled: addingItem && productSearch.length > 1,
  });

  const flashSales: FlashSale[] = data?.data ?? [];
  const searchedProducts = productsData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (payload: any) => flashSaleService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FLASH_SALES] });
      toast.success("Flash sale created!");
      closeModal();
    },
    onError: () => toast.error("Failed to create flash sale"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      flashSaleService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FLASH_SALES] });
      toast.success("Flash sale updated!");
      closeModal();
    },
    onError: () => toast.error("Failed to update flash sale"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => flashSaleService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FLASH_SALES] });
      toast.success("Flash sale deleted!");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete flash sale"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      flashSaleService.update(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.FLASH_SALES] }),
    onError: () => toast.error("Failed to toggle flash sale"),
  });

  const openCreate = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  };

  const openEdit = (sale: FlashSale) => {
    setEditId(sale._id);
    setForm({
      title: sale.title,
      startTime: toLocalDatetime(sale.startTime),
      endTime: toLocalDatetime(sale.endTime),
      isActive: sale.isActive,
      items: sale.items.map((item) => ({
        productId: item.product._id,
        salePrice: item.salePrice,
        discountPercent: item.discountPercent,
      })),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(DEFAULT_FORM);
    setProductSearch("");
    setAddingItem(false);
  };

  const addProduct = (product: any) => {
    const alreadyAdded = form.items.some((i) => i.productId === product._id);
    if (alreadyAdded) {
      toast.error("Product already added");
      return;
    }
    const discountPercent = 20;
    const salePrice = +(product.price * (1 - discountPercent / 100)).toFixed(2);
    setForm((p) => ({
      ...p,
      items: [...p.items, { productId: product._id, salePrice, discountPercent }],
    }));
    setProductSearch("");
    setAddingItem(false);
  };

  const removeItem = (productId: string) => {
    setForm((p) => ({
      ...p,
      items: p.items.filter((i) => i.productId !== productId),
    }));
  };

  const updateItem = (
    productId: string,
    field: "salePrice" | "discountPercent",
    value: number
  ) => {
    setForm((p) => ({
      ...p,
      items: p.items.map((i) =>
        i.productId === productId ? { ...i, [field]: value } : i
      ),
    }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.startTime) return toast.error("Start time is required");
    if (!form.endTime) return toast.error("End time is required");
    if (new Date(form.startTime) >= new Date(form.endTime))
      return toast.error("End time must be after start time");
    if (form.items.length === 0) return toast.error("Add at least one product");

    const payload = {
      title: form.title,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      isActive: form.isActive,
      items: form.items,
    };

    if (editId) {
      updateMutation.mutate({ id: editId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const formatDatetime = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Flash Sales
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Create and manage timed flash sale events
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <Plus size={16} />
          New Flash Sale
        </button>
      </div>

      {/* list */}
      {isLoading ? (
        <Loader fullPage={false} text="Loading flash sales..." />
      ) : flashSales.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <Zap size={32} style={{ color: "var(--color-text-tertiary)" }} className="mb-3" />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            No flash sales yet. Click "New Flash Sale" to create one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {flashSales.map((sale) => {
            const status = getStatus(sale);
            return (
              <div
                key={sale._id}
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: "rgba(239,74,35,0.1)",
                        color: "#ef4a23",
                      }}
                    >
                      <Zap size={18} fill="#ef4a23" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p
                          className="font-bold text-base"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {sale.title}
                        </p>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                          style={STATUS_STYLE[status]}
                        >
                          {status}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1 mt-1 text-xs"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        <Clock size={11} />
                        {formatDatetime(sale.startTime)} → {formatDatetime(sale.endTime)}
                      </div>
                    </div>
                  </div>

                  {/* actions right */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: "rgba(239,74,35,0.1)",
                        color: "#ef4a23",
                      }}
                    >
                      {sale.items.length} products
                    </span>
                    <button
                      onClick={() =>
                        toggleMutation.mutate({
                          id: sale._id,
                          isActive: !sale.isActive,
                        })
                      }
                      className="transition-opacity hover:opacity-70"
                    >
                      {sale.isActive ? (
                        <ToggleRight size={28} style={{ color: "#ef4a23" }} />
                      ) : (
                        <ToggleLeft
                          size={28}
                          style={{ color: "var(--color-text-tertiary)" }}
                        />
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(sale)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      style={{ color: "#3749bb" }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(sale._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                      style={{ color: "#f02757" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* product chips */}
                {sale.items.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t"
                    style={{ borderColor: "var(--color-border-tertiary)" }}>
                    {sale.items.slice(0, 6).map((item) => (
                      <span
                        key={item.product._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor: "var(--color-background-secondary)",
                          color: "var(--color-text-secondary)",
                          border: "0.5px solid var(--color-border-tertiary)",
                        }}
                      >
                        {item.product.name.slice(0, 24)}
                        {item.product.name.length > 24 ? "…" : ""}
                        <span style={{ color: "#ef4a23" }}>
                          -{item.discountPercent}%
                        </span>
                      </span>
                    ))}
                    {sale.items.length > 6 && (
                      <span
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor: "var(--color-background-secondary)",
                          color: "var(--color-text-tertiary)",
                        }}
                      >
                        +{sale.items.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
              maxHeight: "90vh",
            }}
          >
            {/* header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <h2
                className="font-bold text-base"
                style={{ color: "var(--color-text-primary)" }}
              >
                {editId ? "Edit Flash Sale" : "New Flash Sale"}
              </h2>
              <button onClick={closeModal} style={{ color: "var(--color-text-secondary)" }}>
                <X size={18} />
              </button>
            </div>

            {/* body — scrollable */}
            <div className="p-6 flex flex-col gap-5 overflow-y-auto">
              {/* title */}
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Sale Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Weekend Mega Sale"
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                  style={INPUT_STYLE}
                />
              </div>

              {/* start + end time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="text-xs font-bold uppercase tracking-widest mb-2 block"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, startTime: e.target.value }))
                    }
                    className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-bold uppercase tracking-widest mb-2 block"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, endTime: e.target.value }))
                    }
                    className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                    style={INPUT_STYLE}
                  />
                </div>
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

              {/* products section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Products ({form.items.length})
                  </label>
                  <button
                    onClick={() => setAddingItem((p) => !p)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-85"
                    style={{ backgroundColor: "#ef4a23" }}
                  >
                    <Plus size={13} />
                    Add Product
                  </button>
                </div>

                {/* product search */}
                {addingItem && (
                  <div className="mb-3 relative">
                    <div
                      className="flex items-center rounded-xl overflow-hidden"
                      style={{ border: "0.5px solid var(--color-border-secondary)" }}
                    >
                      <div className="pl-3">
                        <Search size={15} style={{ color: "var(--color-text-tertiary)" }} />
                      </div>
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products to add..."
                        autoFocus
                        className="flex-1 h-10 px-3 text-sm outline-none"
                        style={{
                          backgroundColor: "var(--color-background-secondary)",
                          color: "var(--color-text-primary)",
                        }}
                      />
                    </div>
                    {searchedProducts.length > 0 && (
                      <div
                        className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
                        style={{
                          backgroundColor: "var(--color-background-primary)",
                          border: "0.5px solid var(--color-border-secondary)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        }}
                      >
                        {searchedProducts.map((product: any) => (
                          <button
                            key={product._id}
                            onClick={() => addProduct(product)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors"
                            style={{ color: "var(--color-text-primary)" }}
                            onMouseEnter={(e) =>
                              ((
                                e.currentTarget as HTMLButtonElement
                              ).style.backgroundColor =
                                "var(--color-background-secondary)")
                            }
                            onMouseLeave={(e) =>
                              ((
                                e.currentTarget as HTMLButtonElement
                              ).style.backgroundColor = "transparent")
                            }
                          >
                            <span className="font-medium truncate">{product.name}</span>
                            <span
                              className="text-xs ml-3 flex-shrink-0"
                              style={{ color: "#ef4a23" }}
                            >
                              ${product.price}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* items list */}
                {form.items.length === 0 ? (
                  <div
                    className="flex items-center justify-center py-8 rounded-xl text-sm"
                    style={{
                      border: "1.5px dashed var(--color-border-secondary)",
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    No products added yet
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {form.items.map((item) => {
                      const product = searchedProducts.find(
                        (p: any) => p._id === item.productId
                      );
                      return (
                        <div
                          key={item.productId}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{
                            backgroundColor: "var(--color-background-secondary)",
                            border: "0.5px solid var(--color-border-tertiary)",
                          }}
                        >
                          <p
                            className="flex-1 text-sm font-medium truncate"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {product?.name ?? item.productId}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="relative">
                              <span
                                className="absolute left-2 top-1/2 -translate-y-1/2 text-xs"
                                style={{ color: "var(--color-text-tertiary)" }}
                              >
                                $
                              </span>
                              <input
                                type="number"
                                value={item.salePrice}
                                onChange={(e) =>
                                  updateItem(
                                    item.productId,
                                    "salePrice",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-20 h-8 pl-5 pr-2 rounded-lg text-xs outline-none"
                                style={INPUT_STYLE}
                                placeholder="Price"
                              />
                            </div>
                            <div className="relative">
                              <span
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                                style={{ color: "#ef4a23" }}
                              >
                                %
                              </span>
                              <input
                                type="number"
                                value={item.discountPercent}
                                onChange={(e) =>
                                  updateItem(
                                    item.productId,
                                    "discountPercent",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-16 h-8 pl-2 pr-5 rounded-lg text-xs outline-none"
                                style={INPUT_STYLE}
                                placeholder="Disc"
                                min={1}
                                max={99}
                              />
                            </div>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                              style={{ color: "#f02757" }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* footer */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0"
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
              Delete Flash Sale?
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              This will permanently delete the flash sale and all its discounted
              items.
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