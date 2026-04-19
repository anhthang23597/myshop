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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#050506] to-[#020203] text-[#EDEDEF] overflow-hidden">
      {/* Layer 1: Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)]" />
      
      {/* Layer 2: Noise Texture */}
      <div className="absolute inset-0 opacity-[0.015]" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }} 
      />
      
      {/* Layer 3: Animated Gradient Blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 w-[900px] h-[1400px] bg-[#5E6AD2]/25 rounded-full blur-[150px] animate-float" style={{ animation: 'float 10s ease-in-out infinite' }} />
        <div className="absolute top-1/3 left-0 w-[600px] h-[800px] bg-[rgba(139,92,246,0.15)] rounded-full blur-[120px] animate-float-delayed" style={{ animation: 'float 8s ease-in-out infinite 2s' }} />
        <div className="absolute top-1/2 right-0 w-[500px] h-[700px] bg-[rgba(99,102,241,0.12)] rounded-full blur-[100px] animate-float-delayed" style={{ animation: 'float 9s ease-in-out infinite 4s' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[600px] bg-[#5E6AD2]/10 rounded-full blur-[100px] animate-pulse" />
      </div>
      
      {/* Layer 4: Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{
             backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
             backgroundSize: '64px 64px'
           }} 
      />
      
      <div className="max-w-5xl mx-auto px-6 py-24 md:px-8 lg:px-12 relative">
        {/* HEADER / BACK */}
        <div className="mb-12 flex justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 text-sm bg-white/[0.05] backdrop-blur-xl hover:bg-white/[0.08] border border-white/[0.06] px-4 py-3 rounded-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] font-['Inter'] text-[#EDEDEF] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98]"
          >
Quay lại gallery
          </a>
        </div>

        {/* PRODUCT CARD */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* LEFT - IMAGES */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* RIGHT - INFO */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-white/[0.10] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]">
              <div className="space-y-4">
                <h1 className="font-['Inter'] font-semibold tracking-tight text-2xl md:text-3xl bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">
                  {product.name}
                </h1>

                <div className="text-base text-[#8A8F98] leading-relaxed font-['Inter']">
                  <p>Tác phẩm nghệ thuật độc đáo, thể hiện phong cách riêng và tinh tế.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
