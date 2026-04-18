import { isAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  if (!isAdminSession(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("===== UPLOAD START =====");

  try {
    console.log("1. Reading formData...");

    const formData = await req.formData();

    const file = formData.get("file");

    console.log("2. File received:", file);
    console.log("3. File type:", file?.constructor?.name);

    if (!file) {
      console.log("❌ NO FILE");
      return Response.json({ error: "No file" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      console.log("❌ INVALID FILE TYPE");
      return Response.json({ error: "Invalid file" }, { status: 400 });
    }

    console.log("4. Preparing Cloudinary request...");

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "my_shop_upload");

    console.log("5. Upload preset:", "my_shop_upload");
    console.log("6. Cloud name URL:",
      "https://api.cloudinary.com/v1_1/dx4zaeff5/image/upload"
    );

    console.log("7. Sending request to Cloudinary...");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dx4zaeff5/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    console.log("8. Cloudinary response status:", res.status);

    const json = await res.json();

    console.log("9. Cloudinary raw response:");
    console.log(JSON.stringify(json, null, 2));

    if (!res.ok) {
      console.log("❌ CLOUDINARY FAILED");
      return Response.json(
        {
          error: "Cloudinary failed",
          status: res.status,
          detail: json,
        },
        { status: 500 }
      );
    }

    console.log("10. SUCCESS URL:", json.secure_url || json.url);

    console.log("===== UPLOAD END SUCCESS =====");

    return Response.json({
      url: json.secure_url || json.url,
      publicId: json.public_id || null,
    });
  } catch (err: any) {
    console.log("===== UPLOAD CRASH =====");
    console.log("ERROR MESSAGE:", err?.message);
    console.log("STACK:", err?.stack);

    return Response.json(
      {
        error: "Server crash",
        message: err?.message,
      },
      { status: 500 }
    );
  }
}