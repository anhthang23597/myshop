"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";

// Custom CSS for animations
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  @keyframes fade-in-up {
    from { 
      opacity: 0; 
      transform: translateY(30px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes gradient-shift {
    0%, 100% { 
      background-position: 0% 50%; 
    }
    50% { 
      background-position: 100% 50%; 
    }
  }
  
  @keyframes pulse-slow {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1); 
    }
    50% { 
      opacity: 0.8; 
      transform: scale(1.05); 
    }
  }
  
  .animate-float {
    animation: float linear infinite;
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out forwards;
  }
  
  .animate-gradient-shift {
    background-size: 200% 200%;
    animation: gradient-shift 3s ease infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 2s ease-in-out infinite;
  }
  
  .particle-container {
    position: relative;
    overflow: hidden;
  }
  
  .particle-container > div {
    filter: blur(1px);
    opacity: 0.6;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .animate-float,
    .animate-fade-in-up,
    .animate-gradient-shift,
    .animate-pulse-slow {
      animation: none;
    }
  }
`;

async function getProducts() {
  const res = await fetch("/api/products");
  return res.json();
}

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  
  const PRODUCTS_PER_PAGE = 12;
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);
  const productCount = products.length;

  useEffect(() => {
    // Inject custom styles
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);

    // Interactive particles on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      const particles = document.querySelectorAll('.particle-container > div');
      particles.forEach((particle, index) => {
        const speed = (index % 2 === 0) ? 0.02 : 0.01;
        const x = (e.clientX / window.innerWidth - 0.5) * 100 * speed;
        const y = (e.clientY / window.innerHeight - 0.5) * 100 * speed;
        (particle as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

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

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#050506] to-[#020203] text-[#EDEDEF] overflow-hidden">
      {/* Layer 1: Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0f0f1a_0%,#0a0a12_40%,#050508_100%)]" />
      
      {/* Layer 2: Noise Texture */}
      <div className="absolute inset-0 opacity-[0.015]" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }} 
      />
      
      {/* Layer 3: Animated Gradient Blobs - Enhanced Colors */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 w-[700px] h-[900px] bg-gradient-to-br from-[#5E6AD2]/25 via-[#8B5CF6]/20 to-[#EC4899]/15 rounded-full blur-[120px] animate-float" style={{ animation: 'float 15s ease-in-out infinite' }} />
        <div className="absolute top-1/3 left-0 w-[500px] h-[700px] bg-gradient-to-br from-[#06B6D4]/20 via-[#8B5CF6]/15 to-[#5E6AD2]/10 rounded-full blur-[100px] animate-float-delayed" style={{ animation: 'float 12s ease-in-out infinite 3s' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[500px] bg-gradient-to-br from-[#F472B6]/18 via-[#8B5CF6]/12 to-[#06B6D4]/10 rounded-full blur-[80px] animate-pulse" style={{ animation: 'pulse 8s ease-in-out infinite' }} />
        <div className="absolute top-1/2 right-0 w-[350px] h-[450px] bg-gradient-to-br from-[#10B981]/15 via-[#06B6D4]/12 to-[#5E6AD2]/10 rounded-full blur-[90px] animate-float" style={{ animation: 'float 18s ease-in-out infinite 5s' }} />
      </div>
      

      <Header />

      <main className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-1 md:px-8 md:pt-2 lg:px-12 lg:pt-2">
        {/* Animated Hero Section */}
        <section className="relative mb-4 overflow-hidden">
          {/* Particle Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="particle-container relative w-full h-full">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-gradient-to-r from-[#5E6AD2]/20 to-[#6872D9]/10 animate-float"
                    style={{
                      width: `${Math.random() * 3 + 1}px`,
                      height: `${Math.random() * 3 + 1}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`,
                      animationDuration: `${Math.random() * 10 + 10}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="products">
          <div className="mb-12 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-['Inter'] font-semibold tracking-tight text-3xl md:text-4xl bg-gradient-to-br from-white via-white/95 to-white/70 bg-clip-text text-transparent">
Tác phẩm nghệ thuật
              </h3>
              <p className="mt-3 text-base text-[#9CA3AF] font-['Inter'] leading-relaxed">
                Bộ sưu tập độc đáo và tinh tế
              </p>
            </div>
            <div className="rounded-full border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl px-4 py-2 text-sm text-[#EDEDEF] font-medium font-['Inter'] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] transition-all duration-500 hover:border-white/[0.12] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_8px_40px_rgba(0,0,0,0.6),0_0_80px_rgba(94,106,210,0.1)]">
              {loading ? "Đang tải..." : `${productCount} tác phẩm`}
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
                <div
                  key={i}
className="overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_30px_rgba(0,0,0,0.6),0_0_60px_rgba(0,0,0,0.3)] animate-pulse transition-all duration-500"
                >
                  <div className="h-48 bg-gradient-to-br from-[#0a0a0c] to-[#050506]" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-4/5 rounded bg-white/[0.05] animate-pulse delay-75" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="rounded-3xl bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-16 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_30px_rgba(0,0,0,0.6),0_0_60px_rgba(0,0,0,0.3)] transition-all duration-500">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] flex items-center justify-center">
                <span className="text-2xl">?</span>
              </div>
              <p className="text-lg font-semibold text-[#EDEDEF] font-['Inter']">
                Chưa có tác phẩm nào
              </p>
              <p className="mt-3 text-sm text-[#8A8F98] font-['Inter']">
                Hãy quay lại sau, gallery đang cập nhật bộ sưu tập mới.
              </p>
            </div>
          )}

          {!loading && currentProducts.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentProducts.map((p: any) => (
                  <Link key={p.id} href={`/product/${p.id}`}>
                    <article className="group overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_30px_rgba(0,0,0,0.6),0_0_60px_rgba(0,0,0,0.3)] transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.08] hover:translate-y-[-6px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_12px_60px_rgba(0,0,0,0.7),0_0_100px_rgba(94,106,210,0.15)]">
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.05] px-4 py-2 text-sm font-medium text-[#EDEDEF] font-['Inter'] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.08] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98]"
                    >
                      trang trước
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium font-['Inter'] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98] ${
                            currentPage === page
                              ? 'bg-[#5E6AD2] text-white shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                              : 'border border-white/[0.06] bg-white/[0.05] text-[#8A8F98] hover:border-white/[0.10] hover:bg-white/[0.08] hover:text-[#EDEDEF] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.05] px-4 py-2 text-sm font-medium text-[#EDEDEF] font-['Inter'] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.08] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98]"
                    >
                      trang sau
                    </button>
                  </div>
                  
                  <div className="text-sm text-[#8A8F98] font-mono">
                    Trang {currentPage} / {totalPages}
                  </div>
                </div>
              )}
            </>
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
