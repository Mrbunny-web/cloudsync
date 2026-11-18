"use client";

import { AppShell } from "@/components/AppShell";
import { DriveView } from "@/components/DriveView";

export default function AudioPage() {
  return (
    <AppShell>
      <DriveView scope="audio" />
    </AppShell>
  );
}
