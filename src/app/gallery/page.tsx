"use client";
import { GalleryCards } from "@/components/gallery-cards";
import { ImageUploadBtn } from "@/components/image-upload-btn";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";
import { Album } from "../types/album";
import { GalleryVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const GalleryPage = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlbums = async () => {
    try {
      const res = await fetch("/api/albums");
      if (res.ok) {
        const data = await res.json();
        setAlbums(data.albums || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) fetchAlbums();
  }, [session]);

  useEffect(() => {
    const handler = () => {
      setLoading(true);
      fetchAlbums();
    };
    window.addEventListener("albums:refresh", handler);
    return () => window.removeEventListener("albums:refresh", handler);
  }, []);

  if (isPending || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-8">
      {albums.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GalleryVertical />
            </EmptyMedia>
            <EmptyTitle>No albums yet</EmptyTitle>
            <EmptyDescription>
              Upload images to automatically create albums using Azure Vision
              tags.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <ImageUploadBtn />
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="mb-6">
            <ImageUploadBtn />
          </div>
          <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10">
            {albums.map((a) => (
              <GalleryCards
                key={a.id}
                id={a.id}
                title={a.title}
                coverImageUrl={a.coverImageUrl}
                imageCount={a.imageCount}
                tags={a.tags}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
export default GalleryPage;
