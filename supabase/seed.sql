-- ==============================================================================
-- DVLP EDEBIYAT — SEED DATA & ADMIN PROVISIONING
-- ==============================================================================

-- HOW TO ASSIGN AN ADMINISTRATOR VIA SUPABASE SQL EDITOR:
-- Method A (Recommended - single function call):
-- SELECT public.assign_admin('your_email@gmail.com');
--
-- Method B (Direct SQL UPDATE):
-- UPDATE public.profiles
-- SET role = 'admin', account_status = 'approved', is_active = true
-- WHERE id = (SELECT id FROM auth.users WHERE LOWER(email) = 'your_email@gmail.com');
--
-- VERIFICATION QUERY:
-- SELECT id, full_name, role, account_status, is_active FROM public.profiles 
-- WHERE id = (SELECT id FROM auth.users WHERE LOWER(email) = 'your_email@gmail.com');

-- SAMPLE STARTER CLASSES (Optional)
-- Run this after setting up tables if you want default classes ready:
INSERT INTO public.classes (id, name, description, join_code, is_active)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', '9-A', '9. Sınıf Türk Dili ve Edebiyatı Şubesi A', 'EDEB-9A', true),
  ('a0000000-0000-0000-0000-000000000002', '9-B', '9. Sınıf Türk Dili ve Edebiyatı Şubesi B', 'EDEB-9B', true),
  ('a0000000-0000-0000-0000-000000000003', '10-A', '10. Sınıf Türk Dili ve Edebiyatı Şubesi A', 'EDEB-10A', true),
  ('a0000000-0000-0000-0000-000000000004', '10-B', '10. Sınıf Türk Dili ve Edebiyatı Şubesi B', 'EDEB-10B', true)
ON CONFLICT (join_code) DO NOTHING;

-- SAMPLE INITIAL ASSIGNMENTS
INSERT INTO public.assignments (id, class_id, title, description, is_active, due_at)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Haksızlık Üzerine Deneme',
    'Adalet ve haksızlık kavramlarını klasik Türk edebiyatı metinlerinden örneklerle ele alan en az 2 sayfalık PDF deneme hazırlayınız.',
    true,
    now() + interval '14 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Dede Korkut Hikayeleri İncelemesi',
    'Dirse Han Oğlu Boğaç Han boyundaki karakter tahlilleri ve kültürel motifleri PDF formatında teslim ediniz.',
    true,
    now() + interval '21 days'
  )
ON CONFLICT (id) DO NOTHING;
