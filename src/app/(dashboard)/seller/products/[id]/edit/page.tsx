// src/app/(dashboard)/seller/products/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  X,
  Plus,
  Package,
  DollarSign,
  ImagePlus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../../constants/queryKeys";
import Loader from "../../../../../components/common/Loader";
import axiosInstance from "../../../../../lib/axios";

const schema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  shortDescription: z.string().optional(),
  price: z.coerce.number().min(0.01),
  comparePrice: z.coerce.number().optional(),
  costPrice: z.coerce.number().optional(),
  categoryId: z.string().min(1),
  brandId: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.coerce.number().min(0),
  lowStockAlert: z.coerce.number().min(0),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  isBestSeller: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const INPUT_STYLE = {
  backgroundColor: "var(--color-background-secondary)",
  border: "0.5px solid var(--color-border-secondary)",
  color: "var(--color-text-primary)",
};

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}>
      <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</p>
      {children}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>{label}</label>
      {children}
      {error && <p className="text-xs" style={{ color: "#f02757" }}>{error}</p>}
    </div>
  );
}

export default function SellerEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [newThumbnail, setNewThumbnail] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SELLER_PRODUCTS, id],
    queryFn: () => axiosInstance.get(`/seller/products/${id}`).then((r) => r.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => axiosInstance.get("/categories").then((r) => r.data),
  });

  const { data: brandsData } = useQuery({
    queryKey: [QUERY_KEYS.BRANDS],
    queryFn: () => axiosInstance.get("/brands").then((r) => r.data),
  });

  const product = data?.data;
  const categories = categoriesData?.data ?? [];
  const brands = brandsData?.data ?? [];

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      isActive: true, isFeatured: false, isNewArrival: false, isBestSeller: false,
      quantity: 0, lowStockAlert: 5,
    },
  });

  useEffect(() => {
    if (!product) return;
    reset({
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      comparePrice: product.comparePrice,
      costPrice: product.costPrice,
      categoryId: product.category?._id,
      brandId: product.brand?._id,
      sku: product.sku,
      quantity: product.inventory?.quantity,
      lowStockAlert: product.inventory?.lowStockAlert,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
    });
    setThumbnailPreview(product.thumbnail ?? "");
    setImagePreviews(product.images ?? []);
  }, [product, reset]);

  const updateProduct = useMutation({
    mutationFn: (payload: any) => axiosInstance.patch(`/seller/products/${id}`, payload),
    onSuccess: () => { toast.success("Product updated!"); router.push("/seller/products"); },
    onError: () => toast.error("Failed to update product"),
  });

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET ?? "shopcart");
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
    return (await res.json()).secure_url;
  };

  const onSubmit = async (data: FormData) => {
    setUploading(true);
    try {
      let thumbnailUrl = thumbnailPreview;
      if (newThumbnail) thumbnailUrl = await uploadToCloudinary(newThumbnail);
      const uploadedNewImages = newImages.length > 0 ? await Promise.all(newImages.map(uploadToCloudinary)) : [];
      const existingImages = imagePreviews.filter((p) => p.startsWith("http"));
      updateProduct.mutate({ ...data, thumbnailUrl, imageUrls: [...existingImages, ...uploadedNewImages] });
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isActiveVal = watch("isActive");
  const isFeaturedVal = watch("isFeatured");
  const isNewArrivalVal = watch("isNewArrival");
  const isBestSellerVal = watch("isBestSeller");
  const isSubmitting = uploading || updateProduct.isPending;

  if (isLoading) return <Loader />;

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ border: "0.5px solid var(--color-border-secondary)", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-secondary)" }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>Edit Product</h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{product?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <FormSection title="Basic Information">
              <Field label="Product Name *" error={errors.name?.message}>
                <input {...register("name")} className="h-11 px-4 rounded-xl text-sm outline-none w-full" style={INPUT_STYLE} />
              </Field>
              <Field label="Slug *" error={errors.slug?.message}>
                <input {...register("slug")} className="h-11 px-4 rounded-xl text-sm outline-none w-full font-mono" style={INPUT_STYLE} />
              </Field>
              <Field label="Short Description">
                <input {...register("shortDescription")} className="h-11 px-4 rounded-xl text-sm outline-none w-full" style={INPUT_STYLE} />
              </Field>
              <Field label="Full Description *" error={errors.description?.message}>
                <textarea {...register("description")} rows={5} className="px-4 py-3 rounded-xl text-sm outline-none w-full resize-none" style={INPUT_STYLE} />
              </Field>
            </FormSection>

            <FormSection title="Pricing">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: "price" as const, label: "Sale Price *", error: errors.price?.message },
                  { name: "comparePrice" as const, label: "Compare Price", error: undefined },
                  { name: "costPrice" as const, label: "Cost Price", error: undefined },
                ].map(({ name, label, error }) => (
                  <Field key={name} label={label} error={error}>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
                      <input {...register(name)} type="number" step="0.01" className="h-11 pl-8 pr-4 rounded-xl text-sm outline-none w-full" style={INPUT_STYLE} />
                    </div>
                  </Field>
                ))}
              </div>
            </FormSection>

            <FormSection title="Inventory">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="SKU">
                  <input {...register("sku")} className="h-11 px-4 rounded-xl text-sm outline-none w-full font-mono" style={INPUT_STYLE} />
                </Field>
                <Field label="Quantity" error={errors.quantity?.message}>
                  <input {...register("quantity")} type="number" min={0} className="h-11 px-4 rounded-xl text-sm outline-none w-full" style={INPUT_STYLE} />
                </Field>
                <Field label="Low Stock Alert">
                  <input {...register("lowStockAlert")} type="number" min={0} className="h-11 px-4 rounded-xl text-sm outline-none w-full" style={INPUT_STYLE} />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Product Images">
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>Thumbnail</p>
                <label className="flex flex-col items-center justify-center h-36 rounded-xl cursor-pointer transition-all" style={{ border: "1.5px dashed var(--color-border-secondary)", backgroundColor: "var(--color-background-secondary)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLLabelElement).style.borderColor = "#ef4a23")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLLabelElement).style.borderColor = "var(--color-border-secondary)")}
                >
                  {thumbnailPreview ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <Image src={thumbnailPreview} alt="thumbnail" fill className="object-cover" sizes="400px" />
                      <button type="button" onClick={(e) => { e.preventDefault(); setNewThumbnail(null); setThumbnailPreview(""); }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "#f02757" }}>
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImagePlus size={24} style={{ color: "#ef4a23" }} />
                      <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>Click to upload</p>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setNewThumbnail(file);
                    setThumbnailPreview(URL.createObjectURL(file));
                  }} />
                </label>
              </div>

              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>Additional Images</p>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={src} alt={`img-${i}`} fill className="object-cover" sizes="80px" />
                      <button type="button" onClick={() => setImagePreviews((p) => p.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "#f02757" }}>
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer" style={{ border: "1.5px dashed var(--color-border-secondary)", backgroundColor: "var(--color-background-secondary)" }}>
                    <Plus size={18} style={{ color: "#ef4a23" }} />
                    <span className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>Add</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      setNewImages((p) => [...p, ...files]);
                      setImagePreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
                    }} />
                  </label>
                </div>
              </div>
            </FormSection>
          </div>

          <div className="flex flex-col gap-5">
            <FormSection title="Organization">
              <Field label="Category *" error={errors.categoryId?.message}>
                <select {...register("categoryId")} className="h-11 px-4 rounded-xl text-sm outline-none w-full" style={INPUT_STYLE}>
                  <option value="">Select category</option>
                  {categories.map((cat: any) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </Field>
              <Field label="Brand">
                <select {...register("brandId")} className="h-11 px-4 rounded-xl text-sm outline-none w-full" style={INPUT_STYLE}>
                  <option value="">Select brand</option>
                  {brands.map((b: any) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </Field>
            </FormSection>

            <FormSection title="Product Flags">
              {[
                { key: "isActive" as const, label: "Active", value: isActiveVal },
                { key: "isFeatured" as const, label: "Featured", value: isFeaturedVal },
                { key: "isNewArrival" as const, label: "New Arrival", value: isNewArrivalVal },
                { key: "isBestSeller" as const, label: "Best Seller", value: isBestSellerVal },
              ].map(({ key, label, value }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
                  <button type="button" onClick={() => setValue(key, !value)}>
                    {value ? <ToggleRight size={26} style={{ color: "#ef4a23" }} /> : <ToggleLeft size={26} style={{ color: "var(--color-text-tertiary)" }} />}
                  </button>
                </div>
              ))}
            </FormSection>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#ef4a23" }}
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />{uploading ? "Uploading..." : "Saving..."}</>
              ) : (
                <><Package size={16} />Save Changes</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}