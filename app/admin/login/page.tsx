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
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-white flex items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="relative bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-6 rounded-2xl w-80 backdrop-blur-xl border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">🔐</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Admin Login</h1>
            <p className="text-xs text-zinc-500">Đăng nhập quản lý</p>
          </div>
        </div>
        
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Username</label>
            <input
              className="w-full p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:border-emerald-500 focus:bg-zinc-800 transition-all duration-300 placeholder-zinc-500"
              placeholder="Nhập username..."
              onChange={(e) => setU(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</label>
            <input
              className="w-full p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:border-emerald-500 focus:bg-zinc-800 transition-all duration-300 placeholder-zinc-500"
              type="password"
              placeholder="Nhập password..."
              onChange={(e) => setP(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-black py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-6"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              Đang đăng nhập...
            </>
          ) : (
            <>
              🔑 Đăng nhập
            </>
          )}
        </button>
        
        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2">
            <span className="text-red-400 text-sm">❌</span>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}