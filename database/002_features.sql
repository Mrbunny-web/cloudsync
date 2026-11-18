-- Extra columns and policies used by the redesigned UI.
-- Run this after database/schema.sql. Safe to run more than once.

ALTER TABLE files ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS files_user_created_idx ON files (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS files_user_starred_idx ON files (user_id, starred);
CREATE INDEX IF NOT EXISTS files_user_deleted_idx ON files (user_id, deleted_at);

-- Keep updated_at fresh on edits.
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS files_touch_updated_at ON files;
CREATE TRIGGER files_touch_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Rename, star, trash and restore all write to files.
DROP POLICY IF EXISTS "Users can update own files" ON files;
CREATE POLICY "Users can update own files" ON files
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Profile rows for accounts created before the trigger existed.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Private storage bucket policies. Create the "cloudsync" bucket first.
-- Object paths look like <user-id>/<timestamp>-<file-name>.
DROP POLICY IF EXISTS "cloudsync read own objects" ON storage.objects;
CREATE POLICY "cloudsync read own objects" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'cloudsync' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "cloudsync write own objects" ON storage.objects;
CREATE POLICY "cloudsync write own objects" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cloudsync' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "cloudsync update own objects" ON storage.objects;
CREATE POLICY "cloudsync update own objects" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'cloudsync' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "cloudsync delete own objects" ON storage.objects;
CREATE POLICY "cloudsync delete own objects" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'cloudsync' AND (storage.foldername(name))[1] = auth.uid()::text);
