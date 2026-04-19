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

  // TEST UPLOAD FUNCTION
  const testUpload = async (file: File) => {
    console.log("===== TEST UPLOAD START =====");
    console.log("Testing file:", file.name, file.size, file.type);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/test-upload", {
        method: "POST",
        body: formData,
      });
      
      console.log("Test response status:", res.status);
      const data = await res.json();
      console.log("Test response data:", data);
      
      if (res.ok) {
        showToast("success", `Test upload thành công: ${file.name}`);
      } else {
        showToast("error", `Test upload thất bại: ${data.error}`);
      }
    } catch (error: any) {
      console.error("Test upload error:", error);
      showToast("error", `Test upload lỗi: ${error.message}`);
    }
  };

  // CONVERT FILE TO JPEG FOR MOBILE COMPATIBILITY
  const convertToJpeg = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Limit dimensions for mobile
        const maxDim = 1200;
        let { width, height } = img;
        
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const convertedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(convertedFile);
            } else {
              reject(new Error('Canvas conversion failed'));
            }
          },
          'image/jpeg',
          0.8
        );
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  };

  // UPLOAD MULTI IMAGES - Mobile optimized with file conversion
  const uploadImages = async (filesToUpload: File[]): Promise<
    { url: string; publicId?: string | null }[]
  > => {
    const uploadedImages: { url: string; publicId?: string | null }[] = [];

    if (!filesToUpload.length) return uploadedImages;

    console.log(`Starting upload for ${filesToUpload.length} files`);
    
    // Process files one by one for mobile reliability
    for (let i = 0; i < filesToUpload.length; i++) {
      const originalFile = filesToUpload[i];
      console.log(`Processing file ${i + 1}/${filesToUpload.length}: ${originalFile.name}, size: ${originalFile.size}`);
      
      try {
        let fileToUpload = originalFile;
        
        // Convert non-JPEG files and large files for mobile compatibility
        if (!originalFile.type.startsWith('image/jpeg') || originalFile.size > 2 * 1024 * 1024) {
          console.log(`Converting file for mobile compatibility...`);
          fileToUpload = await convertToJpeg(originalFile);
          console.log(`Converted file size: ${fileToUpload.size}`);
        }
        
        // Final size check (strict 2MB limit for mobile)
        if (fileToUpload.size > 2 * 1024 * 1024) {
          console.warn(`File ${fileToUpload.name} still too large: ${fileToUpload.size} bytes`);
          showToast("error", `File ${fileToUpload.name} quá lón (max 2MB sau khi nén)`);
          continue;
        }
        
        // Create FormData with mobile-specific headers
        const formData = new FormData();
        formData.append('file', fileToUpload);
        
        console.log(`Uploading converted file: ${fileToUpload.name}, type: ${fileToUpload.type}`);

        // Mobile-specific fetch options
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for mobile
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          headers: {
            // Ensure mobile compatibility
            'Accept': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        console.log(`Upload response status: ${res.status}`);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Upload failed with status ${res.status}:`, errorText);
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText || 'Unknown error' };
          }
          
          showToast("error", `Upload thất bại: ${errorData.error || `Lỗi server (${res.status})`}`);
          continue;
        }
        
        const data = await res.json();
        console.log(`Upload success:`, data);
        
        if (data.url) {
          uploadedImages.push({
            url: data.url,
            publicId: data.publicId ?? null,
          });
          showToast("success", `Đã upload ${fileToUpload.name}`);
        } else {
          console.error(`No URL in response:`, data);
          showToast("error", `Upload ${fileToUpload.name} không có URL`);
        }
      } catch (error: any) {
        console.error(`Upload error for ${originalFile.name}:`, error);
        
        let errorMessage = error?.message || 'Lỗi không xác định';
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout - kết nối mạng không ổn định';
        }
        
        showToast("error", `Upload ${originalFile.name} lỗi: ${errorMessage}`);
      }
    }

    console.log(`Upload completed. Success: ${uploadedImages.length}/${filesToUpload.length}`);
    return uploadedImages;
  };

  // CREATE PRODUCT - Mobile optimized with debugging
  const createProduct = async () => {
    if (!createName) {
      showToast("error", "Vui lòng nhập tên tác phẩm");
      return;
    }

    console.log(`Creating product: ${createName} with ${createFiles.length} files`);
    setLoading(true);
    
    try {
      const uploadedImages = await uploadImages(createFiles);
      
      if (uploadedImages.length === 0 && createFiles.length > 0) {
        showToast("error", "Upload tất cả ảnh thất bại. Vui lòng thử lại.");
        setLoading(false);
        return;
      }
      
      console.log(`Images uploaded: ${uploadedImages.length}`);

      const productData = {
        name: createName,
        price: 0,
        images: uploadedImages,
      };
      
      console.log(`Creating product with data:`, productData);
      
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      console.log(`Product creation response: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error(`Product creation failed:`, errorData);
        showToast("error", `Tạo tác phẩm thất bại: ${errorData.error || "Lỗi server"}`);
        return;
      }

      setCreateName("");
      setCreateFiles([]);
      setShowCreateForm(false);
      
      await fetchProducts();
      showToast("success", "Đã tạo tác phẩm.");
    } catch (error) {
      showToast("error", "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#050506] to-[#020203] text-[#EDEDEF] overflow-hidden">
      {/* Layer 1: Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)]" />
      
      {/* Layer 2: Noise Texture */}
      <div className="absolute inset-0 opacity-[0.015]" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }} 
      />
      
      {/* Layer 3: Animated Gradient Blobs - Mobile Optimized */}
      <div className="pointer-events-none absolute inset-0">
        {/* Desktop: Full animations */}
        <div className="hidden md:block">
          <div className="absolute top-0 left-1/2 w-[600px] h-[800px] bg-[#5E6AD2]/20 rounded-full blur-[100px] animate-float" style={{ animation: 'float 12s ease-in-out infinite' }} />
          <div className="absolute top-1/3 left-0 w-[400px] h-[600px] bg-[rgba(139,92,246,0.12)] rounded-full blur-[80px] animate-float-delayed" style={{ animation: 'float 10s ease-in-out infinite 3s' }} />
          <div className="absolute bottom-0 left-1/3 w-[300px] h-[400px] bg-[#5E6AD2]/8 rounded-full blur-[60px] animate-pulse" />
        </div>
        
        {/* Mobile: Minimal static background */}
        <div className="md:hidden">
          <div className="absolute top-0 left-1/2 w-[300px] h-[400px] bg-[#5E6AD2]/10 rounded-full blur-[60px]" />
          <div className="absolute bottom-0 right-0 w-[200px] h-[300px] bg-[rgba(139,92,246,0.08)] rounded-full blur-[40px]" />
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#5E6AD2] flex items-center justify-center shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
              <span className="text-white font-bold text-lg">⚙️</span>
            </div>
            <div>
              <h1 className="font-['Inter'] font-semibold text-xl bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-xs text-[#8A8F98] font-mono">Quản lý tác phẩm</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="rounded-lg border border-white/[0.06] bg-white/[0.05] px-4 py-3 text-sm font-medium text-[#EDEDEF] font-['Inter'] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.08] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98]"
            >
              🏠 Home
            </button>
            <button
              onClick={logout}
              className="rounded-lg border border-white/[0.06] bg-white/[0.05] px-4 py-3 text-sm font-medium text-[#EDEDEF] font-['Inter'] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.08] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98]"
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8 md:px-8 lg:px-12">
        {toast && (
          <div className="fixed right-6 top-20 z-50 animate-in slide-in-from-right-5 duration-300">
            <div
              className={`rounded-2xl border px-4 py-3 text-sm shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] backdrop-blur-xl flex items-center gap-2 font-['Inter'] ${
                toast.type === "success"
                  ? "border-[#5E6AD2]/30 bg-[rgba(94,106,210,0.15)] text-[#EDEDEF]"
                  : toast.type === "warning"
                  ? "border-white/[0.10] bg-[rgba(255,255,255,0.15)] text-[#EDEDEF]"
                  : "border-white/[0.10] bg-[rgba(255,255,255,0.15)] text-[#EDEDEF]"
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
            className="w-full bg-[#5E6AD2] px-6 py-3 rounded-lg font-medium text-white font-['Inter'] shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-[#6872D9] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_8px_40px_rgba(94,106,210,0.4),inset_0_1px_0_0_rgba(255,255,255,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98] relative overflow-hidden group"
          >
            <span className="relative z-10">✨ Thêm tác phẩm mới</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        )}

        {/* CREATE FORM */}
        {showCreateForm && (
          <div className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6 rounded-2xl space-y-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-white/[0.10] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#5E6AD2] flex items-center justify-center shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
                  <span className="text-white font-bold">✨</span>
                </div>
                <h2 className="font-['Inter'] font-semibold text-lg bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">Thêm tác phẩm mới</h2>
              </div>
              <button
                onClick={closeForms}
                className="text-[#8A8F98] hover:text-[#EDEDEF] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#8A8F98] uppercase tracking-widest font-mono">Tên tác phẩm</label>
              <input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Nhập tên tác phẩm..."
                className="w-full p-3 rounded-lg bg-[#0F0F12] border border-white/[0.10] focus:border-[#5E6AD2]/50 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2]/20 focus:shadow-[0_0_20px_rgba(94,106,210,0.1)] transition-all duration-300 placeholder-[rgba(255,255,255,0.60)] text-[#EDEDEF] font-['Inter']"
              />
            </div>

            {/* UPLOAD BUTTON (CUSTOM UI) */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-[#8A8F98] uppercase tracking-widest font-mono">Hình ảnh tác phẩm</label>

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
                className="cursor-pointer inline-block bg-white/[0.05] backdrop-blur-xl border border-white/[0.06] hover:border-white/[0.10] px-4 py-3 rounded-lg text-center transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] font-['Inter'] text-[#EDEDEF] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
              >
                📁 Chọn ảnh tác phẩm (có thể chọn nhiều)
              </label>

              <p className="text-xs text-[#8A8F98] flex items-center gap-2 font-['Inter']">
                <span>💡</span>
                <span>Bạn có thể chọn nhiều ảnh cùng lúc để hiển thị tác phẩm tốt hơn</span>
              </p>
            </div>

            {/* PREVIEW */}
            {createFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#8A8F98] uppercase tracking-widest font-mono">Xem trước ({createFiles.length} ảnh)</p>
                <div className="grid grid-cols-4 gap-2">
                  {createFiles.map((file: File, i: number) => (
                    <div key={i} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        className="h-20 w-full object-cover rounded-lg border border-white/[0.06] transition-all duration-300 group-hover:border-[#5E6AD2]/50 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050506]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={createProduct}
              disabled={loading}
              className="bg-[#5E6AD2] px-6 py-3 rounded-lg w-full font-medium text-white font-['Inter'] shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-[#6872D9] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_8px_40px_rgba(94,106,210,0.4),inset_0_1px_0_0_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98] relative overflow-hidden group flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span className="relative z-10">✨ Tạo</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </>
              )}
            </button>
          </div>
        )}

        {/* UPDATE FORM */}
        {showUpdateForm && editingProduct && (
          <div className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6 rounded-2xl space-y-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-white/[0.10] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#5E6AD2] flex items-center justify-center shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
                  <span className="text-white font-bold">📝</span>
                </div>
                <h2 className="font-['Inter'] font-semibold text-lg bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">Cập nhật</h2>
              </div>
              <button
                onClick={closeForms}
                className="text-[#8A8F98] hover:text-[#EDEDEF] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#8A8F98] uppercase tracking-widest font-mono">Tên tác phẩm</label>
              <input
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                placeholder="Nhập tên tác phẩm..."
                className="w-full p-3 rounded-lg bg-[#0F0F12] border border-white/[0.10] focus:border-[#5E6AD2]/50 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2]/20 focus:shadow-[0_0_20px_rgba(94,106,210,0.1)] transition-all duration-300 placeholder-[rgba(255,255,255,0.60)] text-[#EDEDEF] font-['Inter']"
              />
            </div>

            {/* UPLOAD BUTTON (CUSTOM UI) */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-[#8A8F98] uppercase tracking-widest font-mono">Thêm ảnh mới (tùy chọn)</label>

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
                className="cursor-pointer inline-block bg-white/[0.05] backdrop-blur-xl border border-white/[0.06] hover:border-white/[0.10] px-4 py-3 rounded-lg text-center transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] font-['Inter'] text-[#EDEDEF] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
              >
                📁 Thêm ảnh tác phẩm
              </label>

              <p className="text-xs text-[#8A8F98] flex items-center gap-2 font-['Inter']">
                <span>💡</span>
                <span>Các ảnh hiện tại sẽ được giữ lại</span>
              </p>
            </div>

            {/* PREVIEW */}
            {updateFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#8A8F98] uppercase tracking-widest font-mono">Ảnh mới ({updateFiles.length} ảnh)</p>
                <div className="grid grid-cols-4 gap-2">
                  {updateFiles.map((file: File, i: number) => (
                    <div key={i} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        className="h-20 w-full object-cover rounded-lg border border-white/[0.06] transition-all duration-300 group-hover:border-[#5E6AD2]/50 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050506]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => updateProduct(editingProduct.id)}
                disabled={loading}
                className="flex-1 bg-[#5E6AD2] px-6 py-3 rounded-lg font-medium text-white font-['Inter'] shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-[#6872D9] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_8px_40px_rgba(94,106,210,0.4),inset_0_1px_0_0_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98] relative overflow-hidden group flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span className="relative z-10">✨ Cập nhật</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </>
                )}
              </button>
              <button
                onClick={closeForms}
                className="px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.05] text-[#EDEDEF] font-['Inter'] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.08] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98]"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* LIST */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-lg bg-[#5E6AD2] flex items-center justify-center shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
              <span className="text-white font-bold">📦</span>
            </div>
            <h2 className="font-['Inter'] font-semibold text-lg bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">Danh sách tác phẩm ({products.length})</h2>
          </div>

          {/* Mobile-optimized product list */}
          <div className="space-y-3 sm:space-y-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.08] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]"
              >
                {/* Mobile: Vertical layout */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex gap-3 items-start">
                    {p.images?.[0]?.url ? (
                      <div className="relative group flex-shrink-0">
                        <img
                          src={p.images[0].url}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-white/[0.06] transition-all duration-300 group-hover:border-[#5E6AD2]/50 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050506]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/[0.05] rounded-lg flex items-center justify-center text-xs border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] flex-shrink-0">
                        📷
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#EDEDEF] font-['Inter'] text-sm sm:text-base truncate">{p.name}</p>
                      <p className="text-xs text-[#8A8F98] font-mono mt-1">
                        {p.images?.length || 0} ảnh
                      </p>
                    </div>
                  </div>

                  {/* Mobile: Stacked buttons */}
                  <div className="flex flex-row sm:flex-col gap-2">
                    <button
                      onClick={() => openUpdateForm(p)}
                      className="bg-[#5E6AD2] px-3 py-1.5 sm:px-3 sm:py-2 rounded-lg font-medium text-white font-['Inter'] text-xs sm:text-sm shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-[#6872D9] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_8px_40px_rgba(94,106,210,0.4),inset_0_1px_0_0_rgba(255,255,255,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98] relative overflow-hidden group flex items-center justify-center gap-1"
                    >
                      <span className="relative z-10">📝</span>
                      <span className="relative z-10 hidden sm:inline">Chỉnh sửa</span>
                    </button>

                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="border border-white/[0.06] bg-white/[0.05] px-3 py-1.5 sm:px-3 sm:py-2 rounded-lg font-medium text-[#EDEDEF] font-['Inter'] text-xs sm:text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.08] hover:translate-y-[-2px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] active:scale-[0.98] flex items-center justify-center gap-1"
                    >
                      <span>🗑</span>
                      <span className="hidden sm:inline">Xoá</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
