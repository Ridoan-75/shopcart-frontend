// src/components/common/EmptyState.tsx
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* illustration */}
      <div className="relative mb-6">
        {/* outer ring */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(239,74,35,0.07)" }}
        >
          {/* inner ring */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(239,74,35,0.12)" }}
          >
            {icon ? (
              <span style={{ color: "#ef4a23" }}>{icon}</span>
            ) : (
              // default SVG box illustration
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 10L16 4L28 10V22L16 28L4 22V10Z"
                  stroke="#ef4a23"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 4V28M4 10L28 10"
                  stroke="#ef4a23"
                  strokeWidth="1.8"
                  strokeDasharray="3 2"
                />
                <circle cx="16" cy="16" r="3" fill="#ef4a23" fillOpacity="0.3" />
              </svg>
            )}
          </div>
        </div>

        {/* floating dots decoration */}
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{ backgroundColor: "rgba(239,74,35,0.25)" }}
        />
        <div
          className="absolute -bottom-1 -left-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: "rgba(239,74,35,0.15)" }}
        />
      </div>

      {/* text */}
      <h3
        className="text-lg font-bold mb-2"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h3>

      {description && (
        <p
          className="text-sm max-w-xs leading-relaxed mb-6"
          style={{ color: "var(--color-text-secondary, #52525b)" }}
        >
          {description}
        </p>
      )}

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}