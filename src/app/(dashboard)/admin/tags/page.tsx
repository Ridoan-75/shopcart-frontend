// src/app/(dashboard)/admin/tags/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import axiosInstance from "../../../../lib/axios";

interface Tag {
  _id: string;
  name: string;
  slug: string;
  productCount?: number;
}

interface TagForm {
  name: string;
  slug: string;
}

const DEFAULT_FORM: TagForm = { name: "", slug: "" };

const INPUT_STYLE = {
  border: "0.5px solid var(--color-border-secondary)",
  backgroundColor: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
};

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminTagsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TagForm>(DEFAULT_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.TAGS],
    queryFn: () => axiosInstance.get("/tags").then((r) => r.data),
  });

  const tags: Tag[] = (data?.data ?? []).filter((t: Tag) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (payload: TagForm) => axiosInstance.post("/tags", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TAGS] });
      toast.success("Tag created!");
      closeModal();
    },
    onError: () => toast.error("Failed to create tag"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TagForm }) =>
      axiosInstance.patch(`/tags/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TAGS] });
      toast.success("Tag updated!");
      closeModal();
    },
    onError: () => toast.error("Failed to update tag"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/tags/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TAGS] });
      toast.success("Tag deleted!");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete tag"),
  });

  const openCreate = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setEditId(tag._id);
    setForm({ name: tag.name, slug: tag.slug });
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
            Tags
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Manage product tags
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <Plus size={16} />
          Add Tag
        </button>
      </div>

      {/* summary + search row */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tags..."
          className="w-full max-w-sm h-10 px-3 rounded-xl text-sm outline-none"
          style={INPUT_STYLE}
        />
        <span
          className="text-sm flex-shrink-0"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {tags.length} tag{tags.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* content */}
      {isLoading ? (
        <Loader fullPage={false} text="Loading tags..." />
      ) : tags.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <Tag
            size={32}
            style={{ color: "var(--color-text-tertiary)" }}
            className="mb-3"
          />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {search
              ? "No tags match your search."
              : 'No tags yet. Click "Add Tag" to create one.'}
          </p>
        </div>
      ) : (
        <>
          {/* tag chips grid */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag) => (
              <div
                key={tag._id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl group transition-all"
                style={{
                  backgroundColor: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(239,74,35,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "var(--color-border-tertiary)";
                }}
              >
                <Tag size={13} style={{ color: "#ef4a23" }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {tag.name}
                </span>
                {tag.productCount !== undefined && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      backgroundColor: "rgba(239,74,35,0.1)",
                      color: "#ef4a23",
                    }}
                  >
                    {tag.productCount}
                  </span>
                )}
                {/* action buttons appear on hover */}
                <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(tag)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    style={{ color: "#3749bb" }}
                    aria-label="Edit tag"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={() => setDeleteId(tag._id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                    style={{ color: "#f02757" }}
                    aria-label="Delete tag"
                  >
                    <X size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* table view */}
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
                  {["#", "Name", "Slug", "Products", "Actions"].map((h) => (
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
                {tags.map((tag, i) => (
                  <tr
                    key={tag._id}
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag size={13} style={{ color: "#ef4a23" }} />
                        <span
                          className="font-semibold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {tag.name}
                        </span>
                      </div>
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
                        {tag.slug}
                      </span>
                    </td>

                    {/* product count */}
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: "rgba(239,74,35,0.1)",
                          color: "#ef4a23",
                        }}
                      >
                        {tag.productCount ?? 0}
                      </span>
                    </td>

                    {/* actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(tag)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          style={{ color: "#3749bb" }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(tag._id)}
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
        </>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
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
              <h2
                className="font-bold text-base"
                style={{ color: "var(--color-text-primary)" }}
              >
                {editId ? "Edit Tag" : "Add Tag"}
              </h2>
              <button
                onClick={closeModal}
                style={{ color: "var(--color-text-secondary)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* body */}
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
                  placeholder="e.g. New Arrival"
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                  style={INPUT_STYLE}
                  autoFocus
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
                  placeholder="e.g. new-arrival"
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none font-mono"
                  style={INPUT_STYLE}
                />
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Auto-generated from name. Used in URLs.
                </p>
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
            <h2
              className="font-bold text-base"
              style={{ color: "var(--color-text-primary)" }}
            >
              Delete Tag?
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              This will permanently delete the tag. Products using this tag will
              be untagged.
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