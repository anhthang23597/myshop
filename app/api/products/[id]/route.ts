import {
  destroyCloudinaryImage,
  extractPublicIdFromUrl,
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/session";
import { NextRequest } from "next/server";

// GET 1 product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    return Response.json(product);
  } catch (err: any) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

// UPDATE product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminSession(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        price: Number(body.price),
      },
    });

    return Response.json(updated);
  } catch (err: any) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminSession(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    console.log("[Delete Product] start", { productId: id });

    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const publicIds = product.images
      .map(
        (img: { url: string; publicId: string | null }) =>
          img.publicId || extractPublicIdFromUrl(img.url)
      )
      .filter((value: string | null): value is string => Boolean(value));

    console.log("[Delete Product] images found", {
      productId: id,
      imageCount: product.images.length,
      publicIds,
    });

    const cloudinaryErrors: string[] = [];
    for (const publicId of publicIds) {
      try {
        await destroyCloudinaryImage(publicId);
      } catch (error: any) {
        cloudinaryErrors.push(
          `${publicId} (${error?.message || "Cloudinary delete error"})`
        );
      }
    }

    if (cloudinaryErrors.length > 0) {
      console.log("[Delete Product] cloudinary warnings", {
        productId: id,
        cloudinaryErrors,
      });
    }

    await prisma.image.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({
      where: { id },
    });

    console.log("[Delete Product] done", {
      productId: id,
      cloudinaryErrors: cloudinaryErrors.length,
    });

    return Response.json({
      ok: true,
      cloudinaryWarning:
        cloudinaryErrors.length > 0
          ? `Không xóa được ${cloudinaryErrors.length} ảnh trên Cloudinary: ${cloudinaryErrors.join(
              ", "
            )}`
          : null,
    });
  } catch (err: any) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}