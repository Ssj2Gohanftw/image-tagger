export type Album = {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl: string | null;
  imageCount: number;
  tags?: Array<{ name: string; confidence: number }>;
};
