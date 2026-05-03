// src/app/(dashboard)/admin/blogs/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Upload, ToggleLeft, ToggleRight, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import axiosInstance from "../../../../lib/axios";

interface BlogCategory { _id: string; name: string; }
interface Blog {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  category?: BlogCategory;
  isPublished: boolean;
  createdAt: string;
  author?: { name: string };
}

interface BlogForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  categoryId: string;
  isPublished: boolean;
  tags: string;
}

const DEFAULT_FORM: BlogForm = {
  title: "", slug: "", content: "", excerpt: "",
  coverImage: "", categoryId: "", isPublished: false, tags: "",
};

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminBlogsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogForm>(DEFAULT_FORM);
  const [imgPreview, setImgPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BLOGS],
    queryFn: () => axiosInstance.get("/blogs?limit=100").then((r) => r.data),
  });

  const { data: catData } = useQuery({
    queryKey: [QUERY_KEYS.BLOG_CATEGORIES],
    queryFn: () => axiosInstance.get("/blog-categories").then((r) => r.data),
  });

  const blogs: Blog[] = (data?.data ?? []).filter((b: Blog) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );
  const categories: BlogCategory[] = catData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (payload: any) => axiosInstance.post("/blogs", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS] });
      toast.success("Blog created!");
      closeModal();
    },
    onError: () => toast.error("Failed to create blog"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      axiosInstance.patch(`/blogs/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS] });
      toast.success("Blog updated!");
      closeModal();
    },
    onError: () => toast.error("Failed to update blog"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/blogs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS] });
      toast.success("Blog deleted!");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete blog"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      axiosInstance.patch(`/blogs/${id}`, { isPublished }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS] }),
    onError: () => toast.error("Failed to toggle publish"),
  });

  const openCreate = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setImgPreview("");
    setModalOpen(true);
  };

  const openEdit = (blog: Blog) => {
    setEditId(blog._id);
    setForm({
      title: blog.title,
      slug: blog.slug,
      content: "",
      excerpt: "",
      coverImage: blog.coverImage ?? "",
      categoryId: blog.category?._id ?? "",
      isPublished: blog.isPublished,
      tags: "",
    });
    setImgPreview(blog.coverImage ?? "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(DEFAULT_FORM);
    setImgPreview("");
  };

  const handleTitleChange = (val: string) => {
    setForm((p) => ({ ...p, title: val, slug: editId ? p.slug : slugify(val) }));
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
      setForm((p) => ({ ...p, coverImage: data.secure_url }));
      setImgPreview(data.secure_url);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.slug.trim()) return toast.error("Slug is required");
    if (!form.content.trim()) return toast.error("Content is required");
    const payload = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      excerpt: form.excerpt,
      coverImage: form.coverImage,
      category: form.categoryId || undefined,
      isPublished: form.isPublished,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    if (editId) {
      updateMutation.mutate({ id: editId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Blogs
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Manage blog posts
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {/* search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search blog posts..."
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
        <Loader fullPage={false} text="Loading blogs..." />
      ) : blogs.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {search ? "No blogs match your search." : "No blog posts yet. Click \"New Post\" to create one."}
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
                {["Cover", "Title", "Category", "Author", "Date", "Published", "Actions"].map((h) => (
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
              {blogs.map((blog, i) => (
                <tr
                  key={blog._id}
                  style={{
                    borderTop: i > 0 ? "0.5px solid var(--color-border-tertiary)" : "none",
                    backgroundColor: "var(--color-background-primary)",
                  }}
                >
                  {/* cover */}
                  <td className="px-4 py-3">
                    <div
                      className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: "var(--color-background-secondary)" }}
                    >
                      {blog.coverImage ? (
                        <Image src={blog.coverImage} alt={blog.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Upload size={12} style={{ color: "var(--color-text-tertiary)" }} />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* title */}
                  <td className="px-4 py-3 max-w-[200px]">
                    <p
                      className="font-semibold truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {blog.title}
                    </p>
                    <p
                      className="text-xs font-mono truncate mt-0.5"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      /{blog.slug}
                    </p>
                  </td>

                  {/* category */}
                  <td className="px-4 py-3">
                    {blog.category ? (
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
                      >
                        {blog.category.name}
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
                    )}
                  </td>

                  {/* author */}
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {blog.author?.name ?? "—"}
                  </td>

                  {/* date */}
                  <td
                    className="px-4 py-3 text-xs whitespace-nowrap"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {formatDate(blog.createdAt)}
                  </td>

                  {/* toggle published */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        toggleMutation.mutate({ id: blog._id, isPublished: !blog.isPublished })
                      }
                      className="transition-opacity hover:opacity-70"
                    >
                      {blog.isPublished ? (
                        <ToggleRight size={28} style={{ color: "#ef4a23" }} />
                      ) : (
                        <ToggleLeft size={28} style={{ color: "var(--color-text-tertiary)" }} />
                      )}
                    </button>
                  </td>

                  {/* actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        onClick={() => openEdit(blog)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        style={{ color: "#3749bb" }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(blog._id)}
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
            className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
              maxHeight: "90vh",
            }}
          >
            {/* modal header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <h2 className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
                {editId ? "Edit Blog Post" : "New Blog Post"}
              </h2>
              <button onClick={closeModal} style={{ color: "var(--color-text-secondary)" }}>
                <X size={18} />
              </button>
            </div>

            {/* modal body — scrollable */}
            <div className="p-6 flex flex-col gap-4 overflow-y-auto">

              {/* cover image */}
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Cover Image
                </label>
                <div
                  className="relative w-full h-40 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer"
                  style={{
                    border: "1.5px dashed var(--color-border-secondary)",
                    backgroundColor: "var(--color-background-secondary)",
                  }}
                >
                  {imgPreview ? (
                    <>
                      <Image src={imgPreview} alt="preview" fill className="object-cover" />
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                      >
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
                        <div
                          className="w-5 h-5 border-2 rounded-full animate-spin"
                          style={{ borderColor: "#ef4a23", borderTopColor: "transparent" }}
                        />
                      ) : (
                        <>
                          <Upload size={20} style={{ color: "var(--color-text-tertiary)" }} />
                          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Click to upload cover image
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
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Blog post title"
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
                  onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
                  placeholder="blog-post-slug"
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none font-mono"
                  style={{
                    border: "0.5px solid var(--color-border-secondary)",
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* excerpt */}
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Excerpt
                </label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                  placeholder="Short summary shown in blog list..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                  style={{
                    border: "0.5px solid var(--color-border-secondary)",
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* content */}
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Content *
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Write your blog post content here..."
                  rows={8}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                  style={{
                    border: "0.5px solid var(--color-border-secondary)",
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* category + tags row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-xs font-bold uppercase tracking-widest mb-2 block"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Category
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                    style={{
                      border: "0.5px solid var(--color-border-secondary)",
                      backgroundColor: "var(--color-background-secondary)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="text-xs font-bold uppercase tracking-widest mb-2 block"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Tags
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="tag1, tag2, tag3"
                    className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                    style={{
                      border: "0.5px solid var(--color-border-secondary)",
                      backgroundColor: "var(--color-background-secondary)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                </div>
              </div>

              {/* publish toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                    Publish
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                    Make this post visible to everyone
                  </p>
                </div>
                <button
                  onClick={() => setForm((p) => ({ ...p, isPublished: !p.isPublished }))}
                  className="transition-opacity hover:opacity-70"
                >
                  {form.isPublished ? (
                    <ToggleRight size={32} style={{ color: "#ef4a23" }} />
                  ) : (
                    <ToggleLeft size={32} style={{ color: "var(--color-text-tertiary)" }} />
                  )}
                </button>
              </div>
            </div>

            {/* modal footer */}
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
                {isSaving ? "Saving..." : editId ? "Update" : "Publish"}
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
              Delete Blog Post?
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              This will permanently delete the post and all its content.
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