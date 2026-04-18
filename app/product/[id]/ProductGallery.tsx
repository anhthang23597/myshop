"use client";

import { useMemo, useState } from "react";

type Image = {
  url: string;
};

type ProductGalleryProps = {
  images: Image[];
  productName: string;
};

const fallbackImage =
  "https://placehold.co/800x800/18181b/e4e4e7?text=No+Image";

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const imageList = useMemo(() => {
    if (!images || images.length === 0) {
      return [{ url: fallbackImage }];
    }
    return images;
  }, [images]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = imageList[activeIndex]?.url ?? fallbackImage;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/60 to-zinc-950/60 shadow-xl backdrop-blur-sm group">
        <div className="relative">
          <img
            src={activeImage}
            className="h-[420px] w-full object-cover transition-all duration-700 group-hover:scale-105"
            alt={productName}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white flex items-center gap-1">
              🔍 Zoom
            </span>
          </div>
        </div>
      </div>

      {imageList.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Xem tất cả ({imageList.length} ảnh)</p>
          <div className="grid grid-cols-4 gap-3">
            {imageList.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative overflow-hidden rounded-xl border bg-zinc-900 transition-all duration-300 group ${
                  i === activeIndex
                    ? "border-emerald-400 ring-2 ring-emerald-500/40 scale-105 shadow-lg shadow-emerald-500/20"
                    : "border-zinc-800 hover:border-zinc-600 hover:scale-105 hover:shadow-lg"
                }`}
              >
                <img
                  src={img.url}
                  className="h-24 w-full object-cover transition-all duration-300 group-hover:scale-110"
                  alt={`${productName}-${i + 1}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {i === activeIndex && (
                  <div className="absolute top-2 right-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
