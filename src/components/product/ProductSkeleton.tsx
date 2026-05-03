// src/components/product/ProductSkeleton.tsx
export default function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
      {/* left — image skeleton */}
      <div className="flex flex-col gap-3">
        <div
          className="w-full rounded-2xl"
          style={{
            aspectRatio: "1 / 1",
            backgroundColor: "var(--color-background-secondary)",
          }}
        />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-xl flex-shrink-0"
              style={{ backgroundColor: "var(--color-background-secondary)" }}
            />
          ))}
        </div>
      </div>

      {/* right — info skeleton */}
      <div className="flex flex-col gap-4">
        {/* badge */}
        <div
          className="w-20 h-5 rounded-full"
          style={{ backgroundColor: "var(--color-background-secondary)" }}
        />
        {/* name */}
        <div className="flex flex-col gap-2">
          <div
            className="w-full h-7 rounded-xl"
            style={{ backgroundColor: "var(--color-background-secondary)" }}
          />
          <div
            className="w-2/3 h-7 rounded-xl"
            style={{ backgroundColor: "var(--color-background-secondary)" }}
          />
        </div>
        {/* rating */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "var(--color-background-secondary)" }}
            />
          ))}
          <div
            className="w-16 h-4 rounded ml-2"
            style={{ backgroundColor: "var(--color-background-secondary)" }}
          />
        </div>
        {/* price */}
        <div className="flex gap-3 items-center">
          <div
            className="w-24 h-8 rounded-xl"
            style={{ backgroundColor: "var(--color-background-secondary)" }}
          />
          <div
            className="w-16 h-5 rounded-xl"
            style={{ backgroundColor: "var(--color-background-secondary)" }}
          />
        </div>
        {/* divider */}
        <div
          className="w-full h-px"
          style={{ backgroundColor: "var(--color-background-secondary)" }}
        />
        {/* qty + button */}
        <div className="flex gap-3">
          <div
            className="w-28 h-11 rounded-xl"
            style={{ backgroundColor: "var(--color-background-secondary)" }}
          />
          <div
            className="flex-1 h-11 rounded-xl"
            style={{ backgroundColor: "var(--color-background-secondary)" }}
          />
          <div
            className="w-11 h-11 rounded-xl"
            style={{ backgroundColor: "var(--color-background-secondary)" }}
          />
        </div>
        {/* meta lines */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div
              className="w-20 h-4 rounded"
              style={{ backgroundColor: "var(--color-background-secondary)" }}
            />
            <div
              className="w-32 h-4 rounded"
              style={{ backgroundColor: "var(--color-background-secondary)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}