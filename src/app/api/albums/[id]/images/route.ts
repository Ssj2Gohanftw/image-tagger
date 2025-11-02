import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;

    const gallery = await prisma.gallery.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!gallery)
      return NextResponse.json({ error: "Album not found" }, { status: 404 });

    const images = await prisma.image.findMany({
      where: { galleryId: id },
      orderBy: { taggedAt: "desc" },
      select: {
        id: true,
        url: true,
        filename: true,
        altText: true,
        description: true,
        tags: true,
      },
    });

    return NextResponse.json({
      album: {
        id: gallery.id,
        title: gallery.title,
        description: gallery.description,
      },
      images,
    });
  } catch (error) {
    console.error("Album images fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
