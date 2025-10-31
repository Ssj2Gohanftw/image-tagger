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
import { GalleryVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const GalleryPage = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
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
    <section className="">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <GalleryVertical />
          </EmptyMedia>
          <EmptyTitle>No Images in the Gallery... For Now</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t uploaded any images yet. Get started by uploading
            images to the gallery
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <ImageUploadBtn />
        </EmptyContent>
      </Empty>
      <div className="grid grid-cols-2 gap-2 place-items-center ">
        <GalleryCards />
      </div>
    </section>
  );
};
export default GalleryPage;
