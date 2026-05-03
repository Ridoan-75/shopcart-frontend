// src/components/dashboard/SalesChart.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { dashboardService } from "../../services/dashboard.service";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { Loader2 } from "lucide-react";

type Period = "daily" | "weekly" | "monthly";
type ChartType = "line" | "bar";

const PERIOD_LABELS: Record<Period, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2.5 rounded-xl text-xs flex flex-col gap-1"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-secondary)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      <p className="font-semibold mb-1" style={{ color: "var(--color-text-tertiary)" }}>
        {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span style={{ color: "var(--color-text-secondary)" }}>{entry.name}:</span>
          <span className="font-bold" style={{ color: "var(--color-text-primary)" }}>
            ${entry.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SalesChart() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [chartType, setChartType] = useState<ChartType>("line");

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_SALES_CHART, period],
    queryFn: () => dashboardService.getSalesChart({ period }),
  });

  const chartData = data?.data ?? [];

  return (
    <div
      className="flex flex-col gap-5 p-6 rounded-2xl"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
            Sales Overview
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            Revenue and orders over time
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* chart type toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: "0.5px solid var(--color-border-secondary)" }}
          >
            {(["line", "bar"] as ChartType[]).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className="px-3 h-8 text-xs font-medium capitalize transition-all"
                style={{
                  backgroundColor: chartType === type ? "#ef4a23" : "transparent",
                  color: chartType === type ? "#fff" : "var(--color-text-secondary)",
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* period toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: "0.5px solid var(--color-border-secondary)" }}
          >
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 h-8 text-xs font-medium transition-all"
                style={{
                  backgroundColor: period === p ? "#ef4a23" : "transparent",
                  color: period === p ? "#fff" : "var(--color-text-secondary)",
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* chart */}
      <div className="h-64">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={24} className="animate-spin" style={{ color: "#ef4a23" }} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#ef4a23"
                  strokeWidth={2.5}
                  dot={{ fill: "#ef4a23", r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#3749bb"
                  strokeWidth={2}
                  dot={{ fill: "#3749bb", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="revenue" name="Revenue" fill="#ef4a23" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" name="Orders" fill="#3749bb" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}