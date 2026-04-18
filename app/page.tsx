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
    <div className="relative min-h-screen bg-[#07070a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),transparent_42%)]" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/45 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">
              xo may studio
            </p>
            <h1 className="bg-gradient-to-r from-white via-zinc-100 to-zinc-500 bg-clip-text text-2xl font-black tracking-tight text-transparent md:text-3xl">
              xo may shop
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/"
              className="hidden rounded-xl border border-white/15 px-3 py-2 text-sm text-zinc-200 transition hover:border-white/35 hover:bg-white/5 md:inline-flex"
            >
              Trang chủ
            </Link>
            {isAdmin ? (
              <>
                <Link
                  href="/admin"
                  className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black shadow-[0_8px_20px_rgba(74,222,128,0.35)] transition hover:bg-emerald-300"
                >
                  Cập nhật sản phẩm
                </Link>
                <button
                  onClick={logout}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                href="/admin/login"
                className="rounded-xl border border-indigo-300/35 bg-indigo-400/15 px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:border-indigo-200/55 hover:bg-indigo-400/25"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
        <section className="mb-10 grid gap-5 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950/80 p-6 shadow-2xl shadow-black/45 md:grid-cols-[1.35fr_0.65fr] md:p-8">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-zinc-700/70 bg-zinc-800/65 px-3 py-1 text-xs uppercase tracking-[0.22em] text-zinc-300">
              New Season
            </p>
            <h2 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Bộ sưu tập mới cho phong cách mỗi ngày
            </h2>
            <p className="mt-4 max-w-lg text-sm text-zinc-300 md:text-base">
              Chọn sản phẩm yêu thích với thiết kế thời thượng, giá tốt và trải
              nghiệm mua sắm mượt mà ngay trên trang chủ mới.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Sản phẩm
              </p>
              <p className="mt-3 text-3xl font-black">{productCount}</p>
              <p className="mt-1 text-sm text-zinc-300">Sẵn sàng để đặt mua</p>
            </div>
          </div>
        </section>

        <section id="products">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
                Sản phẩm nổi bật
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Tuyển chọn dành riêng cho bạn
              </p>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-zinc-300">
              {loading ? "Đang tải..." : `${featuredProducts.length} items`}
            </span>
          </div>

          {loading && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 animate-pulse"
                >
                  <div className="h-44 bg-zinc-800/70" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-4/5 rounded bg-zinc-800" />
                    <div className="h-4 w-1/2 rounded bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && featuredProducts.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 p-10 text-center">
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
                  <article className="group overflow-hidden rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900 to-zinc-950 transition duration-300 hover:-translate-y-1 hover:border-zinc-500 hover:shadow-[0_16px_28px_rgba(0,0,0,0.5)]">
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          p.images?.[0]?.url ||
                          "https://placehold.co/600x600/18181b/e4e4e7?text=Product"
                        }
                        className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                        alt={p.name}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 to-transparent" />
                    </div>

                    <div className="p-4">
                      <h4 className="truncate text-sm font-semibold text-zinc-100 md:text-base">
                        {p.name}
                      </h4>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-lg font-black text-emerald-300">
                          ${p.price}
                        </p>
                        <span className="rounded-lg border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-300">
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

      <footer className="relative border-t border-white/10 bg-black/35">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 text-xs text-zinc-400 md:px-6">
          <p>© {new Date().getFullYear()} Xo May. All rights reserved.</p>
          <p>Built for modern shopping experience.</p>
        </div>
      </footer>
    </div>
  );
}
