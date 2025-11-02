"use client";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "./kibo-ui/dropzone";
export const ImageUploadBtn = () => {
  const [files, setFiles] = useState<File[] | undefined>();
  const [uploading, setUploading] = useState(false);

  const handleDrop = async (incoming: File[]) => {
    setFiles(incoming);
    if (!incoming?.length) return;
    setUploading(true);
    try {
      for (const file of incoming) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          if (res.status === 401) {
            toast.error("Please sign in to upload images.");
          } else {
            toast.error(`Failed to upload ${file.name}`);
          }
          console.error("Upload failed:", res.status, msg);
          continue;
        }
        await res.json().catch(() => ({}) as unknown);
        toast.success(`${file.name} uploaded`);
      }
      // Notify listeners to refresh albums once uploads complete
      window.dispatchEvent(new CustomEvent("albums:refresh"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Dropzone
        accept={{ "image/*": [] }}
        maxFiles={10}
        maxSize={1024 * 1024 * 10}
        minSize={1024}
        onDrop={handleDrop}
        onError={console.error}
        src={files}
        className="cursor-pointer"
        disabled={uploading}
      >
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>
    </>
  );
};
