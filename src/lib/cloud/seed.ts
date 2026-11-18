import type { CloudFile, CloudFolder } from "./types";

export const DEMO_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024; // 10 GB

const MB = 1024 * 1024;
const KB = 1024;

export const SEED_FOLDERS: CloudFolder[] = [
  { id: "fld-projects", name: "Projects", parentId: null, createdAt: "2026-10-04T09:12:00.000Z" },
  { id: "fld-photos", name: "Photos", parentId: null, createdAt: "2026-09-18T16:40:00.000Z" },
  { id: "fld-documents", name: "Documents", parentId: null, createdAt: "2026-08-22T11:05:00.000Z" },
  { id: "fld-archive", name: "Archive", parentId: null, createdAt: "2026-05-30T08:30:00.000Z" },
];

type SeedFile = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  hoursAgo: number;
  starred?: boolean;
  deletedHoursAgo?: number;
  folderId?: string | null;
};

export const SEED_FILES: SeedFile[] = [
  { id: "file-roadmap", name: "Q3-roadmap.pdf", size: 1.1 * MB, mimeType: "application/pdf", hoursAgo: 3, starred: true, folderId: "fld-projects" },
  { id: "file-brand", name: "Brand-guidelines.pdf", size: 2.4 * MB, mimeType: "application/pdf", hoursAgo: 20, folderId: "fld-documents" },
  { id: "file-voice", name: "Voice-note-0412.m4a", size: 3.8 * MB, mimeType: "audio/mp4", hoursAgo: 27, folderId: "fld-archive" },
  { id: "file-iceland", name: "Iceland-2026.jpg", size: 6.1 * MB, mimeType: "image/jpeg", hoursAgo: 34, starred: true, folderId: "fld-photos" },
  { id: "file-team", name: "Team-offsite.jpg", size: 4.7 * MB, mimeType: "image/jpeg", hoursAgo: 52, folderId: "fld-photos" },
  { id: "file-walkthrough", name: "Product-walkthrough.mp4", size: 84.3 * MB, mimeType: "video/mp4", hoursAgo: 76, folderId: "fld-projects" },
  { id: "file-reformer", name: "Reformer-sequence.png", size: 940 * KB, mimeType: "image/png", hoursAgo: 98, folderId: "fld-projects" },
  { id: "file-budget", name: "Budget-2026.xlsx", size: 380 * KB, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", hoursAgo: 140, folderId: "fld-documents" },
  { id: "file-fonts", name: "Font-licenses.txt", size: 12 * KB, mimeType: "text/plain", hoursAgo: 190, folderId: "fld-archive" },
  { id: "file-invoice", name: "Old-invoice.pdf", size: 620 * KB, mimeType: "application/pdf", hoursAgo: 260, deletedHoursAgo: 72, folderId: "fld-documents" },
];

export function createSeedFiles(now = Date.now()): CloudFile[] {
  return SEED_FILES.map((seed) => {
    const created = new Date(now - seed.hoursAgo * 3_600_000).toISOString();
    return {
      id: seed.id,
      name: seed.name,
      size: Math.round(seed.size),
      mimeType: seed.mimeType,
      createdAt: created,
      updatedAt: created,
      starred: Boolean(seed.starred),
      deletedAt: seed.deletedHoursAgo
        ? new Date(now - seed.deletedHoursAgo * 3_600_000).toISOString()
        : null,
      folderId: seed.folderId ?? null,
      path: null,
    };
  });
}

/** A small, honest set for the landing-page shelf. */
export const SHOWCASE_FILES = SEED_FILES.filter((file) => !file.deletedHoursAgo).slice(0, 6);
