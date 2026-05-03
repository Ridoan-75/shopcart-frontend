// src/app/(dashboard)/admin/blogs/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Upload, ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../../constants/queryKeys";
import axiosInstance from "../../../../../lib/axios";

interface BlogCategory { _id: string; name: string; }

interface BlogForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  tags: string;
  isPublished: boolean;
}

const DEFAULT_FORM: BlogForm = {
  title: "", slug: "", excerpt: "", content: "",
  coverImage: "", categoryId: "", tags: "", isPublished: false,
};

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function FormField({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {label} {required && <span style={{ color: "#ef4a23" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT_STYLE = {
  border: "0.5px solid var(--color-border-secondary)",
  backgroundColor: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
};

export default function CreateBlogPage() {
  const router = useRouter();
  const [form, setForm] = useState<BlogForm>(DEFAULT_FORM);
  const [imgPreview, setImgPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: catData } = useQuery({
    queryKey: [QUERY_KEYS.BLOG_CATEGORIES],
    queryFn: () => axiosInstance.get("/blog-categories").then((r) => r.data),
  });
  const categories: BlogCategory[] = catData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (payload: any) => axiosInstance.post("/blogs", payload),
    onSuccess: () => {
      toast.success("Blog post created!");
      router.push("/admin/blogs");
    },
    onError: () => toast.error("Failed to create blog post"),
  });

  const handleTitleChange = (val: string) => {
    setForm((p) => ({ ...p, title: val, slug: slugify(val) }));
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

  const handleSubmit = (publish: boolean) => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.slug.trim()) return toast.error("Slug is required");
    if (!form.content.trim()) return toast.error("Content is required");
    createMutation.mutate({
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      coverImage: form.coverImage || undefined,
      category: form.categoryId || undefined,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      isPublished: publish,
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/blogs"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{
            border: "0.5px solid var(--color-border-secondary)",
            color: "var(--color-text-secondary)",
          }}
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            New Blog Post
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Create and publish a new blog post
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* left — main content */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* title */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <FormField label="Title" required>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter blog post title..."
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={INPUT_STYLE}
              />
            </FormField>

            <FormField label="Slug" required>
              <div className="flex items-center rounded-xl overflow-hidden"
                style={{ border: "0.5px solid var(--color-border-secondary)" }}>
                <span
                  className="h-11 px-3 flex items-center text-sm flex-shrink-0 border-r"
                  style={{
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-tertiary)",
                    borderColor: "var(--color-border-secondary)",
                  }}
                >
                  /blog/
                </span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
                  placeholder="post-slug"
                  className="flex-1 h-11 px-3 text-sm outline-none font-mono"
                  style={{
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
            </FormField>

            <FormField label="Excerpt">
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                placeholder="Short summary shown in blog list and SEO description..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={INPUT_STYLE}
              />
            </FormField>
          </div>

          {/* content */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <FormField label="Content" required>
              <textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Write your full blog post content here..."
                rows={16}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none font-mono leading-relaxed"
                style={INPUT_STYLE}
              />
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                {form.content.length} characters
              </p>
            </FormField>
          </div>
        </div>

        {/* right — sidebar */}
        <div className="flex flex-col gap-5">

          {/* cover image */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Cover Image
            </p>
            <div
              className="relative w-full rounded-xl overflow-hidden flex items-center justify-center cursor-pointer"
              style={{
                aspectRatio: "16/9",
                border: "1.5px dashed var(--color-border-secondary)",
                backgroundColor: "var(--color-background-secondary)",
              }}
            >
              {imgPreview ? (
                <>
                  <Image src={imgPreview} alt="cover" fill className="object-cover" />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                  >
                    <label className="cursor-pointer flex items-center gap-2 text-white text-sm font-medium">
                      <Upload size={14} />
                      Change
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer p-6 w-full h-full justify-center">
                  {uploading ? (
                    <div
                      className="w-6 h-6 border-2 rounded-full animate-spin"
                      style={{ borderColor: "#ef4a23", borderTopColor: "transparent" }}
                    />
                  ) : (
                    <>
                      <Upload size={22} style={{ color: "var(--color-text-tertiary)" }} />
                      <span className="text-xs text-center" style={{ color: "var(--color-text-secondary)" }}>
                        Click to upload cover image
                      </span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {/* meta */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Post Settings
            </p>

            <FormField label="Category">
              <select
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                style={INPUT_STYLE}
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Tags">
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3"
                className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                style={INPUT_STYLE}
              />
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Comma separated
              </p>
            </FormField>
          </div>

          {/* publish actions */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Publish
            </p>

            <button
              onClick={() => handleSubmit(true)}
              disabled={createMutation.isPending}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
              style={{ backgroundColor: "#ef4a23" }}
            >
              {createMutation.isPending ? "Publishing..." : "Publish Now"}
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={createMutation.isPending}
              className="w-full h-11 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{
                border: "0.5px solid var(--color-border-secondary)",
                color: "var(--color-text-secondary)",
              }}
            >
              Save as Draft
            </button>

            <Link
              href="/admin/blogs"
              className="w-full h-11 rounded-xl text-sm font-medium flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}