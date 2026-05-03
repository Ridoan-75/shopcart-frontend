// src/app/(dashboard)/admin/banners/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Upload, ToggleLeft, ToggleRight } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { bannerService } from "../../../../services/banner.service";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";

type BannerPosition = "HOME_TOP" | "HOME_MIDDLE" | "SIDEBAR";

interface BannerForm {
  title: string;
  link: string;
  position: BannerPosition;
  isActive: boolean;
  image: string;
}

const POSITIONS: BannerPosition[] = ["HOME_TOP", "HOME_MIDDLE", "SIDEBAR"];

const DEFAULT_FORM: BannerForm = {
  title: "",
  link: "",
  position: "HOME_TOP",
  isActive: true,
  image: "",
};

export default function AdminBannersPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(DEFAULT_FORM);
  const [imgPreview, setImgPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BANNERS],
    queryFn: () => bannerService.getAll(),
  });

  const banners = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (payload: BannerForm) => bannerService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BANNERS] });
      toast.success("Banner created!");
      closeModal();
    },
    onError: () => toast.error("Failed to create banner"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BannerForm> }) =>
      bannerService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BANNERS] });
      toast.success("Banner updated!");
      closeModal();
    },
    onError: () => toast.error("Failed to update banner"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannerService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BANNERS] });
      toast.success("Banner deleted!");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete banner"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      bannerService.update(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.BANNERS] }),
    onError: () => toast.error("Failed to toggle banner"),
  });

  const openCreate = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setImgPreview("");
    setModalOpen(true);
  };

  const openEdit = (banner: any) => {
    setEditId(banner._id);
    setForm({
      title: banner.title ?? "",
      link: banner.link ?? "",
      position: banner.position ?? "HOME_TOP",
      isActive: banner.isActive ?? true,
      image: banner.image ?? "",
    });
    setImgPreview(banner.image ?? "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(DEFAULT_FORM);
    setImgPreview("");
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
      setForm((p) => ({ ...p, image: data.secure_url }));
      setImgPreview(data.secure_url);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.image) return toast.error("Image is required");
    if (editId) {
      updateMutation.mutate({ id: editId, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Banners
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Manage homepage and sidebar banners
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <Plus size={16} />
          Add Banner
        </button>
      </div>

      {/* table */}
      {isLoading ? (
        <Loader fullPage={false} text="Loading banners..." />
      ) : banners.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            No banners yet. Click "Add Banner" to create one.
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
                {["Image", "Title", "Position", "Link", "Status", "Actions"].map((h) => (
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
              {banners.map((banner: any, i: number) => (
                <tr
                  key={banner._id}
                  style={{
                    borderTop: i > 0 ? "0.5px solid var(--color-border-tertiary)" : "none",
                    backgroundColor: "var(--color-background-primary)",
                  }}
                >
                  {/* image */}
                  <td className="px-4 py-3">
                    <div
                      className="relative w-20 h-12 rounded-lg overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: "var(--color-background-secondary)" }}
                    >
                      {banner.image ? (
                        <Image
                          src={banner.image}
                          alt={banner.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Upload size={14} style={{ color: "var(--color-text-tertiary)" }} />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* title */}
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--color-text-primary)" }}>
                    {banner.title}
                  </td>

                  {/* position */}
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: "rgba(239,74,35,0.1)",
                        color: "#ef4a23",
                      }}
                    >
                      {banner.position}
                    </span>
                  </td>

                  {/* link */}
                  <td
                    className="px-4 py-3 max-w-[160px] truncate text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {banner.link || "—"}
                  </td>

                  {/* toggle */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        toggleMutation.mutate({ id: banner._id, isActive: !banner.isActive })
                      }
                      className="transition-opacity hover:opacity-70"
                    >
                      {banner.isActive ? (
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
                        onClick={() => openEdit(banner)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        style={{ color: "#3749bb" }}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(banner._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                        style={{ color: "#f02757" }}
                        aria-label="Delete"
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

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
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
              <h2 className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
                {editId ? "Edit Banner" : "Add Banner"}
              </h2>
              <button onClick={closeModal} style={{ color: "var(--color-text-secondary)" }}>
                <X size={18} />
              </button>
            </div>

            {/* modal body */}
            <div className="p-6 flex flex-col gap-4">

              {/* image upload */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}>
                  Banner Image *
                </label>
                <div
                  className="relative w-full h-36 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer transition-all"
                  style={{
                    border: "1.5px dashed var(--color-border-secondary)",
                    backgroundColor: "var(--color-background-secondary)",
                  }}
                >
                  {imgPreview ? (
                    <>
                      <Image src={imgPreview} alt="preview" fill className="object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                        <label className="cursor-pointer flex items-center gap-2 text-white text-sm font-medium">
                          <Upload size={14} />
                          Change
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer">
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                          style={{ borderColor: "#ef4a23", borderTopColor: "transparent" }} />
                      ) : (
                        <>
                          <Upload size={20} style={{ color: "var(--color-text-tertiary)" }} />
                          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Click to upload image
                          </span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* title */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Banner title"
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                  style={{
                    border: "0.5px solid var(--color-border-secondary)",
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* link */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}>
                  Link URL
                </label>
                <input
                  type="text"
                  value={form.link}
                  onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                  style={{
                    border: "0.5px solid var(--color-border-secondary)",
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* position */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}>
                  Position
                </label>
                <select
                  value={form.position}
                  onChange={(e) => setForm((p) => ({ ...p, position: e.target.value as BannerPosition }))}
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                  style={{
                    border: "0.5px solid var(--color-border-secondary)",
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* isActive */}
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
                disabled={isSaving || uploading}
                className="h-10 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
                style={{ backgroundColor: "#ef4a23" }}
              >
                {isSaving ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
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
              Delete Banner?
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              This action cannot be undone.
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