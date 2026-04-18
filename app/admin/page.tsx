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

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [createName, setCreateName] = useState("");
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  
  const [updateName, setUpdateName] = useState("");
  const [updateFiles, setUpdateFiles] = useState<File[]>([]);

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
  const uploadImages = async (filesToUpload: File[]): Promise<
    { url: string; publicId?: string | null }[]
  > => {
    const uploadedImages: { url: string; publicId?: string | null }[] = [];

    if (!filesToUpload.length) return uploadedImages;

    for (let i = 0; i < filesToUpload.length; i++) {
      const formData = new FormData();
      formData.append("file", filesToUpload[i]);

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
    if (!createName) return;

    setLoading(true);

    const uploadedImages = await uploadImages(createFiles);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: createName,
        price: 0,
        images: uploadedImages,
      }),
    });

    if (!res.ok) {
      showToast("error", "Tạo tác phẩm thất bại.");
      setLoading(false);
      return;
    }

    setCreateName("");
    setCreateFiles([]);
    setShowCreateForm(false);

    setLoading(false);
    fetchProducts();
    showToast("success", "Đã tạo tác phẩm.");
  };

  // DELETE
  const deleteProduct = async (id: string) => {
    const ok = window.confirm("Bạn chắc chắn muốn xóa tác phẩm này?");
    if (!ok) return;

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      showToast("error", data?.error || "Xóa tác phẩm thất bại.");
      return;
    }

    if (data?.cloudinaryWarning) {
      showToast("warning", `Đã xóa tác phẩm. ${data.cloudinaryWarning}`);
    } else {
      showToast("success", "Đã xóa tác phẩm.");
    }

    fetchProducts();
  };

  // UPDATE
  const updateProduct = async (id: string) => {
    if (!updateName) {
      showToast("error", "Vui lòng nhập tên tác phẩm.");
      return;
    }

    setLoading(true);

    const uploadedImages = await uploadImages(updateFiles);

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: updateName,
        price: 0,
        images: uploadedImages,
      }),
    });

    if (!res.ok) {
      showToast("error", "Cập nhật tác phẩm thất bại.");
      setLoading(false);
      return;
    }

    setUpdateName("");
    setUpdateFiles([]);
    setShowUpdateForm(false);
    setEditingProduct(null);

    setLoading(false);
    fetchProducts();
    showToast("success", "Đã cập nhật tác phẩm.");
  };

  // OPEN UPDATE FORM
  const openUpdateForm = (product: Product) => {
    setEditingProduct(product);
    setUpdateName(product.name);
    setUpdateFiles([]);
    setShowUpdateForm(true);
    setShowCreateForm(false);
  };

  // CLOSE FORMS
  const closeForms = () => {
    setShowCreateForm(false);
    setShowUpdateForm(false);
    setEditingProduct(null);
    setCreateName("");
    setCreateFiles([]);
    setUpdateName("");
    setUpdateFiles([]);
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
              <p className="text-xs text-zinc-500">Quản lý tác phẩm</p>
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
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:scale-105"
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

        {/* ADD PRODUCT BUTTON */}
        {!showCreateForm && !showUpdateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
          >
            ✨ Thêm tác phẩm mới
          </button>
        )}

        {/* CREATE FORM */}
        {showCreateForm && (
          <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 p-6 rounded-2xl space-y-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <span className="text-white font-bold">✨</span>
                </div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Thêm tác phẩm mới</h2>
              </div>
              <button
                onClick={closeForms}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tên tác phẩm</label>
              <input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Nhập tên tác phẩm..."
                className="w-full p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 focus:border-emerald-500 focus:bg-zinc-800 transition-all duration-300 placeholder-zinc-500"
              />
            </div>

            {/* UPLOAD BUTTON (CUSTOM UI) */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Hình ảnh tác phẩm</label>

              <input
                id="fileUploadCreate"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files;
                  if (!selected) return;
                  setCreateFiles(Array.from(selected));
                }}
              />

              <label
                htmlFor="fileUploadCreate"
                className="cursor-pointer inline-block bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 border border-zinc-600 px-4 py-3 rounded-lg text-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                📁 Chọn ảnh tác phẩm (có thể chọn nhiều)
              </label>

              <p className="text-xs text-zinc-500 flex items-center gap-2">
                <span>💡</span>
                <span>Bạn có thể chọn nhiều ảnh cùng lúc để hiển thị tác phẩm tốt hơn</span>
              </p>
            </div>

            {/* PREVIEW */}
            {createFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Xem trước ({createFiles.length} ảnh)</p>
                <div className="grid grid-cols-4 gap-2">
                  {createFiles.map((file: File, i: number) => (
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
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg w-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  ✨ Tạo
                </>
              )}
            </button>
          </div>
        )}

        {/* UPDATE FORM */}
        {showUpdateForm && editingProduct && (
          <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 p-6 rounded-2xl space-y-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                  <span className="text-white font-bold">📝</span>
                </div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Cập nhật</h2>
              </div>
              <button
                onClick={closeForms}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tên tác phẩm</label>
              <input
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                placeholder="Nhập tên tác phẩm..."
                className="w-full p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 focus:border-emerald-500 focus:bg-zinc-800 transition-all duration-300 placeholder-zinc-500"
              />
            </div>

            {/* UPLOAD BUTTON (CUSTOM UI) */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Thêm ảnh mới (tùy chọn)</label>

              <input
                id="fileUploadUpdate"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files;
                  if (!selected) return;
                  setUpdateFiles(Array.from(selected));
                }}
              />

              <label
                htmlFor="fileUploadUpdate"
                className="cursor-pointer inline-block bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 border border-zinc-600 px-4 py-3 rounded-lg text-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                📁 Thêm ảnh tác phẩm
              </label>

              <p className="text-xs text-zinc-500 flex items-center gap-2">
                <span>💡</span>
                <span>Các ảnh hiện tại sẽ được giữ lại</span>
              </p>
            </div>

            {/* PREVIEW */}
            {updateFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Ảnh mới ({updateFiles.length} ảnh)</p>
                <div className="grid grid-cols-4 gap-2">
                  {updateFiles.map((file: File, i: number) => (
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

            <div className="flex gap-3">
              <button
                onClick={() => updateProduct(editingProduct.id)}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    ✨ Cập nhật
                  </>
                )}
              </button>
              <button
                onClick={closeForms}
                className="px-4 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all duration-300"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* LIST */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold">📦</span>
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Danh sách tác phẩm ({products.length})</h2>
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
                    <p className="text-xs text-zinc-500">ID: {p.id}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openUpdateForm(p)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-1 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-1"
                  >
                    📝 Chỉnh sửa
                  </button>

                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 px-3 py-1 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-1"
                  >
                    🗑 Xoá
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
