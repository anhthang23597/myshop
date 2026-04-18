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
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* HEADER / BACK */}
        <div className="mb-8 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2 rounded-xl transition-all"
          >
            ⬅ Quay lại shop
          </a>

          <span className="text-xs text-zinc-500">
            ID: {product.id}
          </span>
        </div>

        {/* PRODUCT CARD */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* LEFT - IMAGES */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* RIGHT - INFO */}
          <div className="flex flex-col justify-center">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 shadow-xl">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                {product.name}
              </h1>

              <p className="text-emerald-400 text-2xl font-semibold mb-6">
                ${product.price}
              </p>

              <div className="text-sm text-zinc-400 leading-relaxed mb-6">
                Sản phẩm chất lượng cao, thiết kế hiện đại và tối ưu trải nghiệm người dùng.
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
