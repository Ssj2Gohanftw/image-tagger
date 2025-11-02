import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const galleries = await prisma.gallery.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        images: { orderBy: { taggedAt: "asc" }, take: 1 },
        _count: { select: { images: true } },
      },
    });

    // Resolve explicit cover images in a single batch
    const coverIds = galleries
      .map(
        (g) => (g as unknown as { coverImageId?: string | null }).coverImageId
      )
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    const coverImages = coverIds.length
      ? await prisma.image.findMany({
          where: { id: { in: coverIds } },
          select: { id: true, url: true },
        })
      : [];
    const coverMap = new Map(coverImages.map((ci) => [ci.id, ci.url] as const));

    const albums = galleries.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      // Prefer explicit cover image if set, else fallback to first image
      coverImageUrl:
        coverMap.get(
          (g as unknown as { coverImageId?: string | null }).coverImageId ?? ""
        ) ??
        g.images[0]?.url ??
        null,
      imageCount:
        (g as unknown as { _count?: { images?: number } })._count?.images ?? 0,
      tags:
        (g as unknown as { tags?: Array<{ name: string; confidence: number }> })
          .tags ?? [],
    }));

    return NextResponse.json({ albums });
  } catch (error) {
    console.error("Albums fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}
