import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductGallery from "./ProductGallery";
import Header from "@/components/Header";

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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#050506] to-[#020203] text-[#EDEDEF] overflow-hidden">
      <Header />
      
      <div className="max-w-5xl mx-auto px-6 py-24 md:px-8 lg:px-12 relative">
        
        {/* PRODUCT CARD */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* LEFT - IMAGES */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* RIGHT - INFO */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-white/[0.10] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]">
              <div className="space-y-3">
                <h1 className="font-['Inter'] font-bold tracking-tight text-xl md:text-2xl bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">
                  {product.name}
                </h1>

                <div className="text-sm text-[#8A8F98] leading-relaxed font-['Inter']">
                  <p>Tác phẩm nghệ thuật độc đáo, thể hiện phong cách riêng.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
