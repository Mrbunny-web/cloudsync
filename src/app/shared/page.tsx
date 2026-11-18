"use client";

import { AppShell } from "@/components/AppShell";
import { DriveView } from "@/components/DriveView";

export default function SharedPage() {
  return (
    <AppShell>
      <DriveView scope="shared" />
    </AppShell>
  );
}
