import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Expandable,
  ExpandableCard,
  ExpandableCardContent,
  ExpandableCardFooter,
  ExpandableCardHeader,
  ExpandableContent,
  ExpandableTrigger,
} from "@/components/ui/expandable";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
type VisionTag = { name: string; confidence: number };

export interface AlbumCardProps {
  id: string;
  title: string;
  coverImageUrl: string | null;
  imageCount: number;
  tags?: VisionTag[];
  className?: string;
}

export const GalleryCards = ({
  id,
  title,
  coverImageUrl,
  imageCount,
  tags = [],
  className,
}: AlbumCardProps) => {
  const cover = coverImageUrl ?? "/vercel.svg";

  return (
    <Expandable className={cn("w-full", className)}>
      <ExpandableCard
        collapsedSize={{ width: 320, height: 260 }}
        expandedSize={{ width: 360 }}
      >
        <ExpandableCardHeader>
          <div className="flex w-full items-center justify-between">
            <div className="flex min-w-0 flex-col">
              <h3 className="truncate text-base font-semibold first-letter:capitalize">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {imageCount} {imageCount === 1 ? "image" : "images"}
              </p>
            </div>
            <ExpandableTrigger>
              <Button size="sm" variant="outline">
                <InfoIcon />
              </Button>
            </ExpandableTrigger>
          </div>
        </ExpandableCardHeader>
        <ExpandableCardContent>
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
            <Image
              src={cover}
              alt={title}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
          <ExpandableContent preset="slide-up">
            <div className="mt-4 space-y-3">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 6).map((t) => (
                    <span
                      key={t.name}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">
                  Auto-tagged album
                </span>
                <Button asChild size="sm">
                  <Link href={`/gallery/${id}`}>Open album</Link>
                </Button>
              </div>
            </div>
          </ExpandableContent>
        </ExpandableCardContent>
        <ExpandableCardFooter />
      </ExpandableCard>
    </Expandable>
  );
};
