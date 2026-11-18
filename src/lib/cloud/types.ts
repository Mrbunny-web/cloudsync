export type CloudMode = "demo" | "supabase";

export type CloudUser = {
  id: string;
  email: string;
  name: string;
};

export type CloudFile = {
  id: string;
  name: string;
  size: number;
  mimeType: string | null;
  createdAt: string;
  updatedAt: string;
  starred: boolean;
  deletedAt: string | null;
  folderId: string | null;
  /** Supabase storage path, when running against Supabase. */
  path: string | null;
};

export type CloudFolder = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
};

export type CloudProfile = {
  fullName: string;
  storageLimit: number;
};

export type ActionResult = { error?: string; message?: string };

export type CloudContextValue = {
  mode: CloudMode;
  ready: boolean;
  user: CloudUser | null;
  profile: CloudProfile;
  files: CloudFile[];
  folders: CloudFolder[];
  storageUsed: number;
  signIn: (email: string, password: string) => Promise<ActionResult>;
  signUp: (email: string, password: string, name: string) => Promise<ActionResult>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  uploadFiles: (incoming: File[], folderId: string | null) => Promise<void>;
  createFolder: (name: string) => Promise<ActionResult>;
  renameFile: (id: string, name: string) => Promise<ActionResult>;
  toggleStar: (id: string) => Promise<ActionResult>;
  trashFile: (id: string) => Promise<ActionResult>;
  restoreFile: (id: string) => Promise<ActionResult>;
  deleteForever: (id: string) => Promise<ActionResult>;
  updateProfile: (fullName: string) => Promise<ActionResult>;
  downloadFile: (file: CloudFile) => Promise<void>;
  getPreviewUrl: (file: CloudFile) => Promise<string | null>;
};
