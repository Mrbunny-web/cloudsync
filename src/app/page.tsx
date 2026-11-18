import Link from "next/link";
import {
  ArrowRight,
  Eye,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Laptop,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { FileGlyph } from "@/components/ui/FileGlyph";
import { SHOWCASE_FILES } from "@/lib/cloud/seed";
import { formatBytes } from "@/lib/format";

const library = [
  { label: "Photos", mime: "image/jpeg" },
  { label: "Documents", mime: "application/pdf" },
  { label: "Videos", mime: "video/mp4" },
  { label: "Audio", mime: "audio/mp4" },
  { label: "Everything else", mime: null },
];

function FileShelf() {
  return (
    <div className="rise" style={{ animationDelay: "120ms" }}>
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-lift sm:p-5">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-[13px] font-medium text-ink">My Drive</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-3">
              <span className="relative flex size-1.5" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-1.5 rounded-full bg-success" />
              </span>
              Synced just now
            </p>
          </div>
          <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-2">
            {SHOWCASE_FILES.length} items
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {SHOWCASE_FILES.map((file, index) => (
            <div
              key={file.id}
              className="rise rounded-xl border border-line bg-surface-2/60 p-3"
              style={{ animationDelay: `${180 + index * 55}ms` }}
            >
              <span className="grid size-8 place-items-center rounded-lg bg-surface text-ink-2 shadow-soft">
                <FileGlyph mimeType={file.mimeType} className="size-4" />
              </span>
              <p className="mt-2.5 truncate text-[12px] font-medium text-ink">{file.name}</p>
              <p className="mt-0.5 text-[10px] tabular-nums text-ink-3">{formatBytes(file.size)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line px-1 pt-3">
          <p className="text-[11px] text-ink-3">Drag, drop, done.</p>
          <div className="flex items-center gap-2 text-ink-3">
            <Laptop className="size-4" aria-hidden="true" />
            <Smartphone className="size-4" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-40">
        <div className="glass border-b border-line">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
            <Logo />
            <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
              <a
                href="#why"
                className="rounded-lg px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                Why CloudSync
              </a>
              <a
                href="#privacy"
                className="rounded-lg px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                Privacy
              </a>
            </nav>
            <ButtonLink href="/dashboard" size="sm">
              Open app
            </ButtonLink>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-24">
          <div className="rise">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-medium text-ink-2">
              <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
              Private by default
            </p>
            <h1 className="mt-5 text-[clamp(2.9rem,7vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-ink">
              Every file,
              <br />
              in one calm place.
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-2">
              A private home for photos, documents and everything in between.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/dashboard" size="lg">
                Open CloudSync
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#why" variant="secondary" size="lg">
                How it works
              </ButtonLink>
            </div>
            <p className="mt-4 text-[12px] text-ink-3">No install. Works in your browser, on every screen.</p>
          </div>

          <FileShelf />
        </section>

        <section id="why" className="border-y border-line bg-surface/60">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-24">
            <div>
              <h2 className="text-[clamp(1.9rem,3.6vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
                Made for the way you actually find things.
              </h2>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-2">
                Search first, folders second. CloudSync keeps the shelf tidy without asking you to
                maintain it.
              </p>
            </div>

            <ul className="divide-y divide-line border-t border-line">
              <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 py-6">
                <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Search className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[15px] font-medium text-ink">Search that keeps up</h3>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-2">
                    Start typing a name and the list narrows as you go. Press the slash key anywhere
                    in the app.
                  </p>
                </div>
              </li>
              <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 py-6">
                <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Sparkles className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[15px] font-medium text-ink">Files sort themselves</h3>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-2">
                    Photos, documents, video and audio each get a shelf, so the right file is one
                    click away.
                  </p>
                </div>
              </li>
              <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 py-6">
                <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Smartphone className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[15px] font-medium text-ink">One layout, any screen</h3>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-2">
                    A grid on your desktop, a stack on your phone. The controls stay where your
                    hands expect them.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="text-[13px] text-ink-3">One shelf for every kind of file</p>
          <ul className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4">
            {library.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5 text-ink-2">
                <FileGlyph mimeType={item.mime} className="size-4 text-ink-3" />
                <span className="text-sm">{item.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="privacy" className="relative overflow-hidden bg-ink text-canvas">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-40 size-[28rem] rounded-full bg-accent/15 blur-3xl"
          />
          <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <h2 className="text-[clamp(1.9rem,3.6vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                  Private by default.
                </h2>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed opacity-75">
                  Your files are yours. No scanning, no ads, no sharing you did not ask for.
                </p>
              </div>
              <ul className="grid gap-6 sm:grid-cols-3">
                <li>
                  <ShieldCheck className="size-5 opacity-80" aria-hidden="true" />
                  <h3 className="mt-3 text-[14px] font-medium">Row-level security</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed opacity-70">
                    Each record is locked to your account at the database level.
                  </p>
                </li>
                <li>
                  <LockKeyhole className="size-5 opacity-80" aria-hidden="true" />
                  <h3 className="mt-3 text-[14px] font-medium">Private buckets</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed opacity-70">
                    Downloads use short-lived signed links, never public URLs.
                  </p>
                </li>
                <li>
                  <Eye className="size-5 opacity-80" aria-hidden="true" />
                  <h3 className="mt-3 text-[14px] font-medium">No scanning</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed opacity-70">
                    The app reads a file only when you open or download it.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="grid gap-8 rounded-3xl border border-line bg-surface p-8 shadow-soft sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-[clamp(1.7rem,3vw,2.35rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink">
                Start with 10 GB of quiet.
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-2">
                Open the drive, drop in a file and see how it feels. No credit card, no setup.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/auth/register" size="lg">
                Create an account
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/auth/signin" variant="secondary" size="lg">
                Sign in
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Logo />
            <nav aria-label="Footer" className="flex flex-wrap items-center gap-5 text-[13px] text-ink-2">
              <a href="#why" className="hover:text-ink">
                Why CloudSync
              </a>
              <a href="#privacy" className="hover:text-ink">
                Privacy
              </a>
              <Link href="/dashboard" className="hover:text-ink">
                Open app
              </Link>
            </nav>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-6 text-[11px] text-ink-3">
            <p>© 2026 CloudSync.</p>
            <p>Built with Next.js and Supabase. Demo mode keeps files in this browser.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
