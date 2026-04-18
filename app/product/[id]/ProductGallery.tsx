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
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
        <img
          src={activeImage}
          className="h-[420px] w-full object-cover transition duration-300"
          alt={productName}
        />
      </div>

      {imageList.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {imageList.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`overflow-hidden rounded-xl border bg-zinc-900 transition ${
                i === activeIndex
                  ? "border-emerald-400 ring-2 ring-emerald-500/40"
                  : "border-zinc-800 hover:border-zinc-600"
              }`}
            >
              <img
                src={img.url}
                className="h-24 w-full object-cover"
                alt={`${productName}-${i + 1}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
