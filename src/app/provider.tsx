// src/app/providers.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "../lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            fontFamily: "'Trebuchet MS', sans-serif",
            borderRadius: "12px",
          },
        }}
      />
    </QueryClientProvider>
  );
}