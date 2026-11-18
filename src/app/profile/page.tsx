"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ButtonLink } from "@/components/ui/Button";
import { useCloud } from "@/lib/cloud/provider";
import { formatBytes, initials } from "@/lib/format";
import { kindFromMime } from "@/lib/files";

export default function ProfilePage() {
  const { user, profile, files, storageUsed, mode } = useCloud();

  const live = files.filter((file) => !file.deletedAt);
  const counts = {
    all: live.length,
    photos: live.filter((file) => kindFromMime(file.mimeType) === "image").length,
    starred: live.filter((file) => file.starred).length,
  };
  const percent = Math.min(100, Math.round((storageUsed / Math.max(profile.storageLimit, 1)) * 100));

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <header>
          <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-ink sm:text-[30px]">Profile</h1>
          <p className="mt-1 text-sm text-ink-2">How your account shows up in the app.</p>
        </header>

        <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent-soft text-lg font-semibold text-accent">
              {initials(profile.fullName, user?.email ?? "")}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold tracking-tight text-ink">
                {profile.fullName || user?.name || "You"}
              </h2>
              <p className="truncate text-[13px] text-ink-2">{user?.email}</p>
            </div>
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-ink-2">
              {mode === "demo" ? "Demo" : "Supabase"}
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5">
            <div>
              <dt className="text-[11px] text-ink-3">Files</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{counts.all}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-ink-3">Photos</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{counts.photos}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-ink-3">Starred</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{counts.starred}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-ink">Storage</h2>
            <span className="text-[12px] tabular-nums text-ink-3">{percent}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.max(percent, storageUsed > 0 ? 2 : 0)}%` }}
            />
          </div>
          <p className="mt-2 text-[12px] text-ink-3">
            {formatBytes(storageUsed)} of {formatBytes(profile.storageLimit)}
          </p>
        </section>

        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonLink href="/dashboard" variant="secondary">
            Open My Drive
          </ButtonLink>
          <Link
            href="/settings"
            className="press inline-flex h-11 items-center rounded-xl px-4 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink"
          >
            Edit settings
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
