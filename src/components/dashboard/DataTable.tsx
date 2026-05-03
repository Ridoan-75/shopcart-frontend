// src/components/dashboard/DataTable.tsx
"use client";

import { useState } from "react";
import { Search, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import Pagination from "../common/Pagination";
import EmptyState from "../common/EmptyState";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading,
  searchable = true,
  searchPlaceholder = "Search...",
  rowKey,
  onRowClick,
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // filter
  const filtered = data.filter((row) => {
    if (!search) return true;
    return JSON.stringify(row).toLowerCase().includes(search.toLowerCase());
  });

  // sort
  const sorted = sortKey
    ? [...filtered].sort((a: any, b: any) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
        return 0;
      })
    : filtered;

  // paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      {/* toolbar */}
      {searchable && (
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "var(--color-border-tertiary)" }}
        >
          <div
            className="flex items-center rounded-xl overflow-hidden max-w-sm"
            style={{
              border: "0.5px solid var(--color-border-secondary)",
              backgroundColor: "var(--color-background-secondary)",
            }}
          >
            <div className="px-3 flex-shrink-0" style={{ color: "#ef4a23" }}>
              <Search size={15} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 h-10 text-sm bg-transparent outline-none"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "'Trebuchet MS', sans-serif",
              }}
            />
          </div>
        </div>
      )}

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest select-none"
                  style={{
                    color: "var(--color-text-tertiary)",
                    cursor: col.sortable ? "pointer" : "default",
                  }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          size={10}
                          style={{
                            color:
                              sortKey === col.key && sortDir === "asc"
                                ? "#ef4a23"
                                : "var(--color-border-secondary)",
                          }}
                        />
                        <ChevronDown
                          size={10}
                          style={{
                            color:
                              sortKey === col.key && sortDir === "desc"
                                ? "#ef4a23"
                                : "var(--color-border-secondary)",
                            marginTop: "-3px",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      <div
                        className="h-4 rounded-lg animate-pulse"
                        style={{
                          backgroundColor: "var(--color-background-secondary)",
                          width: `${60 + Math.random() * 30}%`,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    title="No data found"
                    description={search ? "Try adjusting your search query" : "Nothing here yet"}
                  />
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className="transition-colors"
                  style={{
                    borderBottom:
                      i < paginated.length - 1
                        ? "0.5px solid var(--color-border-tertiary)"
                        : "none",
                    cursor: onRowClick ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => {
                    if (onRowClick)
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        "var(--color-background-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      "transparent";
                  }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      {col.render
                        ? col.render(row)
                        : (row as any)[col.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {totalPages > 1 && !isLoading && (
        <div
          className="px-5 py-4 border-t flex items-center justify-between gap-4"
          style={{ borderColor: "var(--color-border-tertiary)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of{" "}
            {sorted.length} results
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}