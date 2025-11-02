"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ImageCard } from "@/components/image-card";

type VisionTag = { name: string; confidence: number };
type GalleryImage = {
  id: string;
  url: string;
  filename: string;
  altText?: string | null;
  description?: string | null;
  tags?: VisionTag[] | null;
};

export default function AlbumPage() {
  const params = useParams<{ id: string }>();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [albumTitle, setAlbumTitle] = useState<string>("Album");
  const [images, setImages] = useState<GalleryImage[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [isPending, session, router]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/albums/${params.id}/images`);
        if (res.ok) {
          const data = await res.json();
          setImages(data.images || []);
          if (data.album?.title) setAlbumTitle(data.album.title as string);
        }
      } finally {
        setLoading(false);
      }
    };
    if (session) load();
  }, [params.id, session]);

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!session) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold capitalize">{albumTitle}</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/gallery">Back to Albums</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((img) => (
          <ImageCard
            key={img.id}
            url={img.url}
            filename={img.filename}
            altText={img.altText}
            description={img.description}
            tags={img.tags ?? []}
          />
        ))}
      </div>
    </section>
  );
}
