import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "CloudSync — Every file, in one calm place",
    template: "%s · CloudSync",
  },
  description:
    "A private home for photos, documents and everything in between. Works on every screen you use.",
  applicationName: "CloudSync",
  keywords: ["cloud storage", "file manager", "photos", "documents", "private drive"],
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    title: "CloudSync — Every file, in one calm place",
    description:
      "A private home for photos, documents and everything in between. Works on every screen you use.",
    siteName: "CloudSync",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CloudSync — Every file, in one calm place",
    description:
      "A private home for photos, documents and everything in between. Works on every screen you use.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
