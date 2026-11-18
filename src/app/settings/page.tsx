"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useCloud } from "@/lib/cloud/provider";
import { formatBytes } from "@/lib/format";

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3";

export default function SettingsPage() {
  const { user, profile, storageUsed, mode, updateProfile, signOut } = useCloud();
  const router = useRouter();
  const [name, setName] = useState(profile.fullName);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const percent = Math.min(100, Math.round((storageUsed / Math.max(profile.storageLimit, 1)) * 100));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    const result = await updateProfile(name);
    setSaving(false);
    setFeedback(
      result.error ? { kind: "err", text: result.error } : { kind: "ok", text: "Changes saved." },
    );
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <header>
          <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-ink sm:text-[30px]">Settings</h1>
          <p className="mt-1 text-sm text-ink-2">Your profile, storage and connection.</p>
        </header>

        <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[15px] font-semibold text-ink">Profile</h2>
          <form onSubmit={save} className="mt-4 space-y-4">
            <div>
              <label htmlFor="full-name" className="mb-1.5 block text-[13px] font-medium text-ink">
                Name
              </label>
              <input
                id="full-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="account-email" className="mb-1.5 block text-[13px] font-medium text-ink">
                Email
              </label>
              <input
                id="account-email"
                value={user?.email ?? ""}
                readOnly
                className={`${inputClass} text-ink-2`}
              />
              <p className="mt-1.5 text-[11px] text-ink-3">Your sign-in email can’t be changed here.</p>
            </div>

            {feedback ? (
              <p
                role={feedback.kind === "err" ? "alert" : "status"}
                className={`rounded-xl px-3 py-2 text-[12px] ${
                  feedback.kind === "err" ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent"
                }`}
              >
                {feedback.text}
              </p>
            ) : null}

            <Button type="submit" disabled={saving}>
              {saving ? <Spinner className="size-4" /> : null}
              Save changes
            </Button>
          </form>
        </section>

        <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[15px] font-semibold text-ink">Storage</h2>
          <div className="mt-4 flex items-baseline justify-between gap-3">
            <p className="text-sm text-ink-2">
              <span className="font-medium text-ink">{formatBytes(storageUsed)}</span> of{" "}
              {formatBytes(profile.storageLimit)} used
            </p>
            <span className="text-[12px] tabular-nums text-ink-3">{percent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.max(percent, storageUsed > 0 ? 2 : 0)}%` }}
            />
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[15px] font-semibold text-ink">Connection</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            {mode === "demo"
              ? "Demo mode is on. Files and account data live in this browser only. Add Supabase keys to .env.local to switch to real cloud storage."
              : "Connected to Supabase. Files are stored in your private bucket and protected by row-level security."}
          </p>
          <span className="mt-3 inline-flex rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-ink-2">
            {mode === "demo" ? "Demo mode" : "Supabase"}
          </span>
        </section>

        <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[15px] font-semibold text-ink">Account</h2>
          <p className="mt-2 text-sm text-ink-2">Signing out keeps your files in place.</p>
          <Button
            variant="danger"
            className="mt-4"
            onClick={async () => {
              await signOut();
              router.replace("/");
            }}
          >
            Sign out
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
