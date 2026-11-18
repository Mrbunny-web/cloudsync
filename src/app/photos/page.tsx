"use client";

import { AppShell } from "@/components/AppShell";
import { DriveView } from "@/components/DriveView";

export default function PhotosPage() {
  return (
    <AppShell>
      <DriveView scope="photos" />
    </AppShell>
  );
}
