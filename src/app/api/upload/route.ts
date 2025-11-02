import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";
import { analyzeImageBuffer } from "@/services/visionServices";
import { uploadToAzure } from "@/services/azureBlob";

function normalizeTagName(name: string) {
  const n = name.trim().toLowerCase();
  return n.endsWith("s") ? n.slice(0, -1) : n;
}

function pluralize(name: string) {
  const n = name.trim();
  const irregular: Record<string, string> = {
    person: "people",
    man: "men",
    woman: "women",
    child: "children",
    foot: "feet",
    tooth: "teeth",
    mouse: "mice",
  };
  const lower = n.toLowerCase();
  if (irregular[lower]) return irregular[lower];
  return lower.endsWith("s") ? lower : `${lower}s`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const file = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size too large" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 🔄 Upload directly to Azure Blob Storage instead of local filesystem
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${safeName}`;
    const publicUrl = await uploadToAzure(buffer, filename, file.type); // ✅ Azure upload

    // Analyze via Azure Vision
    const vision = await analyzeImageBuffer(buffer);
    const topTag = vision?.topTag ?? "general";
    const incomingTags = Array.isArray(vision?.tags) ? vision!.tags : [];
    const incomingTagNames = new Set(incomingTags.map((t) => normalizeTagName(t.name)));

    // Find or create gallery for this user
    const userGalleries = await prisma.gallery.findMany({
      where: { userId: session.user.id },
      select: { id: true, title: true, tags: true },
    });

    let best: { galleryId: string; score: number } | null = null;
    const normTop = normalizeTagName(topTag);

    for (const g of userGalleries) {
      const gTagsRaw = (g as unknown as { tags?: Array<{ name: string; confidence: number }> }).tags;
      const gTagNames = new Set(
        (Array.isArray(gTagsRaw) ? gTagsRaw : []).map((t) => normalizeTagName(t.name))
      );
      let score = 0;
      for (const n of incomingTagNames) if (gTagNames.has(n)) score++;
      const titleNorm = normalizeTagName(g.title);
      if (titleNorm === normTop) score += 2;
      if (!best || score > best.score) best = { galleryId: g.id, score };
    }

    let gallery = best && best.score >= 2
      ? await prisma.gallery.findUnique({ where: { id: best.galleryId } })
      : null;

    if (!gallery) {
      gallery = await prisma.gallery.create({
        data: {
          title: pluralize(topTag),
          description: `Auto album for tag: ${topTag}`,
          tags: (vision?.tags as unknown as Prisma.InputJsonValue) ?? undefined,
          userId: session.user.id,
        },
      });
    } else if (vision?.tags) {
      const existingRaw = (gallery as unknown as { tags?: Array<{ name: string; confidence: number }> }).tags;
      const existing = Array.isArray(existingRaw) ? existingRaw : [];
      const merged = mergeTags(existing, vision.tags);
      await prisma.gallery.update({
        where: { id: gallery.id },
        data: { tags: merged },
      });
    }

    const image = await prisma.image.create({
      data: {
        url: publicUrl,
        filename: file.name,
        altText: file.name,
        description: vision?.caption ?? null,
        tags: (vision?.tags as unknown as Prisma.InputJsonValue) ?? undefined,
        galleryId: gallery.id,
      },
    });

    const gWithCover = gallery as typeof gallery & { coverImageId?: string | null };
    if (!gWithCover.coverImageId) {
      try {
        await prisma.gallery.update({
          where: { id: gallery.id },
          data: { coverImageId: image.id },
        });
      } catch (e) {
        console.warn("Failed to set cover image:", e);
      }
    }

    await prisma.gallery.update({ where: { id: gallery.id }, data: { updatedAt: new Date() } });

    return NextResponse.json({
      success: true,
      albumId: gallery.id,
      image: { id: image.id, url: image.url, filename: image.filename },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

function mergeTags(
  existing: Array<{ name: string; confidence: number }>,
  incoming: Array<{ name: string; confidence: number }>
) {
  const map = new Map<string, number>();
  for (const t of existing)
    map.set(t.name, Math.max(map.get(t.name) ?? 0, t.confidence));
  for (const t of incoming)
    map.set(t.name, Math.max(map.get(t.name) ?? 0, t.confidence));
  return Array.from(map.entries()).map(([name, confidence]) => ({ name, confidence }));
}
