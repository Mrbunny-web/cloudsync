import { LoaderCircle } from "lucide-react";

export function Spinner({ className = "size-4" }: { className?: string }) {
  return <LoaderCircle className={`${className} animate-spin motion-reduce:animate-none`} aria-hidden="true" />;
}
