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
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-black/60 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-xl font-bold">⚙️ Admin Dashboard</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="bg-zinc-700 px-4 py-2 rounded-lg"
            >
              ⬅ Home
            </button>
            <button
              onClick={logout}
              className="bg-red-500/90 hover:bg-red-500 px-4 py-2 rounded-lg text-white"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {toast && (
          <div className="fixed right-5 top-20 z-50">
            <div
              className={`rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${
                toast.type === "success"
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                  : toast.type === "warning"
                  ? "border-amber-400/40 bg-amber-500/15 text-amber-200"
                  : "border-red-400/40 bg-red-500/15 text-red-200"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}

        {/* CREATE FORM */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-4">

          <h2 className="text-lg font-bold">➕ Thêm sản phẩm</h2>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên sản phẩm"
            className="w-full p-2 rounded bg-zinc-800"
          />

          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Giá"
            type="number"
            className="w-full p-2 rounded bg-zinc-800"
          />

          {/* UPLOAD BUTTON (CUSTOM UI) */}
          <div className="flex flex-col gap-2">

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
              className="cursor-pointer inline-block bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-4 py-2 rounded-lg text-center transition"
            >
              📁 Choose Images (multi upload)
            </label>

            <p className="text-xs text-gray-400">
              Bạn có thể chọn nhiều ảnh cùng lúc
            </p>
          </div>

          {/* PREVIEW */}
          {files.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {files.map((file, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(file)}
                  className="h-20 w-full object-cover rounded-lg border border-zinc-700"
                />
              ))}
            </div>
          )}

          <button
            onClick={createProduct}
            disabled={loading}
            className="bg-green-500 text-black px-4 py-2 rounded-lg w-full font-semibold"
          >
            {loading ? "Đang upload..." : "Tạo sản phẩm"}
          </button>
        </div>

        {/* LIST */}
        <div className="grid gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center"
            >
              <div className="flex gap-4 items-center">

                {p.images?.[0]?.url ? (
                  <img
                    src={p.images[0].url}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-zinc-800 flex items-center justify-center text-xs">
                    No img
                  </div>
                )}

                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-green-400">${p.price}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateProduct(p.id)}
                  className="bg-yellow-500 px-3 py-1 rounded text-black"
                >
                  Sửa
                </button>

                <button
                  onClick={() => deleteProduct(p.id)}
                  className="bg-red-500 px-3 py-1 rounded"
                >
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}