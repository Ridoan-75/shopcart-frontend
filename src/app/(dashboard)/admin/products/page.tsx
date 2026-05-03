// src/app/(dashboard)/admin/products/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { productService } from "../../../../services/product.service";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import DataTable, { Column } from "../../../../components/dashboard/DataTable";

export default function AdminProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, "admin"],
    queryFn: () => productService.getAll({ limit: 100 }),
  });

  const products = data?.data ?? [];

  const { mutate: deleteProduct } = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const columns: Column<any>[] = [
    {
      key: "name",
      label: "Product",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
            style={{ backgroundColor: "var(--color-background-secondary)" }}
          >
            {row.thumbnail && (
              <Image src={row.thumbnail} alt={row.name} width={40} height={40} className="object-cover w-full h-full" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate max-w-[180px]" style={{ color: "var(--color-text-primary)" }}>
              {row.name}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              {row.sku ?? "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {row.category?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (row) => (
        <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          ${row.price?.toFixed(2)}
        </span>
      ),
    },
    {
      key: "inventory",
      label: "Stock",
      render: (row) => {
        const qty = row.inventory?.quantity ?? 0;
        return (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: qty === 0 ? "rgba(240,39,87,0.1)" : qty < 10 ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
              color: qty === 0 ? "#f02757" : qty < 10 ? "#f59e0b" : "#22c55e",
            }}
          >
            {qty === 0 ? "Out of Stock" : `${qty} left`}
          </span>
        );
      },
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: row.isActive ? "rgba(34,197,94,0.1)" : "rgba(240,39,87,0.1)",
            color: row.isActive ? "#22c55e" : "#f02757",
          }}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/products/${row.slug}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <Eye size={14} />
          </Link>
          <Link
            href={`/admin/products/${row._id}/edit`}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "#3749bb", backgroundColor: "rgba(55,73,187,0.08)" }}
          >
            <Edit size={14} />
          </Link>
          <button
            onClick={() => {
              if (confirm(`Delete "${row.name}"?`)) deleteProduct(row._id);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "#f02757", backgroundColor: "rgba(240,39,87,0.08)" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--color-text-primary)" }}>Products</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            {products.length} total products
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <Plus size={15} /> Add Product
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        rowKey={(row) => row._id}
        searchable
        searchPlaceholder="Search products..."
        onRowClick={(row) => router.push(`/admin/products/${row._id}/edit`)}
      />
    </div>
  );
}