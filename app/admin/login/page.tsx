"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const login = async () => {
    setError("");
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Đăng nhập thất bại.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#050506] to-[#020203] text-[#EDEDEF] flex items-center justify-center overflow-hidden">
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
      
      <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-6 rounded-2xl w-80 border border-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-white/[0.10] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#5E6AD2] flex items-center justify-center shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
            <span className="text-white font-bold text-lg">🔐</span>
          </div>
          <div>
            <h1 className="font-['Inter'] font-semibold text-xl bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">Admin Login</h1>
            <p className="text-xs text-[#8A8F98] font-mono">Đăng nhập quản lý</p>
          </div>
        </div>
        
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#8A8F98] uppercase tracking-widest font-mono">Username</label>
            <input
              className="w-full p-3 bg-[#0F0F12] border border-white/[0.10] focus:border-[#5E6AD2]/50 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2]/20 focus:shadow-[0_0_20px_rgba(94,106,210,0.1)] transition-all duration-300 placeholder-[rgba(255,255,255,0.60)] text-[#EDEDEF] rounded-lg font-['Inter']"
              placeholder="Nhập username..."
              onChange={(e) => setU(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#8A8F98] uppercase tracking-widest font-mono">Password</label>
            <input
              className="w-full p-3 bg-[#0F0F12] border border-white/[0.10] focus:border-[#5E6AD2]/50 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2]/20 focus:shadow-[0_0_20px_rgba(94,106,210,0.1)] transition-all duration-300 placeholder-[rgba(255,255,255,0.60)] text-[#EDEDEF] rounded-lg font-['Inter']"
              type="password"
              placeholder="Nhập password..."
              onChange={(e) => setP(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-[#5E6AD2] py-3 rounded-lg font-medium text-white font-['Inter'] shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-[#6872D9] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_8px_40px_rgba(94,106,210,0.4),inset_0_1px_0_0_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98] relative overflow-hidden group flex items-center justify-center gap-2 mt-6"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Đang đăng nhập...
            </>
          ) : (
            <>
              <span className="relative z-10">🔑 Đăng nhập</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </>
          )}
        </button>
        
        {error && (
          <div className="mt-3 p-3 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.10] flex items-center gap-2 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]">
            <span className="text-[#EDEDEF] text-sm font-['Inter']">❌</span>
            <p className="text-sm text-[#EDEDEF] font-['Inter']">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}