// src/app/(dashboard)/admin/reports/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Download,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import axiosInstance from "../../../../lib/axios";

type Range = "7d" | "30d" | "90d" | "1y";

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "1y", label: "1 Year" },
];

const PIE_COLORS = ["#ef4a23", "#3749bb", "#f02757", "#ca8a04", "#16a34a"];

const INPUT_STYLE = {
  border: "0.5px solid var(--color-border-secondary)",
  backgroundColor: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
};

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  trendValue,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
        >
          <Icon size={18} />
        </div>
        {trend && trendValue && (
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={
              trend === "up"
                ? { backgroundColor: "rgba(34,197,94,0.1)", color: "#16a34a" }
                : { backgroundColor: "rgba(240,39,87,0.1)", color: "#f02757" }
            }
          >
            {trend === "up" ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p
          className="text-2xl font-black leading-none"
          style={{ color: "var(--color-text-primary)" }}
        >
          {value}
        </p>
        <p
          className="text-xs font-medium mt-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {label}
        </p>
        {sub && (
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "var(--color-border-tertiary)" }}
      >
        <p
          className="font-bold text-sm"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs shadow-lg"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-secondary)",
        color: "var(--color-text-primary)",
      }}
    >
      <p className="font-bold mb-1" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color ?? "#ef4a23" }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AdminReportsPage() {
  const [range, setRange] = useState<Range>("30d");

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.REPORTS, range],
    queryFn: () =>
      axiosInstance.get(`/reports/overview?range=${range}`).then((r) => r.data),
  });

  const report = data?.data;

  const handleExport = () => {
    if (!report) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Revenue", report.totalRevenue ?? 0],
      ["Total Orders", report.totalOrders ?? 0],
      ["Total Customers", report.totalCustomers ?? 0],
      ["Avg Order Value", report.avgOrderValue ?? 0],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Reports
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Analytics and performance overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* range selector */}
          <div className="flex items-center rounded-xl overflow-hidden"
            style={{ border: "0.5px solid var(--color-border-secondary)" }}>
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className="h-10 px-4 text-sm font-medium transition-all"
                style={
                  range === opt.value
                    ? { backgroundColor: "#ef4a23", color: "#fff" }
                    : {
                        backgroundColor: "var(--color-background-secondary)",
                        color: "var(--color-text-secondary)",
                      }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{
              border: "0.5px solid var(--color-border-secondary)",
              color: "var(--color-text-secondary)",
              backgroundColor: "var(--color-background-primary)",
            }}
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loader fullPage={false} text="Loading reports..." />
      ) : (
        <>
          {/* stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Revenue"
              value={`$${(report?.totalRevenue ?? 0).toLocaleString()}`}
              sub={`Last ${range}`}
              icon={DollarSign}
              trend={report?.revenueTrend >= 0 ? "up" : "down"}
              trendValue={`${Math.abs(report?.revenueTrend ?? 0).toFixed(1)}%`}
            />
            <StatCard
              label="Total Orders"
              value={(report?.totalOrders ?? 0).toLocaleString()}
              sub={`Last ${range}`}
              icon={ShoppingBag}
              trend={report?.ordersTrend >= 0 ? "up" : "down"}
              trendValue={`${Math.abs(report?.ordersTrend ?? 0).toFixed(1)}%`}
            />
            <StatCard
              label="Total Customers"
              value={(report?.totalCustomers ?? 0).toLocaleString()}
              sub="All time"
              icon={Users}
              trend={report?.customersTrend >= 0 ? "up" : "down"}
              trendValue={`${Math.abs(report?.customersTrend ?? 0).toFixed(1)}%`}
            />
            <StatCard
              label="Avg Order Value"
              value={`$${(report?.avgOrderValue ?? 0).toFixed(2)}`}
              sub={`Last ${range}`}
              icon={TrendingUp}
              trend={report?.aovTrend >= 0 ? "up" : "down"}
              trendValue={`${Math.abs(report?.aovTrend ?? 0).toFixed(1)}%`}
            />
          </div>

          {/* charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

            {/* revenue line chart */}
            <ChartCard title="Revenue Over Time">
              {report?.revenueChart?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={report.revenueChart}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border-tertiary)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#ef4a23"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, fill: "#ef4a23" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div
                  className="flex items-center justify-center h-[220px] text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  No data available
                </div>
              )}
            </ChartCard>

            {/* orders bar chart */}
            <ChartCard title="Orders Over Time">
              {report?.ordersChart?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={report.ordersChart}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border-tertiary)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="orders"
                      fill="#ef4a23"
                      radius={[4, 4, 0, 0]}
                      fillOpacity={0.85}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div
                  className="flex items-center justify-center h-[220px] text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  No data available
                </div>
              )}
            </ChartCard>
          </div>

          {/* charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

            {/* order status pie */}
            <ChartCard title="Orders by Status">
              {report?.statusDistribution?.length ? (
                <div className="flex flex-col items-center gap-4">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={report.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        dataKey="count"
                        nameKey="status"
                        paddingAngle={3}
                      >
                        {report.statusDistribution.map((_: any, i: number) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
                    {report.statusDistribution.map((s: any, i: number) => (
                      <div key={s.status} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {s.status} ({s.count})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center justify-center h-[220px] text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  No data available
                </div>
              )}
            </ChartCard>

            {/* top products */}
            <div className="lg:col-span-2">
              <ChartCard title="Top Selling Products">
                {report?.topProducts?.length ? (
                  <div className="flex flex-col gap-3">
                    {report.topProducts.slice(0, 5).map((p: any, i: number) => (
                      <div key={p._id} className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            backgroundColor:
                              i === 0
                                ? "rgba(239,74,35,0.15)"
                                : "var(--color-background-secondary)",
                            color:
                              i === 0 ? "#ef4a23" : "var(--color-text-tertiary)",
                          }}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="flex-1 h-1.5 rounded-full overflow-hidden"
                              style={{ backgroundColor: "var(--color-background-secondary)" }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: "#ef4a23",
                                  width: `${Math.min(
                                    100,
                                    (p.totalSold /
                                      (report.topProducts[0]?.totalSold || 1)) *
                                      100
                                  )}%`,
                                  opacity: 0.7 + i * 0.06,
                                }}
                              />
                            </div>
                            <span
                              className="text-xs font-semibold flex-shrink-0"
                              style={{ color: "var(--color-text-secondary)" }}
                            >
                              {p.totalSold} sold
                            </span>
                          </div>
                        </div>
                        <span
                          className="text-sm font-bold flex-shrink-0"
                          style={{ color: "#ef4a23" }}
                        >
                          ${p.totalRevenue?.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center h-[160px] text-sm"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    No data available
                  </div>
                )}
              </ChartCard>
            </div>
          </div>

          {/* top categories */}
          <ChartCard title="Revenue by Category">
            {report?.categoryRevenue?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={report.categoryRevenue}
                  layout="vertical"
                  margin={{ left: 16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border-tertiary)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="revenue"
                    fill="#ef4a23"
                    radius={[0, 4, 4, 0]}
                    fillOpacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="flex items-center justify-center h-[220px] text-sm"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                No data available
              </div>
            )}
          </ChartCard>
        </>
      )}
    </div>
  );
}