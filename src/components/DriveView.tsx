"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  AudioLines,
  ChevronLeft,
  CircleCheck,
  Cloud,
  CloudUpload,
  File as FileIcon,
  FileText,
  Folder as FolderIcon,
  FolderPlus,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Search,
  Star,
  Trash,
  Upload,
  Users,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { FileCard, FileRow, type FileActions } from "@/components/FileCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FileGlyph } from "@/components/ui/FileGlyph";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { useCloud } from "@/lib/cloud/provider";
import { useFilePreview } from "@/lib/useFilePreview";
import { fileExtension, kindFromMime } from "@/lib/files";
import { formatBytes, formatDate } from "@/lib/format";
import type { CloudFile } from "@/lib/cloud/types";

export type DriveScope =
  | "all"
  | "recent"
  | "starred"
  | "shared"
  | "trash"
  | "photos"
  | "documents"
  | "videos"
  | "audio"
  | "other";

type SortKey = "date" | "name" | "size";
type View = "grid" | "list";
type Toast = { text: string; action?: { label: string; onClick: () => void } };

const SCOPE_META: Record<
  DriveScope,
  { title: string; description: string; emptyTitle: string; emptyBody: string; icon: LucideIcon }
> = {
  all: {
    title: "My Drive",
    description: "Everything you keep in CloudSync.",
    emptyTitle: "Your drive is empty",
    emptyBody: "Upload a file or create a folder to get started.",
    icon: FolderIcon,
  },
  recent: {
    title: "Recent",
    description: "The latest files you added or changed.",
    emptyTitle: "Nothing recent",
    emptyBody: "Files you upload will show up here first.",
    icon: Cloud,
  },
  starred: {
    title: "Starred",
    description: "The files you want within reach.",
    emptyTitle: "No starred files",
    emptyBody: "Star a file from its menu to pin it here.",
    icon: Star,
  },
  shared: {
    title: "Shared",
    description: "Links and files you share with other people.",
    emptyTitle: "Sharing is on the way",
    emptyBody: "This build keeps everything private to you. Shared links arrive next.",
    icon: Users,
  },
  trash: {
    title: "Trash",
    description: "Deleted files stay here until you remove them.",
    emptyTitle: "Trash is empty",
    emptyBody: "Files you move to Trash wait here before they are deleted.",
    icon: Trash,
  },
  photos: {
    title: "Photos",
    description: "Images across your drive.",
    emptyTitle: "No photos yet",
    emptyBody: "Upload an image and it will appear here.",
    icon: ImageIcon,
  },
  documents: {
    title: "Documents",
    description: "PDFs, notes, sheets and text files.",
    emptyTitle: "No documents yet",
    emptyBody: "Upload a document and it will appear here.",
    icon: FileText,
  },
  videos: {
    title: "Videos",
    description: "Clips and recordings across your drive.",
    emptyTitle: "No videos yet",
    emptyBody: "Upload a video and it will appear here.",
    icon: Video,
  },
  audio: {
    title: "Audio",
    description: "Recordings, music and voice notes.",
    emptyTitle: "No audio yet",
    emptyBody: "Upload an audio file and it will appear here.",
    icon: AudioLines,
  },
  other: {
    title: "Other",
    description: "Archives and files that fit no other shelf.",
    emptyTitle: "Nothing here yet",
    emptyBody: "Upload a file and it will appear here.",
    icon: FileIcon,
  },
};

const MAX_UPLOAD = 100 * 1024 * 1024;

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Try again.";
}

function Artwork({ file }: { file: CloudFile }) {
  const isImage = kindFromMime(file.mimeType) === "image";
  const preview = useFilePreview(file, isImage);

  return (
    <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-surface-2">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="size-full object-cover" />
      ) : (
        <FileGlyph mimeType={file.mimeType} className="size-7 text-ink-3" />
      )}
    </div>
  );
}

