"use client";

import { CloudProvider } from "@/lib/cloud/provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <CloudProvider>{children}</CloudProvider>;
}
