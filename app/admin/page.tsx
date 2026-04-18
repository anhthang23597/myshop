"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Image = {
  url: string;
  publicId?: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number;
  images: Image[];
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const router = useRouter();

  const showToast = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // GET PRODUCTS
  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        const data = await res.json();

        if (!data?.authenticated) {
          router.replace("/admin/login");
          return;
        }

        fetchProducts();
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  // UPLOAD MULTI IMAGES
  const uploadImages = async (): Promise<
    { url: string; publicId?: string | null }[]
  > => {
    const uploadedImages: { url: string; publicId?: string | null }[] = [];

    if (!files.length) return uploadedImages;

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.url) {
        uploadedImages.push({
          url: data.url,
          publicId: data.publicId ?? null,
        });
      }
    }

    return uploadedImages;
  };

  // CREATE PRODUCT
  const createProduct = async () => {
    if (!name || !price) return;

    setLoading(true);

    const uploadedImages = await uploadImages();

    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        price: Number(price),
        images: uploadedImages,
      }),
    });

    if (!res.ok) {
      showToast("error", "Tạo sản phẩm thất bại.");
      setLoading(false);
      return;
    }

    setName("");
    setPrice("");
    setFiles([]);

    setLoading(false);
    fetchProducts();
    showToast("success", "Đã tạo sản phẩm.");
  };

  // DELETE
  const deleteProduct = async (id: string) => {
    const ok = window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?");
    if (!ok) return;

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      showToast("error", data?.error || "Xóa sản phẩm thất bại.");
      return;
    }

    if (data?.cloudinaryWarning) {
      showToast("warning", `Đã xóa sản phẩm. ${data.cloudinaryWarning}`);
    } else {
      showToast("success", "Đã xóa sản phẩm.");
    }

    fetchProducts();
  };

  // UPDATE
  const updateProduct = async (id: string) => {
    const name = prompt("Tên mới?");
    const price = prompt("Giá mới?");

    if (!name || !price) return;

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        price: Number(price),
      }),
    });

    if (!res.ok) {
      showToast("error", "Cập nhật sản phẩm thất bại.");
      return;
    }

    fetchProducts();
    showToast("success", "Đã cập nhật sản phẩm.");
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-2xl border-b border-zinc-800 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚙️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-xs text-zinc-500">Quản lý sản phẩm</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              🏠 Home
            </button>
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-lg text-white transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {toast && (
          <div className="fixed right-5 top-20 z-50 animate-in slide-in-from-right-5 duration-300">
            <div
              className={`rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md flex items-center gap-2 ${
                toast.type === "success"
                  ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200 shadow-emerald-500/20"
                  : toast.type === "warning"
                  ? "border-amber-400/40 bg-amber-500/20 text-amber-200 shadow-amber-500/20"
                  : "border-red-400/40 bg-red-500/20 text-red-200 shadow-red-500/20"
              }`}
            >
              <span className="text-lg">
                {toast.type === "success" ? "✅" : toast.type === "warning" ? "⚠️" : "❌"}
              </span>
              {toast.message}
            </div>
          </div>
        )}

        {/* CREATE FORM */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 p-6 rounded-2xl space-y-4 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
              <span className="text-white font-bold">➕</span>
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Thêm sản phẩm mới</h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tên sản phẩm</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên sản phẩm..."
              className="w-full p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 focus:border-emerald-500 focus:bg-zinc-800 transition-all duration-300 placeholder-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Giá sản phẩm</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Nhập giá..."
              type="number"
              className="w-full p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 focus:border-emerald-500 focus:bg-zinc-800 transition-all duration-300 placeholder-zinc-500"
            />
          </div>

          {/* UPLOAD BUTTON (CUSTOM UI) */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Hình ảnh sản phẩm</label>

            <input
              id="fileUpload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files;
                if (!selected) return;
                setFiles(Array.from(selected));
              }}
            />

            <label
              htmlFor="fileUpload"
              className="cursor-pointer inline-block bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 border border-zinc-600 px-4 py-3 rounded-lg text-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              📁 Chọn ảnh sản phẩm (có thể chọn nhiều)
            </label>

            <p className="text-xs text-zinc-500 flex items-center gap-2">
              <span>💡</span>
              <span>Bạn có thể chọn nhiều ảnh cùng lúc để hiển thị sản phẩm tốt hơn</span>
            </p>
          </div>

          {/* PREVIEW */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Xem trước ({files.length} ảnh)</p>
              <div className="grid grid-cols-4 gap-2">
                {files.map((file, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      className="h-20 w-full object-cover rounded-lg border border-zinc-700 transition-all duration-300 group-hover:border-emerald-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={createProduct}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-black px-4 py-3 rounded-lg w-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                ✨ Tạo sản phẩm
              </>
            )}
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold">📦</span>
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Danh sách sản phẩm ({products.length})</h2>
          </div>

          <div className="grid gap-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 p-4 rounded-xl flex justify-between items-center backdrop-blur-sm hover:border-zinc-700 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex gap-4 items-center">
                  {p.images?.[0]?.url ? (
                    <div className="relative group">
                      <img
                        src={p.images[0].url}
                        className="w-16 h-16 object-cover rounded-lg border border-zinc-700 transition-all duration-300 group-hover:border-emerald-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center text-xs border border-zinc-700">
                      📷
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="font-semibold text-white">{p.name}</p>
                    <p className="text-emerald-400 font-bold">${p.price}</p>
                    <p className="text-xs text-zinc-500">ID: {p.id}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateProduct(p.id)}
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 px-3 py-1 rounded-lg text-black font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-1"
                  >
                    ✏️ Sửa
                  </button>

                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-3 py-1 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-1"
                  >
                    🗑️ Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}