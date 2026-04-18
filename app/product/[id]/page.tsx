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
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">📸</span>
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Hình ảnh sản phẩm</h2>
            </div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* RIGHT - INFO */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                      {product.name}
                    </h1>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
                      </span>
                      <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">In Stock</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-emerald-400 text-3xl md:text-4xl font-bold">
                      ${product.price}
                    </span>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">USD</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm text-zinc-300 leading-relaxed">
                    <p className="mb-3">Sản phẩm chất lượng cao, thiết kế hiện đại và tối ưu trải nghiệm người dùng.</p>
                    <p className="text-zinc-400">Được sản xuất với tiêu chuẩn quốc tế, đảm bảo độ bền và thẩm mỹ vượt trội.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="text-emerald-400">✓</span>
                      <span>Chất lượng cao</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="text-emerald-400">✓</span>
                      <span>Bảo hành 12 tháng</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="text-emerald-400">✓</span>
                      <span>Miễn phí vận chuyển</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="text-emerald-400">✓</span>
                      <span>Hỗ trợ 24/7</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex gap-3">
                    <button className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-black px-4 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2">
                      🛒 Thêm vào giỏ
                    </button>
                    <button className="bg-zinc-800 hover:bg-zinc-700 px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      ❤️
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💎</span>
                <h3 className="font-semibold text-purple-200">Premium Features</h3>
              </div>
              <p className="text-sm text-zinc-300">Sản phẩm này thuộc bộ sưu tập cao cấp với nhiều tính năng ưu việt và thiết kế độc đáo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
