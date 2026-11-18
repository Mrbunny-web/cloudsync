export type FileKind = "image" | "video" | "audio" | "document" | "other";

export function kindFromMime(mime: string | null): FileKind {
  if (!mime) return "other";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (
    mime.startsWith("text/") ||
    /(pdf|document|sheet|presentation|word|excel|powerpoint|json|csv|rtf)/i.test(mime)
  ) {
    return "document";
  }
  return "other";
}

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) return "FILE";
  return name.slice(dot + 1).toUpperCase().slice(0, 5);
}
