import crypto from "crypto";

const cloudName = process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY;
const apiSecret =
  process.env.CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET;

function getCloudinaryConfig() {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary environment variables.");
  }

  return { cloudName, apiKey, apiSecret };
}

export function extractPublicIdFromUrl(url: string) {
  const cleanUrl = url.split("?")[0];
  const match = cleanUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match?.[1] || null;
}

export async function destroyCloudinaryImage(publicId: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `invalidate=true&public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(`${paramsToSign}${apiSecret}`)
    .digest("hex");

  console.log("[Cloudinary Destroy] preparing request", {
    cloudName,
    publicId,
    timestamp,
    apiKeySuffix: apiKey.slice(-4),
  });

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("timestamp", String(timestamp));
  form.append("api_key", apiKey);
  form.append("signature", signature);
  form.append("invalidate", "true");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: "POST",
      body: form,
    }
  );

  const data = await res.json();
  const result = data?.result;

  console.log("[Cloudinary Destroy] response", {
    publicId,
    status: res.status,
    result,
    error: data?.error || null,
  });

  if (!res.ok || (result !== "ok" && result !== "not found")) {
    const message = data?.error?.message || data?.error || "Unknown error";
    throw new Error(`Cloudinary destroy failed for ${publicId}: ${message}`);
  }

  return data;
}