"use client";

import { useEffect, useRef } from "react";
import {
  Download,
  Ellipsis,
  Pencil,
  RotateCcw,
  Star,
  Trash,
} from "lucide-react";
import { FileGlyph } from "@/components/ui/FileGlyph";
import { formatBytes, formatDate } from "@/lib/format";
import { fileExtension, kindFromMime } from "@/lib/files";
import { useFilePreview } from "@/lib/useFilePreview";
import type { CloudFile } from "@/lib/cloud/types";

export type FileActions = {
  onOpen: (file: CloudFile) => void;
  onRename: (file: CloudFile) => void;
  onDownload: (file: CloudFile) => void;
  onToggleStar: (file: CloudFile) => void;
  onTrash: (file: CloudFile) => void;
  onRestore: (file: CloudFile) => void;
  onDeleteForever: (file: CloudFile) => void;
};

function MenuItem({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] ${
        danger ? "text-danger hover:bg-danger-soft" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function FileMenu({ file, actions }: { file: CloudFile; actions: FileActions }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) ref.current.open = false;
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const close = () => {
    if (ref.current) ref.current.open = false;
  };

  return (
    <details ref={ref} className="relative">
      <summary
        aria-label={`Actions for ${file.name}`}
        className="press grid size-8 cursor-pointer list-none place-items-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink [&::-webkit-details-marker]:hidden"
      >
        <Ellipsis className="size-4" aria-hidden="true" />
      </summary>
      <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-line bg-surface p-1 shadow-lift">
        {file.deletedAt ? (
          <>
            <MenuItem
              icon={<RotateCcw className="size-4" aria-hidden="true" />}
              label="Restore"
              onClick={() => {
                close();
                actions.onRestore(file);
              }}
            />
            <MenuItem
              icon={<Trash className="size-4" aria-hidden="true" />}
              label="Delete forever"
              danger
              onClick={() => {
                close();
                actions.onDeleteForever(file);
              }}
            />
          </>
        ) : (
          <>
            <MenuItem
              icon={<Download className="size-4" aria-hidden="true" />}
              label="Download"
              onClick={() => {
                close();
                actions.onDownload(file);
              }}
            />
            <MenuItem
              icon={<Pencil className="size-4" aria-hidden="true" />}
              label="Rename"
              onClick={() => {
                close();
                actions.onRename(file);
              }}
            />
            <MenuItem
              icon={<Star className="size-4" aria-hidden="true" />}
              label={file.starred ? "Remove star" : "Star"}
              onClick={() => {
                close();
                actions.onToggleStar(file);
              }}
            />
            <MenuItem
              icon={<Trash className="size-4" aria-hidden="true" />}
              label="Move to Trash"
              danger
              onClick={() => {
                close();
                actions.onTrash(file);
              }}
            />
          </>
        )}
      </div>
    </details>
  );
}

export function FileCard({ file, actions }: { file: CloudFile; actions: FileActions }) {
  const isImage = kindFromMime(file.mimeType) === "image";
  const preview = useFilePreview(file, isImage && !file.deletedAt);

  return (
    <article className="group relative rounded-2xl border border-line bg-surface p-2.5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-ink-3/25 hover:shadow-soft motion-reduce:hover:translate-y-0">
      <button
        type="button"
        onClick={() => actions.onOpen(file)}
        className="absolute inset-0 z-10 rounded-2xl outline-offset-2"
        aria-label={`Open ${file.name}`}
      />
      <div className="pointer-events-none relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-surface-2">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <FileGlyph mimeType={file.mimeType} className="size-7 text-ink-3" />
        )}
        <span className="absolute bottom-2 left-2 rounded-md bg-surface/85 px-1.5 py-0.5 font-mono text-[10px] text-ink-2 backdrop-blur-sm">
          {fileExtension(file.name)}
        </span>
        {file.starred ? (
          <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-surface/85 text-accent backdrop-blur-sm">
            <Star className="size-3.5 fill-current" aria-hidden="true" />
            <span className="sr-only">Starred</span>
          </span>
        ) : null}
      </div>
      <div className="pointer-events-none mt-3 px-1 pb-1">
        <p className="truncate text-[13px] font-medium text-ink">{file.name}</p>
        <p className="mt-0.5 truncate text-[11px] text-ink-3">
          {formatBytes(file.size)} · {file.deletedAt ? "In Trash" : formatDate(file.createdAt)}
        </p>
      </div>
      <div className="absolute right-2 top-2 z-20">
        <FileMenu file={file} actions={actions} />
      </div>
    </article>
  );
}

export function FileRow({ file, actions }: { file: CloudFile; actions: FileActions }) {
  return (
    <div className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2/70">
      <button
        type="button"
        onClick={() => actions.onOpen(file)}
        className="absolute inset-0 z-10 rounded-xl outline-offset-2"
        aria-label={`Open ${file.name}`}
      />
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-ink-2">
        <FileGlyph mimeType={file.mimeType} className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-medium text-ink">{file.name}</span>
          {file.starred ? <Star className="size-3 shrink-0 fill-current text-accent" aria-label="Starred" /> : null}
        </span>
        <span className="block truncate text-[11px] text-ink-3 sm:hidden">
          {formatBytes(file.size)} · {file.deletedAt ? "In Trash" : formatDate(file.createdAt)}
        </span>
      </span>
      <span className="hidden w-24 shrink-0 text-right text-[12px] tabular-nums text-ink-3 sm:block">
        {formatBytes(file.size)}
      </span>
      <span className="hidden w-28 shrink-0 text-right text-[12px] text-ink-3 md:block">
        {file.deletedAt ? "In Trash" : formatDate(file.createdAt)}
      </span>
      <span className="relative z-20">
        <FileMenu file={file} actions={actions} />
      </span>
    </div>
  );
}
