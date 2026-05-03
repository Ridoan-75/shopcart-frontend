// src/app/(dashboard)/admin/brands/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Upload, ToggleLeft, ToggleRight } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import { brandService } from "../../../../services/brand.service";

interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  productCount?: number;
}

interface BrandForm {
  name: string;
  slug: string;
  description: string;
  logo: string;
  isActive: boolean;
}

const DEFAULT_FORM: BrandForm = {
  name: "", slug: "", description: "", logo: "", isActive: true,
};

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminBrandsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BrandForm>(DEFAULT_FORM);
  const [imgPreview, setImgPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BRANDS],
    queryFn: () => brandService.getAll(),
  });

  const brands: Brand[] = (data?.data ?? []).filter((b: Brand) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (payload: BrandForm) => brandService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BRANDS] });
      toast.success("Brand created!");
      closeModal();
    },
    onError: () => toast.error("Failed to create brand"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BrandForm> }) =>
      brandService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BRANDS] });
      toast.success("Brand updated!");
      closeModal();
    },
    onError: () => toast.error("Failed to update brand"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => brandService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BRANDS] });
      toast.success("Brand deleted!");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete brand"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      brandService.update(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.BRANDS] }),
    onError: () => toast.error("Failed to toggle brand"),
  });

  const openCreate = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setImgPreview("");
    setModalOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditId(brand._id);
    setForm({
      name: brand.name,
      slug: brand.slug,
      description: brand.description ?? "",
      logo: brand.logo ?? "",
      isActive: brand.isActive,
    });
    setImgPreview(brand.logo ?? "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(DEFAULT_FORM);
    setImgPreview("");
  };

  const handleNameChange = (val: string) => {
    setForm((p) => ({ ...p, name: val, slug: editId ? p.slug : slugify(val) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET ?? "shopcart");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      setForm((p) => ({ ...p, logo: data.secure_url }));
      setImgPreview(data.secure_url);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.slug.trim()) return toast.error("Slug is required");
    if (editId) {
      updateMutation.mutate({ id: editId, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Brands
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Manage product brands
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <Plus size={16} />
          Add Brand
        </button>
      </div>

      {/* search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brands..."
          className="w-full max-w-sm h-10 px-3 rounded-xl text-sm outline-none"
          style={{
            border: "0.5px solid var(--color-border-secondary)",
            backgroundColor: "var(--color-background-secondary)",
            color: "var(--color-text-primary)",
          }}
        />
      </div>

      {/* table */}
      {isLoading ? (
        <Loader fullPage={false} text="Loading brands..." />
      ) : brands.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {search ? "No brands match your search." : "No brands yet. Click \"Add Brand\" to create one."}
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
                {["Logo", "Name", "Slug", "Description", "Products", "Status", "Actions"].map((h) => (
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
              {brands.map((brand, i) => (
                <tr
                  key={brand._id}
                  style={{
                    borderTop: i > 0 ? "0.5px solid var(--color-border-tertiary)" : "none",
                    backgroundColor: "var(--color-background-primary)",
                  }}
                >
                  {/* logo */}
                  <td className="px-4 py-3">
                    <div
                      className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}
                    >
                      {brand.logo ? (
                        <Image src={brand.logo} alt={brand.name} width={48} height={48} className="object-contain p-1" />
                      ) : (
                        <span className="text-lg font-black" style={{ color: "#ef4a23" }}>
                          {brand.name[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* name */}
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {brand.name}
                  </td>

                  {/* slug */}
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-mono"
                      style={{
                        backgroundColor: "var(--color-background-secondary)",
                        color: "var(--color-text-secondary)",
                        border: "0.5px solid var(--color-border-tertiary)",
                      }}
                    >
                      {brand.slug}
                    </span>
                  </td>

                  {/* description */}
                  <td
                    className="px-4 py-3 text-xs max-w-[180px] truncate"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {brand.description || "—"}
                  </td>

                  {/* product count */}
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
                    >
                      {brand.productCount ?? 0}
                    </span>
                  </td>

                  {/* toggle */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleMutation.mutate({ id: brand._id, isActive: !brand.isActive })}
                      className="transition-opacity hover:opacity-70"
                    >
                      {brand.isActive ? (
                        <ToggleRight size={28} style={{ color: "#ef4a23" }} />
                      ) : (
                        <ToggleLeft size={28} style={{ color: "var(--color-text-tertiary)" }} />
                      )}
                    </button>
                  </td>

                  {/* actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(brand)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        style={{ color: "#3749bb" }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(brand._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                        style={{ color: "#f02757" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
            }}
          >
            {/* header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <h2 className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
                {editId ? "Edit Brand" : "Add Brand"}
              </h2>
              <button onClick={closeModal} style={{ color: "var(--color-text-secondary)" }}>
                <X size={18} />
              </button>
            </div>

            {/* body */}
            <div className="p-6 flex flex-col gap-4">

              {/* logo upload */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}>
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: "var(--color-background-secondary)",
                      border: "1.5px dashed var(--color-border-secondary)",
                    }}
                  >
                    {imgPreview ? (
                      <Image src={imgPreview} alt="logo" width={80} height={80} className="object-contain p-2" />
                    ) : (
                      <Upload size={20} style={{ color: "var(--color-text-tertiary)" }} />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-80"
                      style={{
                        border: "0.5px solid var(--color-border-secondary)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {uploading ? "Uploading..." : "Upload Logo"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    {imgPreview && (
                      <button
                        onClick={() => { setImgPreview(""); setForm((p) => ({ ...p, logo: "" })); }}
                        className="text-xs"
                        style={{ color: "#f02757" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Samsung"
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                  style={{
                    border: "0.5px solid var(--color-border-secondary)",
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* slug */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}>
                  Slug *
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
                  placeholder="e.g. samsung"
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none font-mono"
                  style={{
                    border: "0.5px solid var(--color-border-secondary)",
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* description */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short brand description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                  style={{
                    border: "0.5px solid var(--color-border-secondary)",
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* active toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                  Active
                </label>
                <button
                  onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                  className="transition-opacity hover:opacity-70"
                >
                  {form.isActive ? (
                    <ToggleRight size={32} style={{ color: "#ef4a23" }} />
                  ) : (
                    <ToggleLeft size={32} style={{ color: "var(--color-text-tertiary)" }} />
                  )}
                </button>
              </div>
            </div>

            {/* footer */}
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
            <h2 className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
              Delete Brand?
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              This will permanently delete the brand. Products linked to this brand may be affected.
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