export function DriveView({ scope }: { scope: DriveScope }) {
  const {
    files,
    folders,
    uploadFiles,
    createFolder,
    renameFile,
    toggleStar,
    trashFile,
    restoreFile,
    deleteForever,
    downloadFile,
  } = useCloud();

  const meta = SCOPE_META[scope];
  const canUpload = scope !== "trash" && scope !== "shared";

  // Read the saved preference on the first client render. This view only mounts
  // after the auth shell is ready, so it never participates in server hydration.
  const [view, setView] = useState<View>(() => {
    if (typeof window === "undefined") return "grid";
    return window.localStorage.getItem("cloudsync.view") === "list" ? "list" : "grid";
  });
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [descending, setDescending] = useState(true);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [savingRename, setSavingRename] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderError, setFolderError] = useState("");
  const [folderSaving, setFolderSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CloudFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((text: string, action?: Toast["action"]) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ text, action });
    toastTimer.current = window.setTimeout(() => setToast(null), action ? 6_000 : 3_600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const selected = files.find((file) => file.id === selectedId) ?? null;
  const activeFolder = folders.find((folder) => folder.id === activeFolderId) ?? null;

  const changeView = (next: View) => {
    setView(next);
    window.localStorage.setItem("cloudsync.view", next);
  };

  const scoped = useMemo(() => {
    let list = files.filter((file) => (scope === "trash" ? Boolean(file.deletedAt) : !file.deletedAt));

    if (scope === "starred") list = list.filter((file) => file.starred);
    else if (scope === "photos") list = list.filter((file) => kindFromMime(file.mimeType) === "image");
    else if (scope === "documents") list = list.filter((file) => kindFromMime(file.mimeType) === "document");
    else if (scope === "videos") list = list.filter((file) => kindFromMime(file.mimeType) === "video");
    else if (scope === "audio") list = list.filter((file) => kindFromMime(file.mimeType) === "audio");
    else if (scope === "other") list = list.filter((file) => kindFromMime(file.mimeType) === "other");
    else if (scope === "shared") list = [];

    if (scope === "all" && activeFolderId) {
      list = list.filter((file) => file.folderId === activeFolderId);
    }
    if (scope === "recent") {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [files, scope, activeFolderId]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle ? scoped.filter((file) => file.name.toLowerCase().includes(needle)) : scoped;
    const sorted = [...filtered].sort((a, b) => {
      let result = 0;
      if (sortKey === "name") result = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      else if (sortKey === "size") result = a.size - b.size;
      else result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return descending ? -result : result;
    });
    return sorted;
  }, [scoped, query, sortKey, descending]);

  const folderCount = (id: string) =>
    files.filter((file) => !file.deletedAt && file.folderId === id).length;

  const handlePick = () => fileInputRef.current?.click();

  const handleFiles = async (input: FileList | null) => {
    if (!input || input.length === 0) return;
    const incoming = Array.from(input);
    const accepted = incoming.filter((file) => file.size <= MAX_UPLOAD);
    const skipped = incoming.length - accepted.length;

    if (accepted.length === 0) {
      showToast("Files must be 100 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      await uploadFiles(accepted, activeFolderId);
      showToast(
        skipped
          ? `${accepted.length} uploaded. ${skipped} skipped (over 100 MB).`
          : `${accepted.length} ${accepted.length === 1 ? "file" : "files"} uploaded.`,
      );
    } catch (error) {
      showToast(errorText(error));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submitFolder = async (event: React.FormEvent) => {
    event.preventDefault();
    setFolderSaving(true);
    setFolderError("");
    const result = await createFolder(folderName);
    setFolderSaving(false);
    if (result.error) {
      setFolderError(result.error);
      return;
    }
    setFolderOpen(false);
    setFolderName("");
    showToast("Folder created.");
  };

  const startRename = (file: CloudFile) => {
    setSelectedId(file.id);
    setDraftName(file.name);
    setRenaming(true);
  };

  const submitRename = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setSavingRename(true);
    const result = await renameFile(selected.id, draftName);
    setSavingRename(false);
    if (result.error) {
      showToast(result.error);
      return;
    }
    setRenaming(false);
    showToast("Renamed.");
  };

  const actions: FileActions = {
    onOpen: (file) => {
      setSelectedId(file.id);
      setDraftName(file.name);
      setRenaming(false);
    },
    onRename: startRename,
    onDownload: async (file) => {
      try {
        await downloadFile(file);
      } catch (error) {
        showToast(errorText(error));
      }
    },
    onToggleStar: async (file) => {
      const result = await toggleStar(file.id);
      if (result.error) showToast(result.error);
    },
    onTrash: async (file) => {
      const result = await trashFile(file.id);
      if (result.error) {
        showToast(result.error);
        return;
      }
      if (selectedId === file.id) setSelectedId(null);
      showToast("Moved to Trash.", {
        label: "Undo",
        onClick: () => {
          void restoreFile(file.id);
        },
      });
    },
    onRestore: async (file) => {
      const result = await restoreFile(file.id);
      if (result.error) {
        showToast(result.error);
        return;
      }
      if (selectedId === file.id) setSelectedId(null);
      showToast("Restored to My Drive.");
    },
    onDeleteForever: (file) => setPendingDelete(file),
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const result = await deleteForever(pendingDelete.id);
    setDeleting(false);
    if (result.error) {
      showToast(result.error);
      return;
    }
    if (selectedId === pendingDelete.id) setSelectedId(null);
    setPendingDelete(null);
    showToast("Deleted forever.");
  };

  const title = activeFolder && scope === "all" ? activeFolder.name : meta.title;
  const description = activeFolder && scope === "all" ? "My Drive" : meta.description;
  const EmptyIcon = meta.icon;
  const isSearchEmpty = query.trim().length > 0 && visible.length === 0 && scoped.length > 0;

  return (
    <div
      className="relative"
      onDragEnter={(event) => {
        event.preventDefault();
        dragDepth.current += 1;
        if (canUpload) setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        event.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        if (canUpload) void handleFiles(event.dataTransfer.files);
      }}
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {activeFolder && scope === "all" ? (
            <button
              type="button"
              onClick={() => setActiveFolderId(null)}
              className="mb-2 inline-flex items-center gap-1 text-[12px] font-medium text-ink-2 hover:text-ink"
            >
              <ChevronLeft className="size-3.5" aria-hidden="true" /> All files
            </button>
          ) : null}
          <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-ink sm:text-[30px]">{title}</h1>
          <p className="mt-1 text-sm text-ink-2">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          {scope === "all" && !activeFolder ? (
            <Button variant="secondary" onClick={() => setFolderOpen(true)}>
              <FolderPlus className="size-4" aria-hidden="true" />
              New folder
            </Button>
          ) : null}
          {canUpload ? (
            <Button onClick={handlePick} disabled={uploading}>
              {uploading ? <Spinner /> : <Upload className="size-4" aria-hidden="true" />}
              Upload
            </Button>
          ) : null}
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files"
            aria-label="Search files"
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-14 text-sm text-ink placeholder:text-ink-3"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="press absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-line bg-surface-2 px-1.5 py-0.5 font-sans text-[10px] text-ink-3">
              /
            </kbd>
          )}
        </div>

        <select
          value={sortKey}
          onChange={(event) => setSortKey(event.target.value as SortKey)}
          aria-label="Sort by"
          className="h-10 rounded-xl border border-line bg-surface px-2.5 text-[13px] text-ink-2"
        >
          <option value="date">Date</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
        </select>

        <button
          type="button"
          onClick={() => setDescending((value) => !value)}
          aria-label={descending ? "Sort descending" : "Sort ascending"}
          className="press grid size-10 place-items-center rounded-xl border border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink"
        >
          {descending ? <ArrowDown className="size-4" aria-hidden="true" /> : <ArrowUp className="size-4" aria-hidden="true" />}
        </button>

        <div className="inline-flex rounded-xl border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => changeView("grid")}
            aria-pressed={view === "grid"}
            aria-label="Grid view"
            className={`press grid size-8 place-items-center rounded-lg ${
              view === "grid" ? "bg-surface-2 text-ink shadow-soft" : "text-ink-3 hover:text-ink"
            }`}
          >
            <LayoutGrid className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => changeView("list")}
            aria-pressed={view === "list"}
            aria-label="List view"
            className={`press grid size-8 place-items-center rounded-lg ${
              view === "list" ? "bg-surface-2 text-ink shadow-soft" : "text-ink-3 hover:text-ink"
            }`}
          >
            <List className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-ink-3">
        <span>
          {visible.length} {visible.length === 1 ? "item" : "items"}
          {query ? ` for “${query.trim()}”` : ""}
        </span>
        {uploading ? (
          <span className="inline-flex items-center gap-1.5">
            <Spinner className="size-3.5" /> Uploading…
          </span>
        ) : null}
      </div>

      {scope === "all" && !activeFolder && folders.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => setActiveFolderId(folder.id)}
              className="press flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-3 text-left hover:border-ink-3/25 hover:bg-surface-2/60"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-ink-2">
                <FolderIcon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink">{folder.name}</span>
                <span className="block text-[11px] text-ink-3">
                  {folderCount(folder.id)} {folderCount(folder.id) === 1 ? "item" : "items"}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-line bg-surface/40 px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-surface-2 text-ink-3">
            <EmptyIcon className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-base font-semibold tracking-tight text-ink">
            {isSearchEmpty ? `No matches for “${query.trim()}”` : scope === "all" && activeFolder ? "This folder is empty" : meta.emptyTitle}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-ink-2">
            {isSearchEmpty
              ? "Try another word, or clear the search."
              : scope === "all" && activeFolder
                ? "Upload a file and it will land in this folder."
                : meta.emptyBody}
          </p>
          <div className="mt-5">
            {isSearchEmpty ? (
              <Button variant="secondary" onClick={() => setQuery("")}>
                Clear search
              </Button>
            ) : scope === "trash" || scope === "shared" ? (
              <ButtonLink href="/dashboard" variant="secondary">
                Go to My Drive
              </ButtonLink>
            ) : canUpload ? (
              <Button onClick={handlePick}>
                <Upload className="size-4" aria-hidden="true" /> Upload a file
              </Button>
            ) : null}
          </div>
        </div>
      ) : view === "grid" ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((file) => (
            <FileCard key={file.id} file={file} actions={actions} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-1.5">
          <div className="hidden items-center gap-3 px-3 pb-2 pt-1 text-[11px] text-ink-3 sm:flex">
            <span className="w-9" />
            <span className="flex-1">Name</span>
            <span className="w-24 text-right">Size</span>
            <span className="hidden w-28 text-right md:block">Modified</span>
            <span className="w-8" />
          </div>
          <div className="divide-y divide-line/70">
            {visible.map((file) => (
              <FileRow key={file.id} file={file} actions={actions} />
            ))}
          </div>
        </div>
      )}

      {dragging ? (
        <div className="pointer-events-none fixed inset-4 z-40 grid place-items-center rounded-3xl border-2 border-dashed border-accent bg-accent-soft/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-accent">
            <CloudUpload className="size-8" aria-hidden="true" />
            <p className="text-sm font-medium">Drop to upload</p>
          </div>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <Modal
        open={Boolean(selected)}
        onClose={() => {
          setSelectedId(null);
          setRenaming(false);
        }}
        title="File details"
      >
        {selected ? (
          <>
            <div className="flex items-start gap-4">
              <Artwork file={selected} />
              <div className="min-w-0 flex-1">
                {renaming ? (
                  <form onSubmit={submitRename} className="space-y-2">
                    <label htmlFor="rename-file" className="sr-only">
                      File name
                    </label>
                    <input
                      id="rename-file"
                      autoFocus
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={savingRename}>
                        {savingRename ? <Spinner className="size-3.5" /> : null}
                        Save
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setRenaming(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="break-words text-[15px] font-semibold text-ink">{selected.name}</h3>
                    <p className="mt-1 text-[12px] text-ink-2">
                      {fileExtension(selected.name)} · {formatBytes(selected.size)}
                      {selected.starred ? " · Starred" : ""}
                    </p>
                    <button
                      type="button"
                      onClick={() => setRenaming(true)}
                      className="mt-2 text-[12px] font-medium text-accent hover:underline"
                    >
                      Rename
                    </button>
                  </>
                )}
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-line bg-surface-2/50 p-4 text-[12px]">
              <div>
                <dt className="text-ink-3">Type</dt>
                <dd className="mt-0.5 text-ink">{fileExtension(selected.name)}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Size</dt>
                <dd className="mt-0.5 tabular-nums text-ink">{formatBytes(selected.size)}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Added</dt>
                <dd className="mt-0.5 text-ink">{formatDate(selected.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Location</dt>
                <dd className="mt-0.5 truncate text-ink">
                  {folders.find((folder) => folder.id === selected.folderId)?.name ?? "My Drive"}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              {selected.deletedAt ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      void actions.onRestore(selected);
                    }}
                  >
                    Restore
                  </Button>
                  <Button variant="danger" onClick={() => setPendingDelete(selected)}>
                    <Trash className="size-4" aria-hidden="true" /> Delete forever
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      void actions.onDownload(selected);
                    }}
                  >
                    Download
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      void actions.onToggleStar(selected);
                    }}
                  >
                    <Star className={`size-4 ${selected.starred ? "fill-current" : ""}`} aria-hidden="true" />
                    {selected.starred ? "Remove star" : "Star"}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setSelectedId(null);
                      void actions.onTrash(selected);
                    }}
                  >
                    <Trash className="size-4" aria-hidden="true" /> Move to Trash
                  </Button>
                </>
              )}
            </div>
          </>
        ) : null}
      </Modal>

      <Modal
        open={folderOpen}
        onClose={() => {
          setFolderOpen(false);
          setFolderError("");
        }}
        title="New folder"
        description="Folders keep related files together."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setFolderOpen(false);
                setFolderError("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" form="new-folder-form" disabled={folderSaving}>
              {folderSaving ? <Spinner className="size-4" /> : null}
              Create folder
            </Button>
          </>
        }
      >
        <form id="new-folder-form" onSubmit={submitFolder}>
          <label htmlFor="folder-name" className="mb-1.5 block text-[13px] font-medium text-ink">
            Folder name
          </label>
          <input
            id="folder-name"
            autoFocus
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            placeholder="e.g. Client work"
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3"
          />
          {folderError ? (
            <p role="alert" className="mt-2 text-[12px] text-danger">
              {folderError}
            </p>
          ) : null}
        </form>
      </Modal>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete forever?"
        description="This removes the file and its contents. You can't undo it."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void confirmDelete()} disabled={deleting}>
              {deleting ? <Spinner className="size-4" /> : null}
              Delete forever
            </Button>
          </>
        }
      >
        <p className="break-words rounded-xl border border-line bg-surface-2/50 px-3 py-2.5 text-sm text-ink">
          {pendingDelete?.name}
        </p>
      </Modal>

      {toast ? (
        <div
          role="status"
          className="pop fixed bottom-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-line bg-surface p-3 shadow-lift sm:left-auto sm:right-6 sm:translate-x-0"
        >
          <div className="flex items-center gap-2.5">
            <CircleCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-[13px] text-ink">{toast.text}</p>
            {toast.action ? (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  setToast(null);
                }}
                className="press rounded-lg px-2 py-1 text-[12px] font-medium text-accent hover:bg-accent-soft"
              >
                {toast.action.label}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss"
              className="press grid size-7 place-items-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
