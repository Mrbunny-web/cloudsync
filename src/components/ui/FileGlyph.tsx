import {
  AudioLines,
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { kindFromMime } from "@/lib/files";

export function FileGlyph({
  mimeType,
  className = "size-6",
  strokeWidth = 1.6,
}: {
  mimeType: string | null;
  className?: string;
  strokeWidth?: number;
}) {
  switch (kindFromMime(mimeType)) {
    case "image":
      return <ImageIcon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
    case "video":
      return <Video className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
    case "audio":
      return <AudioLines className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
    case "document":
      return <FileText className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
    default:
      return <FileIcon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
  }
}
