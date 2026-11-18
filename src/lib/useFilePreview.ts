"use client";

import { useEffect, useState } from "react";
import { useCloud } from "@/lib/cloud/provider";
import type { CloudFile } from "@/lib/cloud/types";

/**
 * Resolves a thumbnail URL for image files and revokes blob URLs on unmount.
 * The keyed result keeps an old preview from flashing while the next one loads.
 */
export function useFilePreview(file: CloudFile, enabled: boolean) {
  const { getPreviewUrl } = useCloud();
  const [preview, setPreview] = useState<{ key: string; url: string | null } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let created: string | null = null;

    void getPreviewUrl(file).then((next) => {
      if (cancelled) {
        if (next?.startsWith("blob:")) URL.revokeObjectURL(next);
        return;
      }
      created = next;
      setPreview({ key: file.id, url: next });
    });

    return () => {
      cancelled = true;
      if (created?.startsWith("blob:")) URL.revokeObjectURL(created);
    };
  }, [enabled, file, getPreviewUrl]);

  return enabled && preview?.key === file.id ? preview.url : null;
}
