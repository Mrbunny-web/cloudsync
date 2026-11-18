"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Cloud, Info } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useCloud } from "@/lib/cloud/provider";
import { formatBytes } from "@/lib/format";
import { SHOWCASE_FILES } from "@/lib/cloud/seed";

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3";

/** Where to land after signing in, honouring ?next=/somewhere. */
function destination(): string {
  if (typeof window === "undefined") return "/dashboard";
  const param = new URLSearchParams(window.location.search).get("next");
  return param && param.startsWith("/") ? param : "/dashboard";
}

export function AuthForm({ mode }: { mode: "signin" | "register" }) {
  const { mode: cloudMode, ready, user, signIn, signUp, signInDemo } = useCloud();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [next] = useState(destination);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  const isRegister = mode === "register";
  const swapHref = `${isRegister ? "/auth/signin" : "/auth/register"}${
    next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (isRegister && password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    if (isRegister && password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    setSubmitting(true);
    const result = isRegister ? await signUp(email, password, name) : await signIn(email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.message) {
      setMessage(result.message);
      return;
    }
    router.replace(next);
  };

  const continueDemo = async () => {
    await signInDemo();
    router.replace(next);
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.02fr_1fr]">
      <aside
        className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-surface/60 px-10 py-10 lg:flex"
        style={{
          backgroundImage:
            "radial-gradient(38rem 28rem at 88% -10%, var(--c-glow), transparent 60%)",
        }}
      >
        <Logo />
        <div className="max-w-sm">
          <h2 className="text-[clamp(1.8rem,3vw,2.4rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-ink">
            Every file, in one calm place.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            One private drive for your photos, documents and the things you keep meaning to sort.
          </p>

          <div className="mt-8 space-y-2">
            {SHOWCASE_FILES.slice(0, 4).map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2.5"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Cloud className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
                  <span className="truncate text-[13px] text-ink">{file.name}</span>
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-ink-3">{formatBytes(file.size)}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-ink-3">Private by default. No ads, no scanning.</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-sm text-ink-2">
            {isRegister ? "Start with 10 GB and room to grow." : "Sign in to open your drive."}
          </p>

          {cloudMode === "demo" ? (
            <div className="mt-6 rounded-xl border border-line bg-surface-2/60 p-3.5">
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
                <Info className="size-3.5 text-ink-3" aria-hidden="true" />
                Demo mode
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-2">
                Accounts and files stay in this browser. Create an account with a real password,
                or explore the sample drive.
              </p>
              <button
                type="button"
                onClick={() => void continueDemo()}
                className="press mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:underline"
              >
                Explore the sample drive
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {isRegister ? (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium text-ink">
                  Name
                </label>
                <input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-ink">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isRegister ? "At least 8 characters" : "Your password"}
                  minLength={isRegister ? 8 : undefined}
                  className={`${inputClass} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="press absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[12px] text-ink-2 hover:bg-surface-2"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {isRegister ? (
              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-[13px] font-medium text-ink">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  placeholder="Repeat your password"
                  className={inputClass}
                />
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-[12px] text-danger">
                {error}
              </p>
            ) : null}
            {message ? (
              <p role="status" className="rounded-xl bg-accent-soft px-3 py-2 text-[12px] text-accent">
                {message}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? <Spinner /> : null}
              {isRegister ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-ink-2">
            {isRegister ? "Already have an account? " : "New to CloudSync? "}
            <Link
              href={swapHref}
              className="font-medium text-accent hover:underline"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>

          <p className="mt-8 text-center text-[11px] text-ink-3">
            <Link href="/" className="hover:text-ink">
              Back to CloudSync
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
