import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

  const products = await prisma.product.findMany({
    include: { images: true },
    take: limit,
  });

  return Response.json(products);
}

export async function POST(req: Request) {
  if (!isAdminSession(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, price, images } = body;

  const product = await prisma.product.create({
    data: {
      name,
      price,
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