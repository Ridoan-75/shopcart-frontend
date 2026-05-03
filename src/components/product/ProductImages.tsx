// src/components/product/ProductImages.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";

interface ProductImagesProps {
  images: string[];
  thumbnail: string;
  name: string;
}

export default function ProductImages({
  images,
  thumbnail,
  name,
}: ProductImagesProps) {
  const allImages = thumbnail
    ? [thumbnail, ...images.filter((img) => img !== thumbnail)]
    : images;

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const activeImage = allImages[activeIndex] ?? thumbnail;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* main image */}
      <div
        className="relative w-full rounded-2xl overflow-hidden cursor-zoom-in"
        style={{
          aspectRatio: "1 / 1",
          backgroundColor: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
        }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={activeImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-300"
          style={{
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            transform: zoomed ? "scale(1.6)" : "scale(1)",
          }}
          priority
        />

        {/* zoom hint */}
        {!zoomed && (
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
            style={{
              backgroundColor: "rgba(0,0,0,0.45)",
              color: "#fff",
              backdropFilter: "blur(4px)",
            }}
          >
            <ZoomIn size={12} />
            Hover to zoom
          </div>
        )}

        {/* image counter */}
        {allImages.length > 1 && (
          <div
            className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium"
            style={{
              backgroundColor: "rgba(0,0,0,0.45)",
              color: "#fff",
              backdropFilter: "blur(4px)",
            }}
          >
            {activeIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-200"
              style={{
                border:
                  activeIndex === i
                    ? "2px solid #ef4a23"
                    : "1px solid var(--color-border-tertiary)",
                opacity: activeIndex === i ? 1 : 0.65,
              }}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${name} view ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}