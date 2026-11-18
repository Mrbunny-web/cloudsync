"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center px-5 py-16 sm:px-8">
      <span className="grid size-11 place-items-center rounded-2xl bg-danger-soft text-danger">
        <CircleAlert className="size-5" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-ink">
        Something didn’t load.
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-2">
        This part of the app hit an unexpected error. Your files are untouched — try again.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-[11px] text-ink-3">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-7 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="secondary" onClick={() => router.push("/dashboard")}>
          Go to My Drive
        </Button>
      </div>
    </main>
  );
}
