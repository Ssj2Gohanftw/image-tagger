export interface VisionTag {
  name: string;
  confidence: number;
}

export interface VisionApiResponse {
  tags?: VisionTag[];
  description?: {
    captions?: Array<{ text: string; confidence: number }>;
  };
}

export interface TagsResult {
  tags: VisionTag[];
  topTag: string | null;
  caption: string | null;
}
