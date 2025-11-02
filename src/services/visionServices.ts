import type { TagsResult, VisionApiResponse, VisionTag } from "../app/types/vision_types";

const endpoint = process.env.AZURE_ENDPOINT;
const apiKey = process.env.AZURE_KEY;

if (!endpoint) {
  console.warn("AZURE_ENDPOINT is not set. Vision analysis will be skipped.");
}
if (!apiKey) {
  console.warn("AZURE_KEY is not set. Vision analysis will be skipped.");
}

export async function analyzeImageBuffer(buffer: Buffer): Promise<TagsResult | null> {
  if (!endpoint || !apiKey) return null;

  try {
    const url = new URL("/vision/v3.2/analyze", endpoint).toString();

    const res = await fetch(`${url}?visualFeatures=Tags,Description`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-Type": "application/octet-stream",
      },
      body: new Uint8Array(buffer),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Vision analyze failed: ${res.status} ${res.statusText} ${text}`);
    }

  const json = (await res.json()) as VisionApiResponse;
  const tags: VisionTag[] = (json.tags ?? []).map((t: VisionTag) => ({ name: t.name, confidence: t.confidence }));
  const topTag = tags.sort((a, b) => b.confidence - a.confidence)[0]?.name ?? null;
    const caption = json.description?.captions?.sort(
      (a: { text: string; confidence: number }, b: { text: string; confidence: number }) =>
        b.confidence - a.confidence
    )[0]?.text ?? null;

  return { tags, topTag, caption };
  } catch (err) {
    console.error("Azure Vision error:", err);
    return null;
  }
}
