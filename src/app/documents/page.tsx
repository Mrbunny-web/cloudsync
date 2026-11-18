"use client";

import { AppShell } from "@/components/AppShell";
import { DriveView } from "@/components/DriveView";

export default function DocumentsPage() {
  return (
    <AppShell>
      <DriveView scope="documents" />
    </AppShell>
  );
}
