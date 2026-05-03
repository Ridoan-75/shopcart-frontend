// src/components/common/Loader.tsx
import { Loader2 } from "lucide-react";

interface LoaderProps {
  text?: string;
  fullPage?: boolean;
}

export default function Loader({ text, fullPage = true }: LoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullPage ? "min-h-screen" : "min-h-40 w-full"
      }`}
    >
      {/* spinner ring */}
      <div className="relative w-14 h-14">
        {/* outer ring */}
        <div
          className="absolute inset-0 rounded-full border-4"
          style={{ borderColor: "rgba(239,74,35,0.12)" }}
        />
        {/* spinning arc */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{ borderTopColor: "#ef4a23" }}
        />
        {/* inner dot */}
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: "#ef4a23" }}
          />
        </div>
      </div>

      {text && (
        <p
          className="text-sm font-medium animate-pulse"
          style={{ color: "var(--color-text-secondary, #52525b)" }}
        >
          {text}
        </p>
      )}
    </div>
  );
}