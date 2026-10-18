-- ==============================================================================
-- MIGRATION: Add account_status and update approval & RLS security model
-- ==============================================================================

-- 1. Add account_status column to profiles table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'account_status'
  ) THEN
    ALTER TABLE public.profiles 
      ADD COLUMN account_status TEXT NOT NULL DEFAULT 'pending' 
      CHECK (account_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- 2. Index for account_status
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);

-- 3. Mark existing admins, teachers, and seed users as 'approved' so existing accounts are not locked out
UPDATE public.profiles
SET account_status = 'approved'
WHERE role IN ('admin', 'teacher') OR account_status IS NULL;

-- 4. Secure handle_new_user trigger function
-- Enforces that self-registration always assigns role = 'student' and account_status = 'pending'.
-- User metadata is NEVER trusted for role promotion or approval bypass.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, account_status, is_active)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), split_part(NEW.email, '@', 1)),
    'student',
    'pending',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Protect profile changes trigger
-- Non-admins cannot alter their role, account_status, or is_active state
CREATE OR REPLACE FUNCTION public.protect_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.account_status := OLD.account_status;
    NEW.is_active := OLD.is_active;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_changes ON public.profiles;
CREATE TRIGGER trg_protect_profile_changes
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_changes();

-- 6. Helper Security Functions (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT is_active = true AND account_status = 'approved' 
    FROM public.profiles 
    WHERE id = auth.uid()
  ), false);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT role = 'admin' AND is_active = true AND account_status = 'approved' 
    FROM public.profiles 
    WHERE id = auth.uid()
  ), false);
$$;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT role IN ('teacher', 'admin') AND is_active = true AND account_status = 'approved' 
    FROM public.profiles 
    WHERE id = auth.uid()
  ), false);
$$;

CREATE OR REPLACE FUNCTION public.has_approved_class(cid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_memberships cm
    JOIN public.profiles p ON p.id = cm.user_id
    WHERE cm.class_id = cid
      AND cm.user_id = auth.uid()
      AND cm.status = 'approved'
      AND p.is_active = true
      AND p.account_status = 'approved'
  );
$$;

-- 7. Update RLS Policies on public.profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() -- A user can always view their own profile (including when pending approval)
    OR (public.is_approved_user() AND (is_active = true OR public.is_admin()))
  );

-- 8. Update Classes RLS Policies
DROP POLICY IF EXISTS "Classes viewable by teachers, members, or by join code lookup" ON public.classes;
CREATE POLICY "Classes viewable by teachers, members, or by join code lookup"
  ON public.classes FOR SELECT
  TO authenticated
  USING (
    public.is_approved_user() AND (
      public.is_teacher()
      OR public.has_approved_class(id)
      OR is_active = true
    )
  );

-- 9. Update Class Memberships RLS Policies
DROP POLICY IF EXISTS "Memberships viewable by teachers, admins, own record, or classmates" ON public.class_memberships;
CREATE POLICY "Memberships viewable by teachers, admins, own record, or classmates"
  ON public.class_memberships FOR SELECT
  TO authenticated
  USING (
    public.is_approved_user() AND (
      public.is_teacher()
      OR user_id = auth.uid()
      OR (public.has_approved_class(class_id) AND status = 'approved')
    )
  );

DROP POLICY IF EXISTS "Students can request membership for themselves" ON public.class_memberships;
CREATE POLICY "Students can request membership for themselves"
  ON public.class_memberships FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_approved_user() AND (
      (user_id = auth.uid() AND status = 'pending')
      OR public.is_teacher()
    )
  );

-- 10. Update Assignments RLS Policies
DROP POLICY IF EXISTS "Assignments viewable by teachers or approved class members" ON public.assignments;
CREATE POLICY "Assignments viewable by teachers or approved class members"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (
    public.is_approved_user() AND (
      public.is_teacher()
      OR (public.has_approved_class(class_id) AND is_active = true)
    )
  );

-- 11. Update Submissions RLS Policies
DROP POLICY IF EXISTS "Submissions viewable by teachers or approved classmates" ON public.submissions;
CREATE POLICY "Submissions viewable by teachers or approved classmates"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    public.is_approved_user() AND deleted_at IS NULL AND (
      public.is_teacher()
      OR public.has_approved_class(class_id)
    )
  );

DROP POLICY IF EXISTS "Students can insert their own submissions in approved classes" ON public.submissions;
CREATE POLICY "Students can insert their own submissions in approved classes"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_approved_user() AND student_id = auth.uid() AND public.has_approved_class(class_id)
  );

-- 12. Storage Policies
DROP POLICY IF EXISTS "Storage: Homework PDFs viewable by class members and teachers" ON storage.objects;
CREATE POLICY "Storage: Homework PDFs viewable by class members and teachers"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'homework-submissions'
    AND public.is_approved_user()
    AND (
      public.is_teacher()
      OR EXISTS (
        SELECT 1 FROM public.submissions s
        WHERE s.file_path = storage.objects.name
          AND s.deleted_at IS NULL
          AND public.has_approved_class(s.class_id)
      )
    )
  );
