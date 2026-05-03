// src/components/common/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        backgroundColor: "var(--color-background-primary, #fff)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      {/* image skeleton */}
      <div
        className="w-full h-52 animate-pulse"
        style={{ backgroundColor: "var(--color-background-secondary, #f4f4f5)" }}
      />

      <div className="p-4 flex flex-col gap-3">
        {/* category badge */}
        <div
          className="w-16 h-4 rounded-full animate-pulse"
          style={{ backgroundColor: "var(--color-background-secondary, #f4f4f5)" }}
        />

        {/* product name */}
        <div className="flex flex-col gap-2">
          <div
            className="w-full h-4 rounded-lg animate-pulse"
            style={{ backgroundColor: "var(--color-background-secondary, #f4f4f5)" }}
          />
          <div
            className="w-3/4 h-4 rounded-lg animate-pulse"
            style={{ backgroundColor: "var(--color-background-secondary, #f4f4f5)" }}
          />
        </div>

        {/* rating */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-3.5 h-3.5 rounded-sm animate-pulse"
              style={{ backgroundColor: "var(--color-background-secondary, #f4f4f5)" }}
            />
          ))}
          <div
            className="w-8 h-3 rounded animate-pulse ml-1"
            style={{ backgroundColor: "var(--color-background-secondary, #f4f4f5)" }}
          />
        </div>

        {/* price row */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <div
              className="w-16 h-5 rounded-lg animate-pulse"
              style={{ backgroundColor: "var(--color-background-secondary, #f4f4f5)" }}
            />
            <div
              className="w-12 h-4 rounded-lg animate-pulse"
              style={{ backgroundColor: "var(--color-background-secondary, #f4f4f5)" }}
            />
          </div>
          <div
            className="w-6 h-6 rounded-full animate-pulse"
            style={{ backgroundColor: "var(--color-background-secondary, #f4f4f5)" }}
          />
        </div>

        {/* add to cart button */}
        <div
          className="w-full h-10 rounded-xl animate-pulse mt-1"
          style={{ backgroundColor: "var(--color-background-secondary, #f4f4f5)" }}
        />
      </div>
    </div>
  );
}