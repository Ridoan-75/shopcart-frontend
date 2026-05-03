// src/components/dashboard/StatsCard.tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  color?: string;
  prefix?: string;
  suffix?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  color = "#ef4a23",
  prefix = "",
  suffix = "",
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-2xl transition-all hover:-translate-y-0.5"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* top row */}
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon size={20} />
        </div>

        {change !== undefined && (
          <span
            className="text-xs font-bold px-2 py-1 rounded-lg"
            style={{
              backgroundColor: isPositive ? "rgba(34,197,94,0.1)" : "rgba(240,39,87,0.1)",
              color: isPositive ? "#22c55e" : "#f02757",
            }}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        )}
      </div>

      {/* value */}
      <div>
        <p
          className="text-2xl font-black tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
        </p>
        <p
          className="text-sm mt-0.5"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {title}
        </p>
      </div>

      {/* change label */}
      {change !== undefined && (
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          <span style={{ color: isPositive ? "#22c55e" : "#f02757", fontWeight: 600 }}>
            {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
          </span>{" "}
          vs last month
        </p>
      )}
    </div>
  );
}