"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

async function getProducts() {
  const res = await fetch("/api/products?limit=8");
  return res.json();
}

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const featuredProducts = products.slice(0, 8);
  const productCount = products.length;

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setIsAdmin(false);
    router.refresh();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productData, sessionRes] = await Promise.all([
          getProducts(),
          fetch("/api/session", { cache: "no-store" }),
        ]);

        setProducts(productData);

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setIsAdmin(Boolean(sessionData?.authenticated));
        } else {
          setIsAdmin(false);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#050506] to-[#020203] text-[#EDEDEF] overflow-hidden">
      {/* Layer 1: Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)]" />
      
      {/* Layer 2: Noise Texture */}
      <div className="absolute inset-0 opacity-[0.015]" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }} 
      />
      
      {/* Layer 3: Animated Gradient Blobs - Optimized */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 w-[600px] h-[800px] bg-[#5E6AD2]/20 rounded-full blur-[100px] animate-float" style={{ animation: 'float 12s ease-in-out infinite' }} />
        <div className="absolute top-1/3 left-0 w-[400px] h-[600px] bg-[rgba(139,92,246,0.12)] rounded-full blur-[80px] animate-float-delayed" style={{ animation: 'float 10s ease-in-out infinite 3s' }} />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[400px] bg-[#5E6AD2]/8 rounded-full blur-[60px] animate-pulse" />
      </div>
      

      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-8 lg:px-12">
          <div className="group">
            <p className="text-xs uppercase tracking-widest text-[#8A8F98] mb-1 font-mono transition-all duration-300 group-hover:text-[#EDEDEF]">
              ✨ xo may studio
            </p>
            <h1 className="font-['Inter'] font-semibold tracking-tight text-2xl md:text-3xl bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-[1.02]">
              xo may gallery
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {isAdmin ? (
              <>
                <Link
                  href="/admin"
                  className="rounded-lg bg-[#5E6AD2] px-6 py-3 text-sm font-medium text-white font-['Inter'] shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-[#6872D9] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_8px_40px_rgba(94,106,210,0.4),inset_0_1px_0_0_rgba(255,255,255,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98] relative overflow-hidden group"
                >
                  <span className="relative z-10">Cập nhật</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Link>
                <button
                  onClick={logout}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.05] px-4 py-3 text-sm font-medium text-[#EDEDEF] font-['Inter'] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.08] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98]"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                href="/admin/login"
                className="rounded-lg border border-white/[0.06] bg-white/[0.05] px-4 py-3 text-sm font-medium text-[#8A8F98] font-['Inter'] transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.08] hover:text-[#EDEDEF] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-16 md:px-8 md:pt-20 lg:px-12 lg:pt-24">
        <section className="mb-16 grid gap-4 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] md:grid-cols-[1.35fr_0.65fr] md:p-6 transition-all duration-300 hover:border-white/[0.10] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]">
          <div className="space-y-3">
            <h2 className="font-['Inter'] font-semibold tracking-tight text-3xl md:text-4xl bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">
              Bộ sưu tập nghệ thuật
            </h2>
            <p className="max-w-lg text-base text-[#8A8F98] font-['Inter'] leading-relaxed">
              Thiết kế độc đáo, phong cách riêng
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <p className="text-xs uppercase tracking-widest text-[#8A8F98] font-mono">
              🎨 Tác phẩm
            </p>
            <p className="mt-2 text-3xl font-semibold bg-gradient-to-r from-[#5E6AD2] to-[#6872D9] bg-clip-text text-transparent font-['Inter']">{productCount}</p>
          </div>
        </section>

        <section id="products">
          <div className="mb-8 flex items-end justify-between gap-3">
            <div>
              <h3 className="font-['Inter'] font-semibold tracking-tight text-3xl md:text-4xl bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">
                ✨ Tác phẩm nổi bật
              </h3>
              <p className="mt-2 text-sm text-[#8A8F98] font-['Inter']">
                Tuyển chọn nghệ thuật độc đáo
              </p>
            </div>
            <span className="rounded-full border border-white/[0.06] bg-white/[0.05] backdrop-blur-xl px-3 py-1 text-xs text-[#8A8F98] font-mono shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
              {loading ? "Đang tải..." : `${featuredProducts.length} items`}
            </span>
          </div>

          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] animate-pulse transition-all duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-[#0a0a0c] to-[#050506]" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-4/5 rounded bg-white/[0.05] animate-pulse delay-75" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && featuredProducts.length === 0 && (
            <div className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-12 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-lg font-semibold text-[#EDEDEF] font-['Inter']">
                Chưa có tác phẩm nào
              </p>
              <p className="mt-3 text-sm text-[#8A8F98] font-['Inter']">
                Hãy quay lại sau, gallery đang cập nhật bộ sưu tập mới.
              </p>
            </div>
          )}

          {!loading && featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredProducts.map((p: any) => (
                <Link key={p.id} href={`/product/${p.id}`}>
                  <article className="group overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.08] hover:translate-y-[-4px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]">
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#5E6AD2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <img
                        src={
                          p.images?.[0]?.url ||
                          "https://placehold.co/600x600/050506/EDEDEF?text=Product"
                        }
                        className="h-48 w-full object-cover transition-all duration-300 group-hover:scale-110"
                        alt={p.name}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#050506] via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/[0.06] px-2 py-1 text-xs font-medium text-[#EDEDEF] font-['Inter'] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
                          Xem
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <h4 className="truncate text-sm font-medium text-[#EDEDEF] font-['Inter'] group-hover:text-[#5E6AD2] transition-colors">
                        {p.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg border border-white/[0.06] bg-transparent px-2 py-1 text-[10px] uppercase tracking-widest text-[#8A8F98] font-mono group-hover:border-[#5E6AD2]/30 group-hover:text-[#5E6AD2] transition-all">
                          Chi tiết
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="relative border-t border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl mt-32">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 text-xs text-[#8A8F98] font-['Inter'] md:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <span className="text-[#8A8F98]">© {new Date().getFullYear()}</span>
            <span className="text-[#EDEDEF] font-medium">Xo May</span>
            <span className="text-[#8A8F98]">All rights reserved.</span>
          </div>
          <p className="text-[#8A8F98]">Art gallery experience</p>
        </div>
      </footer>
    </div>
  );
}
