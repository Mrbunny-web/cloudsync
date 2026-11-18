import Link from "next/link";
import { Cloud } from "lucide-react";

export function Logo({ href = "/", showWord = true }: { href?: string; showWord?: boolean }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 rounded-xl outline-offset-4"
      aria-label="CloudSync home"
    >
      <span className="grid size-8 place-items-center rounded-[10px] bg-accent text-accent-ink shadow-soft">
        <Cloud className="size-[18px]" strokeWidth={2.2} aria-hidden="true" />
      </span>
      {showWord ? <span className="text-[15px] font-semibold tracking-tight text-ink">CloudSync</span> : null}
    </Link>
  );
}
