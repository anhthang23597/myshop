"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

async function getProducts() {
  const res = await fetch("/api/products");
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
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur-2xl shadow-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div className="group">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1 font-medium transition-colors group-hover:text-zinc-300">
              ✨ xo may studio
            </p>
            <h1 className="bg-gradient-to-r from-white via-purple-100 to-blue-200 bg-clip-text text-2xl font-black tracking-tight text-transparent md:text-3xl transition-all duration-300 group-hover:scale-105">
              xo may shop
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/"
              className="hidden rounded-xl border border-white/15 px-4 py-2 text-sm text-zinc-200 transition-all duration-300 hover:border-white/35 hover:bg-white/5 hover:shadow-lg md:inline-flex"
            >
              🏠 Trang chủ
            </Link>
            {isAdmin ? (
              <>
                <Link
                  href="/admin"
                  className="rounded-xl bg-gradient-to-r from-emerald-400 to-green-400 px-4 py-2 text-sm font-semibold text-black shadow-[0_8px_20px_rgba(74,222,128,0.35)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(74,222,128,0.45)] hover:scale-105"
                >
                  ⚡ Cập nhật sản phẩm
                </Link>
                <button
                  onClick={logout}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:scale-105"
                >
                  🚪 Đăng xuất
                </button>
              </>
            ) : (
              <Link
                href="/admin/login"
                className="rounded-xl border border-indigo-300/35 bg-gradient-to-r from-indigo-400/15 to-purple-400/15 px-4 py-2 text-sm font-semibold text-indigo-100 transition-all duration-300 hover:border-indigo-200/55 hover:bg-gradient-to-r hover:from-indigo-400/25 hover:to-purple-400/25 hover:shadow-lg hover:scale-105"
              >
                🔐 Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
        <section className="mb-10 grid gap-5 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950/80 p-6 shadow-2xl shadow-black/45 backdrop-blur-xl md:grid-cols-[1.35fr_0.65fr] md:p-8">
          <div className="space-y-4">
            <h2 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-white via-purple-100 to-blue-200 bg-clip-text text-transparent md:text-5xl">
              Bộ sưu tập mới
            </h2>
            <p className="max-w-lg text-sm text-zinc-300 md:text-base leading-relaxed">
              Thiết kế thời thượng, giá tốt
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-medium">
              📦 Sản phẩm
            </p>
            <p className="mt-3 text-3xl font-black bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">{productCount}</p>
          </div>
        </section>

        <section id="products">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent md:text-3xl">
                ✨ Sản phẩm nổi bật
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Tuyển chọn dành riêng cho bạn
              </p>
            </div>
            <span className="rounded-full border border-white/15 bg-gradient-to-r from-white/5 to-white/[0.02] px-3 py-1 text-xs text-zinc-300 backdrop-blur-sm">
              {loading ? "Đang tải..." : `${featuredProducts.length} items`}
            </span>
          </div>

          {loading && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 animate-pulse group"
                >
                  <div className="h-44 bg-gradient-to-br from-zinc-800/70 to-zinc-900/70" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-4/5 rounded bg-zinc-800 animate-pulse delay-75" />
                    <div className="h-4 w-1/2 rounded bg-zinc-800/50 animate-pulse delay-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && featuredProducts.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/55 to-zinc-950/55 p-10 text-center backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-lg font-semibold text-zinc-100">
                Chưa có sản phẩm nào
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Hãy quay lại sau, shop đang cập nhật bộ sưu tập mới.
              </p>
            </div>
          )}

          {!loading && featuredProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {featuredProducts.map((p: any) => (
                <Link key={p.id} href={`/product/${p.id}`}>
                  <article className="group overflow-hidden rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900 to-zinc-950 transition-all duration-300 hover:-translate-y-2 hover:border-zinc-600 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:shadow-zinc-900/50">
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <img
                        src={
                          p.images?.[0]?.url ||
                          "https://placehold.co/600x600/18181b/e4e4e7?text=Product"
                        }
                        className="h-48 w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                        alt={p.name}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="rounded-full bg-white/10 backdrop-blur-sm px-2 py-1 text-xs font-medium text-white">
                          🔍
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <h4 className="truncate text-sm font-semibold text-zinc-100 md:text-base group-hover:text-white transition-colors">
                        {p.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-black bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                          ${p.price}
                        </p>
                        <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-300 group-hover:border-white/20 group-hover:bg-white/10 transition-all">
                          View
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

      <footer className="relative border-t border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 text-xs text-zinc-400 md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">© {new Date().getFullYear()}</span>
            <span className="text-zinc-300 font-medium">Xo May</span>
            <span className="text-zinc-500">All rights reserved.</span>
          </div>
          <p className="text-zinc-500">Modern shopping experience</p>
        </div>
      </footer>
    </div>
  );
}
