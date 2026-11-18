"use client";

import { AppShell } from "@/components/AppShell";
import { DriveView } from "@/components/DriveView";

export default function DashboardPage() {
  return (
    <AppShell>
      <DriveView scope="all" />
    </AppShell>
  );
}
