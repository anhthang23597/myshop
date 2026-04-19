import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  if (!isAdminSession(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productIds } = body;

  if (!productIds || !Array.isArray(productIds)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    // Update order for each product
    const updates = productIds.map((id: string, index: number) =>
      prisma.product.update({
        where: { id },
        data: { order: index },
      })
    );

    await Promise.all(updates);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error reordering products:", error);
    return Response.json({ error: "Failed to reorder products" }, { status: 500 });
  }
}
