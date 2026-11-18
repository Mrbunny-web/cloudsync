"use client";

import { AppShell } from "@/components/AppShell";
import { DriveView } from "@/components/DriveView";

export default function VideosPage() {
  return (
    <AppShell>
      <DriveView scope="videos" />
    </AppShell>
  );
}
