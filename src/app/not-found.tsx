import Link from "next/link";
import { Compass, House } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center px-5 py-16 sm:px-8">
      <Logo />
      <p className="mt-12 font-mono text-[12px] tracking-[0.18em] text-ink-3">404</p>
      <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-ink">
        This page isn’t in the drive.
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-2">
        The link may be old, or the file may have moved. Your files are still where you left them.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/dashboard">
          <House className="size-4" aria-hidden="true" />
          Open My Drive
        </ButtonLink>
        <ButtonLink href="/" variant="secondary">
          <Compass className="size-4" aria-hidden="true" />
          Back home
        </ButtonLink>
      </div>
      <p className="mt-10 text-[12px] text-ink-3">
        Need help?{" "}
        <Link href="/settings" className="font-medium text-accent hover:underline">
          Check your settings
        </Link>
        .
      </p>
    </main>
  );
}
