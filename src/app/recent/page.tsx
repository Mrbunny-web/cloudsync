"use client";

import { AppShell } from "@/components/AppShell";
import { DriveView } from "@/components/DriveView";

export default function RecentPage() {
  return (
    <AppShell>
      <DriveView scope="recent" />
    </AppShell>
  );
}
