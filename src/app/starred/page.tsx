"use client";

import { AppShell } from "@/components/AppShell";
import { DriveView } from "@/components/DriveView";

export default function StarredPage() {
  return (
    <AppShell>
      <DriveView scope="starred" />
    </AppShell>
  );
}
