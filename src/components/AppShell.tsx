"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  AudioLines,
  ChevronsUpDown,
  Clock,
  File,
  FileText,
  HardDrive,
  House,
  Image,
  LogOut,
  Menu,
  Settings,
  Star,
  Trash,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useCloud } from "@/lib/cloud/provider";
import { formatBytes, initials } from "@/lib/format";
import type { CloudFile } from "@/lib/cloud/types";

const isImage = (file: CloudFile) => Boolean(file.mimeType?.startsWith("image/"));
const isVideo = (file: CloudFile) => Boolean(file.mimeType?.startsWith("video/"));
const isAudio = (file: CloudFile) => Boolean(file.mimeType?.startsWith("audio/"));
const isDoc = (file: CloudFile) =>
  Boolean(
    file.mimeType &&
      (/^text\//.test(file.mimeType) ||
        /(pdf|document|sheet|presentation|word|excel|powerpoint)/i.test(file.mimeType)),
  );

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
};

function navCounts(files: CloudFile[]) {
  const live = files.filter((file) => !file.deletedAt);
  return {
    drive: live.length,
    recent: live.length,
    starred: live.filter((file) => file.starred).length,
    shared: 0,
    trash: files.filter((file) => file.deletedAt).length,
    photos: live.filter(isImage).length,
    documents: live.filter(isDoc).length,
    videos: live.filter(isVideo).length,
    audio: live.filter(isAudio).length,
    other: live.filter((file) => !isImage(file) && !isVideo(file) && !isAudio(file) && !isDoc(file)).length,
  };
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, profile, files, storageUsed, signOut } = useCloud();
  const pathname = usePathname();
  const router = useRouter();
  const counts = navCounts(files);

  const primary: NavItem[] = [
    { href: "/dashboard", label: "My Drive", icon: House, count: counts.drive },
    { href: "/recent", label: "Recent", icon: Clock },
    { href: "/starred", label: "Starred", icon: Star, count: counts.starred },
    { href: "/shared", label: "Shared", icon: Users },
    { href: "/trash", label: "Trash", icon: Trash, count: counts.trash },
  ];

  const library: NavItem[] = [
    { href: "/photos", label: "Photos", icon: Image, count: counts.photos },
    { href: "/documents", label: "Documents", icon: FileText, count: counts.documents },
    { href: "/videos", label: "Videos", icon: Video, count: counts.videos },
    { href: "/audio", label: "Audio", icon: AudioLines, count: counts.audio },
    { href: "/other", label: "Other", icon: File, count: counts.other },
  ];

  const percent = Math.min(100, Math.round((storageUsed / Math.max(profile.storageLimit, 1)) * 100));

  const renderItem = (item: NavItem) => {
    const active = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
        className={`press flex h-10 items-center gap-3 rounded-xl px-3 text-sm ${
          active
            ? "bg-accent-soft font-medium text-accent"
            : "text-ink-2 hover:bg-surface-2 hover:text-ink"
        }`}
      >
        <Icon className="size-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {item.count ? <span className="text-xs tabular-nums text-ink-3">{item.count}</span> : null}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-4 pb-4 pt-5 fine-scroll">
      <div className="flex items-center justify-between px-1">
        <Logo />
        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            className="press grid size-9 place-items-center rounded-full text-ink-2 hover:bg-surface-2"
            aria-label="Close menu"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2.5">
        <span className="grid size-7 place-items-center rounded-lg bg-surface-2 text-ink-2">
          <HardDrive className="size-3.5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-ink">Personal</span>
          <span className="block truncate text-[11px] text-ink-3">
            {formatBytes(profile.storageLimit)} plan
          </span>
        </span>
      </div>

      <nav aria-label="Workspace" className="space-y-1">
        {primary.map(renderItem)}
      </nav>

      <div>
        <p className="mb-2 px-3 text-[11px] font-medium text-ink-3">Library</p>
        <nav aria-label="Library" className="space-y-1">
          {library.map(renderItem)}
        </nav>
      </div>

      <div className="mt-auto space-y-3">
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[12px] font-medium text-ink">Storage</span>
            <span className="text-[11px] tabular-nums text-ink-3">{percent}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.max(percent, storageUsed > 0 ? 2 : 0)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-ink-3">
            {formatBytes(storageUsed)} of {formatBytes(profile.storageLimit)}
          </p>
        </div>

        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-xl p-1.5 hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
              {initials(profile.fullName, user?.email ?? "")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-ink">
                {profile.fullName || user?.name || "You"}
              </span>
              <span className="block truncate text-[11px] text-ink-3">{user?.email}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
          </summary>
          <div className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-lift">
            <Link
              href="/profile"
              onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 hover:bg-surface-2 hover:text-ink"
            >
              <User className="size-4" aria-hidden="true" /> Profile
            </Link>
            <Link
              href="/settings"
              onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 hover:bg-surface-2 hover:text-ink"
            >
              <Settings className="size-4" aria-hidden="true" /> Settings
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.replace("/");
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-danger hover:bg-danger-soft"
            >
              <LogOut className="size-4" aria-hidden="true" /> Sign out
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[272px_minmax(0,1fr)]">
      <div className="hidden border-r border-line p-5 lg:block">
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="mt-7 space-y-2">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="skeleton h-10 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="p-6 lg:p-10">
        <div className="skeleton h-9 w-56 rounded-lg" />
        <div className="mt-3 skeleton h-4 w-80 rounded" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="skeleton h-44 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const { ready, user } = useCloud();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/auth/signin?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, user, pathname, router]);

  if (!ready || !user) return <LoadingShell />;

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
      <aside className="chrome hidden border-r border-line lg:sticky lg:top-0 lg:block lg:h-svh">
        <SidebarContent />
      </aside>

      <div className="min-w-0">
        <div className="glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line px-4 lg:hidden">
          <Logo />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="press grid size-10 place-items-center rounded-xl text-ink-2 hover:bg-surface-2"
            aria-label="Open menu"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>

        <main className="mx-auto w-full max-w-[1440px] px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-10">{children}</main>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div
            className="fade absolute inset-0"
            style={{ background: "var(--c-scrim)" }}
            onMouseDown={() => setMenuOpen(false)}
          />
          <div className="pop absolute inset-y-0 left-0 w-[284px] border-r border-line bg-surface">
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
