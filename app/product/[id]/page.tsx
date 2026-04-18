import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductGallery from "./ProductGallery";

type Image = {
  url: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  images: Image[];
};

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  // ✅ FIX QUAN TRỌNG: tránh crash params
  const { id } = await Promise.resolve(params);

  console.log("PRODUCT ID:", id);

  let product: Product | null = null;

  try {
    product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
  } catch (err) {
    console.log("PRISMA ERROR:", err);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="max-w-5xl mx-auto px-4 py-10 relative">
        {/* HEADER / BACK */}
        <div className="mb-8 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm"
          >
            🏠 Quay lại shop
          </a>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">
              Product ID:
            </span>
            <span className="text-xs text-zinc-400 font-mono bg-zinc-900/50 px-2 py-1 rounded">
              {product.id}
            </span>
          </div>
        </div>

        {/* PRODUCT CARD */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* LEFT - IMAGES */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* RIGHT - INFO */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                  {product.name}
                </h1>

                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-emerald-400 text-3xl md:text-4xl font-bold">
                      ${product.price}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-zinc-300 leading-relaxed">
                  <p>Sản phẩm chất lượng cao, thiết kế hiện đại.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
