import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/session";

export async function GET(req: Request) {
  // For now, return all products without limit
  // Can add limit back later if needed for performance
  const products = await prisma.product.findMany({
    include: { images: true },
    orderBy: { order: 'asc' },
  });

  return Response.json(products);
}

export async function POST(req: Request) {
  if (!isAdminSession(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, price, images } = body;

  // Increment all existing products' order by 1
  await prisma.product.updateMany({
    data: { order: { increment: 1 } },
  });

  // Create new product with order = 0 (at the beginning)
  const product = await prisma.product.create({
    data: {
      name,
      price,
      order: 0,
      images: {
        create: images.map((img: { url: string; publicId?: string | null }) => ({
          url: img.url,
          publicId: img.publicId ?? null,
        })),
      },
    },
    include: { images: true },
  });

  return Response.json(product);
}