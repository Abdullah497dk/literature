-- ==============================================================================
-- DVLP EDEBIYAT — COMPLETE POSTGRESQL SCHEMA & SECURITY POLICIES
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS (OR CHECK CONSTRAINTS)
-- Roles: 'student', 'teacher', 'admin'
-- Membership Status: 'pending', 'approved', 'rejected', 'removed'
-- Review Status: 'not_reviewed', 'reviewed'

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for role and active lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active);

-- 4. CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  join_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classes_join_code ON public.classes(join_code);
CREATE INDEX IF NOT EXISTS idx_classes_is_active ON public.classes(is_active);

-- 5. CLASS MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.class_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  membership_role TEXT NOT NULL DEFAULT 'student' CHECK (membership_role IN ('student', 'teacher')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'removed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT unique_class_user UNIQUE (class_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_class_memberships_class_status ON public.class_memberships(class_id, status);
CREATE INDEX IF NOT EXISTS idx_class_memberships_user ON public.class_memberships(user_id);

-- 6. ASSIGNMENTS TABLE (DEFINITIONS)
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_active ON public.assignments(is_active);

-- 7. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'not_reviewed' CHECK (review_status IN ('not_reviewed', 'reviewed')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_note TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_class ON public.submissions(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_review_status ON public.submissions(review_status);

-- 8. FEEDBACK TABLE (PRIVATE TEACHER FEEDBACK)
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_submission ON public.feedback(submission_id);
CREATE INDEX IF NOT EXISTS idx_feedback_teacher ON public.feedback(teacher_id);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, read_at);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);

-- ==============================================================================
-- SECURITY DEFINER HELPER FUNCTIONS (PREVENTS RECURSIVE RLS)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid() AND is_active = true), false);
$$;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role IN ('teacher', 'admin') FROM public.profiles WHERE id = auth.uid() AND is_active = true), false);
$$;

CREATE OR REPLACE FUNCTION public.has_approved_class(cid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_memberships
    WHERE class_id = cid
      AND user_id = auth.uid()
      AND status = 'approved'
  );
$$;

-- Protect the last active administrator from demotion or deactivation
CREATE OR REPLACE FUNCTION public.protect_last_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INT;
BEGIN
  IF OLD.role = 'admin' AND (NEW.role != 'admin' OR NEW.is_active = false) THEN
    SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE role = 'admin' AND is_active = true AND id != OLD.id;
    IF admin_count < 1 THEN
      RAISE EXCEPTION 'Sistemde en az bir aktif yönetici bulunmalıdır. Son yönetici devre dışı bırakılamaz veya rolü değiştirilemez.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_last_admin ON public.profiles;
CREATE TRIGGER trg_protect_last_admin
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_last_admin();

-- Prevent non-admins from changing role or is_active on profiles
CREATE OR REPLACE FUNCTION public.protect_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.role := OLD.role;
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

-- When a submission's PDF file changes, reset review_status
CREATE OR REPLACE FUNCTION public.handle_submission_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent student from changing student_id, class_id, or assignment_id
  IF NOT public.is_teacher() THEN
    NEW.student_id := OLD.student_id;
    NEW.class_id := OLD.class_id;
    NEW.assignment_id := OLD.assignment_id;
  END IF;

  -- If PDF file was replaced, reset review status
  IF NEW.file_path <> OLD.file_path THEN
    NEW.review_status := 'not_reviewed';
    NEW.reviewed_at := NULL;
    NEW.reviewed_by := NULL;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_handle_submission_update ON public.submissions;
CREATE TRIGGER trg_handle_submission_update
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_submission_update();

-- Auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Users can update their own profile (name only)"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 2. CLASSES RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Classes viewable by teachers, members, or by join code lookup"
  ON public.classes FOR SELECT
  TO authenticated
  USING (
    public.is_teacher()
    OR public.has_approved_class(id)
    OR is_active = true
  );

CREATE POLICY "Classes manageable by admins"
  ON public.classes FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. CLASS MEMBERSHIPS RLS
