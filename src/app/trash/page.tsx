"use client";

import { AppShell } from "@/components/AppShell";
import { DriveView } from "@/components/DriveView";

export default function TrashPage() {
  return (
    <AppShell>
      <DriveView scope="trash" />
    </AppShell>
  );
}
