"use client";
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
import { InfoIcon } from "lucide-react";
export type VisionTag = { name: string; confidence: number };

export interface ImageCardProps {
  url: string;
  filename: string;
  altText?: string | null;
  description?: string | null;
  tags?: VisionTag[] | null;
}

export function ImageCard({
  url,
  filename,
  altText,
  description,
  tags,
}: ImageCardProps) {
  return (
    <Expandable className="w-full">
      <ExpandableCard collapsedSize={{ width: 300, height: 320 }}>
        <ExpandableCardHeader>
          <div className="flex w-full items-center justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{filename}</h3>
            </div>
            <ExpandableTrigger>
              <Button size="sm" variant="outline">
                <InfoIcon />
              </Button>
            </ExpandableTrigger>
          </div>
        </ExpandableCardHeader>
        <ExpandableCardContent>
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
            <Image
              src={url}
              alt={altText ?? filename}
              fill
              className="object-cover"
            />
          </div>
          <ExpandableContent preset="slide-up">
            <div className="mt-3 space-y-3">
              {description && (
                <p className="text-sm text-muted-foreground first-letter:capitalize">
                  {description}
                </p>
              )}
              {Array.isArray(tags) && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 8).map((t) => (
                    <span
                      key={t.name}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-end gap-2 p-3.5">
                <Button asChild size="sm" variant="secondary">
                  <Link href={url} target="_blank" rel="noopener noreferrer">
                    View
                  </Link>
                </Button>
              </div>
            </div>
          </ExpandableContent>
        </ExpandableCardContent>
        <ExpandableCardFooter />
      </ExpandableCard>
    </Expandable>
  );
}
