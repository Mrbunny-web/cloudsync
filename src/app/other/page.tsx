"use client";

import { AppShell } from "@/components/AppShell";
import { DriveView } from "@/components/DriveView";

export default function OtherPage() {
  return (
    <AppShell>
      <DriveView scope="other" />
    </AppShell>
  );
}
