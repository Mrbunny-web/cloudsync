import Image from "next/image";

export function Banner({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <Image
        src="/cloudsync-banner.jpg"
        alt="CloudSync — Your private home for photos, documents and everything in between"
        width={1200}
        height={400}
        className="rounded-3xl object-cover shadow-soft"
        priority={false}
      />
    </a>
  );
}