"use client";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DEMO_STORAGE_LIMIT } from "./seed";
import {
  DEMO_EMAIL,
  DEMO_NAME,
  deleteBlob,
  emptyDrive,
  getBlob,
  hashPassword,
  loadDemoState,
  normalizeEmail,
  putBlob,
  randomSalt,
  saveDemoState,
  seedDrive,
  type DemoAccount,
  type DemoDrive,
} from "./demo";
import type {
  ActionResult,
  CloudContextValue,
  CloudFile,
  CloudFolder,
  CloudProfile,
  CloudUser,
} from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const MODE = SUPABASE_URL && SUPABASE_KEY ? "supabase" : "demo";
const BUCKET = "cloudsync";

/* False in server HTML and during hydration, true once the client is live.
   Lets demo mode read localStorage without breaking hydration. */
const subscribeToHydration = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nameFromEmail(email: string): string {
  const handle = email.split("@")[0] ?? "there";
  return handle.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function accountUser(account: DemoAccount): CloudUser {
  return { id: `demo:${account.email}`, email: account.email, name: account.name };
}

function mapUser(user: User | null): CloudUser | null {
  if (!user) return null;
  const metaName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  return {
    id: user.id,
    email: user.email ?? "",
    name: metaName || nameFromEmail(user.email ?? "you@cloudsync.app"),
  };
}

type FileRow = Record<string, unknown>;
type FolderRow = Record<string, unknown>;

function mapFileRow(row: FileRow): CloudFile {
  const created = String(row.created_at ?? new Date().toISOString());
  return {
    id: String(row.id),
    name: String(row.name ?? "Untitled"),
    size: Number(row.size ?? 0),
    mimeType: (row.mime_type as string | null) ?? null,
    createdAt: created,
    updatedAt: String(row.updated_at ?? created),
    starred: Boolean(row.starred),
    deletedAt: (row.deleted_at as string | null) ?? null,
    folderId: (row.folder_id as string | null) ?? null,
    path: (row.supabase_path as string | null) ?? (row.path as string | null) ?? null,
  };
}

function mapFolderRow(row: FolderRow): CloudFolder {
  return {
    id: String(row.id),
    name: String(row.name ?? "Folder"),
    parentId: (row.parent_id as string | null) ?? null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function friendly(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return "That email and password don't match. Try again.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Confirm your email address first, then sign in.";
  }
  if (/user already registered/i.test(message)) {
    return "An account with that email already exists. Sign in instead.";
  }
  if (/password should be at least/i.test(message)) {
    return "Use at least 8 characters for your password.";
  }
  if (/email address .* is invalid/i.test(message)) {
    return "Enter a valid email address.";
  }
  if (/column [\w."]*?(starred|deleted_at)[\w."]*? does not exist/i.test(message)) {
    return `${message}. Run database/002_features.sql in the Supabase SQL editor to add the missing columns.`;
  }
  if (/bucket/i.test(message) && /not found/i.test(message)) {
    return 'The storage bucket "cloudsync" is missing. Create it in Supabase Storage first.';
  }
  return message;
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_500);
}

const CloudContext = createContext<CloudContextValue | null>(null);

export function CloudProvider({ children }: { children: ReactNode }) {
  const isDemo = MODE === "demo";
  const hydrated = useSyncExternalStore(subscribeToHydration, getHydrated, getServerHydrated);

  /* Demo state can be read on the first client render; the loading shell hides
     it until hydration finishes. Supabase waits for its session check instead.
     The window guard keeps Date.now() out of the static prerender. */
  const [demoBoot] = useState(() =>
    isDemo && typeof window !== "undefined" ? loadDemoState() : null,
  );
  const [remoteReady, setRemoteReady] = useState(false);
  const ready = isDemo ? hydrated : remoteReady;

  const bootAccount = demoBoot?.sessionEmail
    ? (demoBoot.accounts.find((account) => account.email === demoBoot.sessionEmail) ?? null)
    : null;
  const bootDrive = demoBoot?.sessionEmail
    ? (demoBoot.drives[demoBoot.sessionEmail] ?? null)
    : null;

  const [accounts, setAccounts] = useState<DemoAccount[]>(demoBoot?.accounts ?? []);
  const [sessionEmail, setSessionEmail] = useState<string | null>(demoBoot?.sessionEmail ?? null);
  const [user, setUser] = useState<CloudUser | null>(bootAccount ? accountUser(bootAccount) : null);
  const [profile, setProfile] = useState<CloudProfile>({
    fullName: bootAccount?.name ?? "",
    storageLimit: DEMO_STORAGE_LIMIT,
  });
  const [files, setFiles] = useState<CloudFile[]>(bootDrive?.files ?? []);
  const [folders, setFolders] = useState<CloudFolder[]>(bootDrive?.folders ?? []);

  const drivesRef = useRef<Record<string, DemoDrive>>(demoBoot?.drives ?? {});

  const loadRemote = useCallback(async (accountId: string, fallbackName: string) => {
    const supabase = getClient();
    const [profileResult, filesResult, foldersResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, storage_limit")
        .eq("id", accountId)
        .maybeSingle(),
      supabase.from("files").select("*").eq("user_id", accountId).order("created_at", { ascending: false }),
      supabase.from("folders").select("*").eq("user_id", accountId).order("created_at", { ascending: false }),
    ]);

    const row = profileResult.data as { full_name?: string | null; storage_limit?: number | null } | null;

    setProfile({
      fullName: row?.full_name ?? fallbackName,
      storageLimit: Number(row?.storage_limit) || DEMO_STORAGE_LIMIT,
    });
    setFiles(((filesResult.data as FileRow[] | null) ?? []).map(mapFileRow));
    setFolders(((foldersResult.data as FolderRow[] | null) ?? []).map(mapFolderRow));
  }, []);

  /* Boot: supabase restores the session. Demo state is already loaded above. */
  useEffect(() => {
    if (isDemo) return;

    const supabase = getClient();
    let active = true;

    const boot = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (data.user) {
        setUser(mapUser(data.user));
        await loadRemote(data.user.id, mapUser(data.user)?.name ?? "");
      }
      if (active) setRemoteReady(true);
    };

    void boot();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_OUT") {
        setUser(null);
        setFiles([]);
        setFolders([]);
      } else if (event === "SIGNED_IN" && session?.user) {
        setUser(mapUser(session.user));
        void loadRemote(session.user.id, mapUser(session.user)?.name ?? "");
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [isDemo, loadRemote]);

  /* Persist the signed-in demo drive (and every other saved drive). */
  useEffect(() => {
    if (!isDemo || !ready) return;
    if (sessionEmail) {
      drivesRef.current[sessionEmail] = { files, folders };
    }
    saveDemoState({ accounts, sessionEmail, drives: drivesRef.current });
  }, [ready, isDemo, accounts, sessionEmail, files, folders]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<ActionResult> => {
      if (!email.trim() || !password) return { error: "Enter your email and password." };

      if (isDemo) {
        const address = normalizeEmail(email);
        const account = accounts.find((item) => item.email === address);
        if (!account) {
          return { error: "No account found for that email. Create an account first." };
        }
        if (!account.hash) {
          return { error: "This sample account has no password. Use “Continue with demo data”." };
        }

        const hash = await hashPassword(password, account.salt);
        if (hash !== account.hash) {
          return { error: "That password doesn't match this account." };
        }

        const drive = drivesRef.current[address] ?? emptyDrive();
        setSessionEmail(address);
        setUser(accountUser(account));
        setProfile({ fullName: account.name, storageLimit: DEMO_STORAGE_LIMIT });
        setFiles(drive.files);
        setFolders(drive.folders);
        return {};
      }

      const { error } = await getClient().auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      });
      return error ? { error: friendly(error.message) } : {};
    },
    [accounts, isDemo, setFiles, setFolders, setProfile, setSessionEmail, setUser],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string): Promise<ActionResult> => {
      const address = normalizeEmail(email);
      if (!address || !password) return { error: "Enter your email and password." };
      if (!isEmail(address)) return { error: "Enter a valid email address." };
      if (password.length < 8) return { error: "Use at least 8 characters for your password." };

      if (isDemo) {
        if (accounts.some((account) => account.email === address)) {
          return { error: "An account with that email already exists. Sign in instead." };
        }

        const salt = randomSalt();
        const hash = await hashPassword(password, salt);
        const displayName = name.trim() || nameFromEmail(address);
        const account: DemoAccount = {
          email: address,
          name: displayName,
          salt,
          hash,
          createdAt: new Date().toISOString(),
        };

        drivesRef.current[address] = emptyDrive();
        setAccounts((prev) => [...prev, account]);
        setSessionEmail(address);
        setUser(accountUser(account));
        setProfile({ fullName: displayName, storageLimit: DEMO_STORAGE_LIMIT });
        setFiles([]);
        setFolders([]);
        return {};
      }

      const { data, error } = await getClient().auth.signUp({
        email: address,
        password,
        options: {
          data: { full_name: name.trim() || nameFromEmail(address) },
          emailRedirectTo:
            typeof window === "undefined" ? undefined : `${window.location.origin}/auth/signin`,
        },
      });
      if (error) return { error: friendly(error.message) };
      if (!data.session) {
        return { message: "Check your email to confirm your account, then sign in." };
      }
      return {};
    },
    [accounts, isDemo, setAccounts, setFiles, setFolders, setProfile, setSessionEmail, setUser],
  );

  const signInDemo = useCallback(async () => {
    if (!isDemo) return;

    const existing = accounts.find((account) => account.email === DEMO_EMAIL);
    const account: DemoAccount =
      existing ?? {
        email: DEMO_EMAIL,
        name: DEMO_NAME,
        salt: "",
        hash: "",
        createdAt: new Date().toISOString(),
      };

    if (!existing) setAccounts((prev) => [...prev, account]);
    if (!drivesRef.current[DEMO_EMAIL]) {
      drivesRef.current[DEMO_EMAIL] = seedDrive();
    }

    setSessionEmail(DEMO_EMAIL);
    setUser(accountUser(account));
    setProfile({ fullName: account.name, storageLimit: DEMO_STORAGE_LIMIT });
    setFiles(drivesRef.current[DEMO_EMAIL].files);
    setFolders(drivesRef.current[DEMO_EMAIL].folders);
  }, [
    accounts,
    isDemo,
    setAccounts,
    setFiles,
    setFolders,
    setProfile,
    setSessionEmail,
    setUser,
  ]);

  const signOut = useCallback(async () => {
    if (isDemo) {
      if (sessionEmail) drivesRef.current[sessionEmail] = { files, folders };
      setSessionEmail(null);
      setUser(null);
      setProfile({ fullName: "", storageLimit: DEMO_STORAGE_LIMIT });
      setFiles([]);
      setFolders([]);
      return;
    }

    await getClient().auth.signOut();
    setUser(null);
    setFiles([]);
    setFolders([]);
  }, [files, folders, isDemo, sessionEmail, setFiles, setFolders, setProfile, setSessionEmail, setUser]);

  const uploadFiles = useCallback(
    async (incoming: File[], folderId: string | null) => {
      if (incoming.length === 0) return;

      if (MODE === "demo") {
        const created: CloudFile[] = [];
        for (const file of incoming) {
          const id = newId();
          const now = new Date().toISOString();
          await putBlob(id, file);
          created.push({
            id,
            name: file.name,
            size: file.size,
            mimeType: file.type || null,
            createdAt: now,
            updatedAt: now,
            starred: false,
            deletedAt: null,
            folderId,
            path: null,
          });
        }
        setFiles((prev) => [...created, ...prev]);
        return;
      }

      if (!user) throw new Error("Sign in before uploading.");
      const supabase = getClient();

      for (const file of incoming) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${user.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: "3600",
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
        if (uploadError) throw new Error(friendly(uploadError.message));

        const { error: insertError } = await supabase.from("files").insert({
          name: file.name,
          original_name: file.name,
          path,
          size: file.size,
          mime_type: file.type || null,
          user_id: user.id,
          storage_bucket: BUCKET,
          supabase_path: path,
          folder_id: folderId,
        });

        if (insertError) {
          await supabase.storage.from(BUCKET).remove([path]);
          throw new Error(friendly(insertError.message));
        }
      }

      await loadRemote(user.id, profile.fullName);
    },
    [loadRemote, profile.fullName, user],
  );

  const createFolder = useCallback(
    async (name: string): Promise<ActionResult> => {
      const clean = name.trim();
      if (!clean) return { error: "Give the folder a name." };
      if (clean.length > 60) return { error: "Keep the folder name under 60 characters." };

      if (MODE === "demo") {
        const folder: CloudFolder = {
          id: newId(),
          name: clean,
          parentId: null,
          createdAt: new Date().toISOString(),
        };
        setFolders((prev) => [folder, ...prev]);
        return {};
      }

      if (!user) return { error: "Sign in first." };
      const { error } = await getClient().from("folders").insert({
        name: clean,
        path: `/${clean}`,
        user_id: user.id,
        parent_id: null,
      });
      if (error) return { error: friendly(error.message) };

      const folder: CloudFolder = {
        id: newId(),
        name: clean,
        parentId: null,
        createdAt: new Date().toISOString(),
      };
      setFolders((prev) => [folder, ...prev]);
      return {};
    },
    [user],
  );

  const renameFile = useCallback(async (id: string, name: string): Promise<ActionResult> => {
    const clean = name.trim();
    if (!clean) return { error: "A file needs a name." };
    if (clean.length > 120) return { error: "Keep the file name under 120 characters." };

    if (MODE === "demo") {
      setFiles((prev) =>
        prev.map((file) => (file.id === id ? { ...file, name: clean, updatedAt: new Date().toISOString() } : file)),
      );
      return {};
    }

    const { error } = await getClient().from("files").update({ name: clean }).eq("id", id);
    if (error) return { error: friendly(error.message) };
    setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, name: clean } : file)));
    return {};
  }, []);

  const toggleStar = useCallback(async (id: string): Promise<ActionResult> => {
    const target = files.find((file) => file.id === id);
    if (!target) return { error: "File not found." };
    const next = !target.starred;

    if (MODE === "demo") {
      setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, starred: next } : file)));
      return {};
    }

    const { error } = await getClient().from("files").update({ starred: next }).eq("id", id);
    if (error) return { error: friendly(error.message) };
    setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, starred: next } : file)));
    return {};
  }, [files]);

  const trashFile = useCallback(async (id: string): Promise<ActionResult> => {
    const now = new Date().toISOString();

    if (MODE === "demo") {
      setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, deletedAt: now } : file)));
      return {};
    }

    const { error } = await getClient().from("files").update({ deleted_at: now }).eq("id", id);
    if (error) return { error: friendly(error.message) };
    setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, deletedAt: now } : file)));
    return {};
  }, []);

  const restoreFile = useCallback(async (id: string): Promise<ActionResult> => {
    if (MODE === "demo") {
      setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, deletedAt: null } : file)));
      return {};
    }

    const { error } = await getClient().from("files").update({ deleted_at: null }).eq("id", id);
    if (error) return { error: friendly(error.message) };
    setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, deletedAt: null } : file)));
    return {};
  }, []);

  const deleteForever = useCallback(
    async (id: string): Promise<ActionResult> => {
      const target = files.find((file) => file.id === id);
      if (!target) return { error: "File not found." };

      if (MODE === "demo") {
        await deleteBlob(id);
        setFiles((prev) => prev.filter((file) => file.id !== id));
        return {};
      }

      const supabase = getClient();
      if (target.path) {
        const { error } = await supabase.storage.from(BUCKET).remove([target.path]);
        if (error) return { error: friendly(error.message) };
      }
      const { error } = await supabase.from("files").delete().eq("id", id);
      if (error) return { error: friendly(error.message) };
      setFiles((prev) => prev.filter((file) => file.id !== id));
      return {};
    },
    [files],
  );

  const updateProfile = useCallback(
    async (fullName: string): Promise<ActionResult> => {
      const clean = fullName.trim();
      if (!clean) return { error: "Your name can't be empty." };

      if (isDemo) {
        setAccounts((prev) =>
          prev.map((account) =>
            account.email === sessionEmail ? { ...account, name: clean } : account,
          ),
        );
        setProfile((prev) => ({ ...prev, fullName: clean }));
        setUser((prev) => (prev ? { ...prev, name: clean } : prev));
        return {};
      }

      if (!user) return { error: "Sign in first." };
      const { error } = await getClient().from("profiles").update({ full_name: clean }).eq("id", user.id);
      if (error) return { error: friendly(error.message) };
      setProfile((prev) => ({ ...prev, fullName: clean }));
      setUser((prev) => (prev ? { ...prev, name: clean } : prev));
      return {};
    },
    [isDemo, sessionEmail, user, setAccounts, setProfile, setUser],
  );

  const downloadFile = useCallback(async (file: CloudFile) => {
    if (MODE === "demo") {
      const blob = await getBlob(file.id);
      if (!blob) {
        throw new Error("This sample has no attachment. Upload your own file to try downloading.");
      }
      triggerDownload(blob, file.name);
      return;
    }

    if (!file.path) throw new Error("This file has no storage path.");
    const { data, error } = await getClient().storage.from(BUCKET).createSignedUrl(file.path, 60);
    if (error) throw new Error(friendly(error.message));
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }, []);

  const getPreviewUrl = useCallback(async (file: CloudFile): Promise<string | null> => {
    if (MODE === "demo") {
      const blob = await getBlob(file.id);
      return blob ? URL.createObjectURL(blob) : null;
    }

    if (!file.path) return null;
    const { data, error } = await getClient().storage.from(BUCKET).createSignedUrl(file.path, 3_600);
    return error ? null : data.signedUrl;
  }, []);

  const storageUsed = useMemo(
    () => files.filter((file) => !file.deletedAt).reduce((total, file) => total + file.size, 0),
    [files],
  );

  const value = useMemo<CloudContextValue>(
    () => ({
      mode: MODE,
      ready,
      user,
      profile,
      files,
      folders,
      storageUsed,
      signIn,
      signUp,
      signInDemo,
      signOut,
      uploadFiles,
      createFolder,
      renameFile,
      toggleStar,
      trashFile,
      restoreFile,
      deleteForever,
      updateProfile,
      downloadFile,
      getPreviewUrl,
    }),
    [
      ready,
      user,
      profile,
      files,
      folders,
      storageUsed,
      signIn,
      signUp,
      signInDemo,
      signOut,
      uploadFiles,
      createFolder,
      renameFile,
      toggleStar,
      trashFile,
      restoreFile,
      deleteForever,
      updateProfile,
      downloadFile,
      getPreviewUrl,
    ],
  );

  return <CloudContext.Provider value={value}>{children}</CloudContext.Provider>;
}

export function useCloud(): CloudContextValue {
  const value = useContext(CloudContext);
  if (!value) throw new Error("useCloud must be used inside <CloudProvider>.");
  return value;
}
