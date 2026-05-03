// src/app/(dashboard)/admin/blog-categories/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import axiosInstance from "../../../../lib/axios";

interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
}

interface BlogCategoryForm {
  name: string;
  slug: string;
  description: string;
}

const DEFAULT_FORM: BlogCategoryForm = { name: "", slug: "", description: "" };

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminBlogCategoriesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogCategoryForm>(DEFAULT_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BLOG_CATEGORIES],
    queryFn: () => axiosInstance.get("/blog-categories").then((r) => r.data),
  });

  const categories: BlogCategory[] = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (payload: BlogCategoryForm) =>
      axiosInstance.post("/blog-categories", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_CATEGORIES] });
      toast.success("Category created!");
      closeModal();
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BlogCategoryForm }) =>
      axiosInstance.patch(`/blog-categories/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_CATEGORIES] });
      toast.success("Category updated!");
      closeModal();
    },
    onError: () => toast.error("Failed to update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/blog-categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_CATEGORIES] });
      toast.success("Category deleted!");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const openCreate = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  };

  const openEdit = (cat: BlogCategory) => {
    setEditId(cat._id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(DEFAULT_FORM);
  };

  const handleNameChange = (val: string) => {
    setForm((p) => ({
      ...p,
      name: val,
      slug: editId ? p.slug : slugify(val),
    }));
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
    <div className="p-6 max-w-4xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Blog Categories
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Manage blog post categories
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* table */}
      {isLoading ? (
        <Loader fullPage={false} text="Loading categories..." />
      ) : categories.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            No blog categories yet. Click "Add Category" to create one.
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--color-background-secondary)",
                }}
              >
                {["#", "Name", "Slug", "Description", "Posts", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr
                  key={cat._id}
                  style={{
                    borderTop:
                      i > 0
                        ? "0.5px solid var(--color-border-tertiary)"
                        : "none",
                    backgroundColor: "var(--color-background-primary)",
                  }}
                >
                  {/* index */}
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {i + 1}
                  </td>

                  {/* name */}
                  <td
                    className="px-4 py-3 font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {cat.name}
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
                      {cat.slug}
                    </span>
                  </td>

                  {/* description */}
                  <td
                    className="px-4 py-3 text-xs max-w-[200px] truncate"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {cat.description || "—"}
                  </td>

                  {/* post count */}
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: "rgba(239,74,35,0.1)",
                        color: "#ef4a23",
                      }}
                    >
                      {cat.postCount ?? 0}
                    </span>
                  </td>

                  {/* actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        style={{ color: "#3749bb" }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(cat._id)}
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
            {/* modal header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <h2
                className="font-bold text-base"
                style={{ color: "var(--color-text-primary)" }}
              >
                {editId ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={closeModal}
                style={{ color: "var(--color-text-secondary)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* modal body */}
            <div className="p-6 flex flex-col gap-4">
              {/* name */}
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Technology"
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
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Slug *
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, slug: slugify(e.target.value) }))
                  }
                  placeholder="e.g. technology"
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none font-mono"
                  style={{
                    border: "0.5px solid var(--color-border-secondary)",
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                  }}
                />
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Auto-generated from name. Used in URLs.
                </p>
              </div>

              {/* description */}
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Short description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                  style={{
                    border: "0.5px solid var(--color-border-secondary)",
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                  }}
                />
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
              Delete Category?
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              This will permanently delete the category. Blog posts in this
              category may be affected.
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