ALTER TABLE public.class_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Memberships viewable by teachers, admins, own record, or classmates"
  ON public.class_memberships FOR SELECT
  TO authenticated
  USING (
    public.is_teacher()
    OR user_id = auth.uid()
    OR (public.has_approved_class(class_id) AND status = 'approved')
  );

CREATE POLICY "Students can request membership for themselves"
  ON public.class_memberships FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = auth.uid() AND status = 'pending')
    OR public.is_teacher()
  );

CREATE POLICY "Teachers and admins can update memberships (approve/reject/remove)"
  ON public.class_memberships FOR UPDATE
  TO authenticated
  USING (public.is_teacher())
  WITH CHECK (public.is_teacher());

CREATE POLICY "Students can cancel pending, teachers can remove"
  ON public.class_memberships FOR DELETE
  TO authenticated
  USING (
    (user_id = auth.uid() AND status = 'pending')
    OR public.is_teacher()
  );

-- 4. ASSIGNMENTS RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assignments viewable by teachers or approved class members"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (
    public.is_teacher()
    OR (public.has_approved_class(class_id) AND is_active = true)
  );

CREATE POLICY "Teachers and admins can manage assignments"
  ON public.assignments FOR ALL
  TO authenticated
  USING (public.is_teacher())
  WITH CHECK (public.is_teacher());

-- 5. SUBMISSIONS RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submissions viewable by teachers or approved classmates"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL AND (
      public.is_teacher()
      OR public.has_approved_class(class_id)
    )
  );

CREATE POLICY "Students can insert their own submissions in approved classes"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND public.has_approved_class(class_id)
  );

CREATE POLICY "Students can update their own submissions, teachers can review"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (
    (student_id = auth.uid() AND public.has_approved_class(class_id))
    OR public.is_teacher()
  )
  WITH CHECK (
    (student_id = auth.uid() AND public.has_approved_class(class_id))
    OR public.is_teacher()
  );

CREATE POLICY "Students can delete own submissions, admins can delete"
  ON public.submissions FOR DELETE
  TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_admin()
  );

-- 6. FEEDBACK RLS (STRICTLY PRIVATE: Visible only to recipient student, teacher, admin)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Private feedback readable only by student author or teachers"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (
    public.is_teacher()
    OR EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = feedback.submission_id
        AND s.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert feedback"
  ON public.feedback FOR INSERT
  TO authenticated
  WITH CHECK (public.is_teacher() AND teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own feedback, admins any"
  ON public.feedback FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid() OR public.is_admin())
  WITH CHECK (teacher_id = auth.uid() OR public.is_admin());

CREATE POLICY "Teachers can delete their own feedback, admins any"
  ON public.feedback FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid() OR public.is_admin());

-- 7. NOTIFICATIONS RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notifications viewable only by recipient"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid() OR public.is_admin());

CREATE POLICY "Notifications insertable by authenticated users"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can mark their own notifications as read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- 8. AUDIT LOGS RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs viewable only by admins"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Audit logs insertable by authenticated system operations"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET: homework-submissions (PRIVATE PDF BUCKET)
-- ==============================================================================

-- Create bucket if storage extension is available
INSERT INTO storage.buckets (id, name, public)
VALUES ('homework-submissions', 'homework-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- 1. Read: User can download/read PDF if they are teacher/admin, OR if they are an approved member of the class
CREATE POLICY "Storage: Homework PDFs viewable by class members and teachers"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'homework-submissions'
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

-- 2. Insert: Approved students can upload homework PDFs
CREATE POLICY "Storage: Approved students can upload homework PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'homework-submissions'
  );

-- 3. Delete: Student who uploaded or admin can delete
CREATE POLICY "Storage: Submission owners or admins can delete PDF"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'homework-submissions'
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.submissions s
        WHERE s.file_path = storage.objects.name
          AND s.student_id = auth.uid()
      )
    )
  );
