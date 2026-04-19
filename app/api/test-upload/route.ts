import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("===== TEST UPLOAD START =====");
  
  try {
    // Log request info
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // Check session
    const cookieHeader = req.headers.get("cookie") || "";
    console.log("Cookie header:", cookieHeader);
    
    // Parse form data
    const formData = await req.formData();
    console.log("FormData entries count:", formData.entries.length);
    
    const file = formData.get("file");
    console.log("File received:", file);
    
    if (file instanceof File) {
      console.log("File details:", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      // Return success without actually uploading
      return Response.json({
        success: true,
        message: "Test upload successful",
        file: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      });
    } else {
      return Response.json({
        error: "No valid file received",
        received: file
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error("Test upload error:", error);
    return Response.json({
      error: "Test upload failed",
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
