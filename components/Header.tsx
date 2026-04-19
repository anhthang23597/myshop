"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setIsAdmin(false);
    router.refresh();
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionRes = await fetch("/api/session", { cache: "no-store" });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setIsAdmin(Boolean(sessionData?.authenticated));
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };

    checkSession();
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-8 lg:px-12">
        <Link href="/" className="group">
          <p className="text-xs uppercase tracking-widest text-[#8A8F98] mb-1 font-mono transition-all duration-300 group-hover:text-[#EDEDEF]">
            xo may studio
          </p>
          <h1 className="font-['Inter'] font-semibold tracking-tight text-2xl md:text-3xl bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-[1.02]">
            xo may gallery
          </h1>
        </Link>

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
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
