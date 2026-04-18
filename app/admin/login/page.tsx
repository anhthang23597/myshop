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
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 p-6 rounded-2xl w-80">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <p className="mb-4 text-xs text-zinc-400">
          Mặc định: admin / admin (nếu chưa set env riêng)
        </p>

        <input
          className="w-full p-2 mb-2 bg-black border border-zinc-700 rounded"
          placeholder="username"
          onChange={(e) => setU(e.target.value)}
        />

        <input
          className="w-full p-2 mb-4 bg-black border border-zinc-700 rounded"
          type="password"
          placeholder="password"
          onChange={(e) => setP(e.target.value)}
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-white text-black py-2 rounded disabled:opacity-50"
        >
          {loading ? "Đang đăng nhập..." : "Login"}
        </button>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}