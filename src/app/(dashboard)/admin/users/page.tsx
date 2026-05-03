// src/app/(dashboard)/admin/users/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userService } from "../../../../services/user.service";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import DataTable, { Column } from "../../../../components/dashboard/DataTable";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: () => userService.getAll(),
  });

  const users = data?.data ?? [];

  const { mutate: toggleActive } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.updateStatus(id, { isActive }),
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
    onError: () => toast.error("Failed to update user"),
  });

  const columns: Column<any>[] = [
    {
      key: "name",
      label: "User",
      render: (row) => {
        const initials = row.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
            >
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{row.name}</p>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{row.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: row.role === "ADMIN" ? "rgba(239,74,35,0.1)" : row.role === "SELLER" ? "rgba(55,73,187,0.1)" : "rgba(34,197,94,0.1)",
            color: row.role === "ADMIN" ? "#ef4a23" : row.role === "SELLER" ? "#3749bb" : "#22c55e",
          }}
        >
          {row.role}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <button
          onClick={() => toggleActive({ id: row._id, isActive: !row.isActive })}
          className="text-xs font-semibold px-2.5 py-1 rounded-full transition-opacity hover:opacity-70"
          style={{
            backgroundColor: row.isActive ? "rgba(34,197,94,0.1)" : "rgba(240,39,87,0.1)",
            color: row.isActive ? "#22c55e" : "#f02757",
          }}
        >
          {row.isActive ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      sortable: true,
      render: (row) => (
        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-black" style={{ color: "var(--color-text-primary)" }}>All Users</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
          {users.length} total users
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        rowKey={(row) => row._id}
        searchable
        searchPlaceholder="Search by name or email..."
      />
    </div>
  );
}