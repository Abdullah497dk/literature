import { supabase, isSupabaseConfigured } from './supabase';
import { demoStore } from './demoStore';

export const submissionsService = {
  async getSubmissionsByClass(classId) {
    if (!isSupabaseConfigured) {
      const subs = demoStore.data.submissions
        .filter(s => s.class_id === classId && !s.deleted_at)
        .map(s => {
          const student = demoStore.data.profiles.find(p => p.id === s.student_id);
          const assignment = demoStore.data.assignments.find(a => a.id === s.assignment_id);
          return { ...s, student, assignment };
        });
      return { data: subs, error: null };
    }

    const { data, error } = await supabase
      .from('submissions')
      .select('*, student:profiles!submissions_student_id_fkey(*), assignment:assignments(*)')
      .eq('class_id', classId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getMySubmissions(studentId) {
    if (!isSupabaseConfigured) {
      const subs = demoStore.data.submissions
        .filter(s => s.student_id === studentId && !s.deleted_at)
        .map(s => {
          const assignment = demoStore.data.assignments.find(a => a.id === s.assignment_id);
          const cls = demoStore.data.classes.find(c => c.id === s.class_id);
          const fb = demoStore.data.feedback.find(f => f.submission_id === s.id);
          return { ...s, assignment, class: cls, feedback: fb ? [fb] : [] };
        });
      return { data: subs, error: null };
    }

    const { data, error } = await supabase
      .from('submissions')
      .select('*, assignment:assignments(*), class:classes(*), feedback(*)')
      .eq('student_id', studentId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getSubmissionById(submissionId) {
    if (!isSupabaseConfigured) {
      const sub = demoStore.data.submissions.find(s => s.id === submissionId && !s.deleted_at);
      if (!sub) return { data: null, error: { message: 'Ödev teslimi bulunamadı' } };

      const student = demoStore.data.profiles.find(p => p.id === sub.student_id);
      const assignment = demoStore.data.assignments.find(a => a.id === sub.assignment_id);
      const cls = demoStore.data.classes.find(c => c.id === sub.class_id);
      const fb = demoStore.data.feedback.filter(f => f.submission_id === sub.id);

      return { data: { ...sub, student, assignment, class: cls, feedback: fb }, error: null };
    }

    const { data, error } = await supabase
      .from('submissions')
      .select('*, student:profiles!submissions_student_id_fkey(*), assignment:assignments(*), class:classes(*), feedback(*)')
      .eq('id', submissionId)
      .is('deleted_at', null)
      .single();

    return { data, error };
  },

  async getAllSubmissions() {
    if (!isSupabaseConfigured) {
      const subs = demoStore.data.submissions
        .filter(s => !s.deleted_at)
        .map(s => {
          const student = demoStore.data.profiles.find(p => p.id === s.student_id);
          const assignment = demoStore.data.assignments.find(a => a.id === s.assignment_id);
          const cls = demoStore.data.classes.find(c => c.id === s.class_id);
          return { ...s, student, assignment, class: cls };
        });
      return { data: subs, error: null };
    }

    const { data, error } = await supabase
      .from('submissions')
      .select('*, student:profiles!submissions_student_id_fkey(*), assignment:assignments(*), class:classes(*)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async uploadPdfFile(file, classId, studentId) {
    // Validation
    if (!file) throw new Error('Lütfen bir PDF dosyası seçin.');
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Yalnızca PDF formatındaki dosyalar kabul edilir.');
    }
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      throw new Error('Dosya boyutu 10 MB sınırını aşamaz.');
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const storagePath = `${classId}/${studentId}/${Date.now()}_${randomSuffix}_${safeName}`;

    if (!isSupabaseConfigured) {
      // In demo mode, create an object URL for preview
      const demoUrl = URL.createObjectURL(file);
      return {
        path: storagePath,
        originalFilename: file.name,
        fileSize: file.size,
        previewUrl: demoUrl
      };
    }

    const { data, error } = await supabase.storage
      .from('homework-submissions')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    return {
      path: data.path,
      originalFilename: file.name,
      fileSize: file.size
    };
  },

  async getSignedPdfUrl(filePath) {
    if (!isSupabaseConfigured) {
      const sub = demoStore.data.submissions.find(s => s.file_path === filePath);
      if (sub && sub.pdf_url) return { url: sub.pdf_url, error: null };
      return { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', error: null };
    }

    const { data, error } = await supabase.storage
      .from('homework-submissions')
      .createSignedUrl(filePath, 3600); // 1 hour valid

    return { url: data?.signedUrl || null, error };
  },

  async createSubmission({ assignment_id, class_id, student_id, file_path, original_filename, file_size, student_note, demoPreviewUrl }) {
    if (!isSupabaseConfigured) {
      const newSub = {
        id: `sub-${Date.now()}`,
        assignment_id,
        class_id,
        student_id,
        file_path,
        original_filename,
        file_size,
        review_status: 'not_reviewed',
        reviewed_at: null,
        reviewed_by: null,
        student_note: student_note || '',
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pdf_url: demoPreviewUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      };
      demoStore.data.submissions.push(newSub);

      // Create notification for teachers of class
      const cls = demoStore.data.classes.find(c => c.id === class_id);
      const student = demoStore.data.profiles.find(p => p.id === student_id);
      const asg = demoStore.data.assignments.find(a => a.id === assignment_id);

      demoStore.data.notifications.push({
        id: `notif-${Date.now()}`,
        recipient_id: 'usr-teacher-1',
        type: 'new_submission',
        title: 'Yeni Ödev Teslimi',
        message: `${student?.full_name || 'Öğrenci'} "${asg?.title || 'Ödev'}" başlıklı ödevini yükledi.`,
        submission_id: newSub.id,
        class_id,
        read_at: null,
        created_at: new Date().toISOString()
      });

      demoStore.save();
      return { data: newSub, error: null };
    }

    return await supabase
      .from('submissions')
      .insert({
        assignment_id,
        class_id,
        student_id,
        file_path,
        original_filename,
        file_size,
        student_note: student_note || '',
        review_status: 'not_reviewed'
      })
      .select()
      .single();
  },

  async updateSubmission(submissionId, updates) {
    if (!isSupabaseConfigured) {
      const sub = demoStore.data.submissions.find(s => s.id === submissionId);
      if (!sub) return { data: null, error: { message: 'Ödev bulunamadı' } };

      const oldPath = sub.file_path;
      Object.assign(sub, updates, { updated_at: new Date().toISOString() });

      // If PDF file path changed, reset review status
      if (updates.file_path && updates.file_path !== oldPath) {
        sub.review_status = 'not_reviewed';
        sub.reviewed_at = null;
        sub.reviewed_by = null;
      }

      demoStore.save();
      return { data: sub, error: null };
    }

    return await supabase
      .from('submissions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', submissionId)
      .select()
      .single();
  },

  async markAsReviewed(submissionId, teacherId, isReviewed = true) {
    const review_status = isReviewed ? 'reviewed' : 'not_reviewed';
    const reviewed_at = isReviewed ? new Date().toISOString() : null;
    const reviewed_by = isReviewed ? teacherId : null;

    if (!isSupabaseConfigured) {
      const sub = demoStore.data.submissions.find(s => s.id === submissionId);
      if (sub) {
        sub.review_status = review_status;
        sub.reviewed_at = reviewed_at;
        sub.reviewed_by = reviewed_by;
        sub.updated_at = new Date().toISOString();

        if (isReviewed) {
          const asg = demoStore.data.assignments.find(a => a.id === sub.assignment_id);
          demoStore.data.notifications.push({
            id: `notif-${Date.now()}`,
            recipient_id: sub.student_id,
            type: 'review_completed',
            title: 'Ödeviniz İncelendi',
            message: `"${asg?.title || 'Ödev'}" başlıklı ödeviniz öğretmen tarafından incelendi olarak işaretlendi.`,
            submission_id: sub.id,
            class_id: sub.class_id,
            read_at: null,
            created_at: new Date().toISOString()
          });
        }
        demoStore.save();
      }
      return { data: sub, error: null };
    }

    return await supabase
      .from('submissions')
      .update({
        review_status,
        reviewed_at,
        reviewed_by,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single();
  },

  async deleteSubmission(submissionId) {
    if (!isSupabaseConfigured) {
      const sub = demoStore.data.submissions.find(s => s.id === submissionId);
      if (sub) {
        sub.deleted_at = new Date().toISOString();
        demoStore.save();
      }
      return { data: sub, error: null };
    }

    return await supabase
      .from('submissions')
      .delete()
      .eq('id', submissionId);
  }
};

export default submissionsService;
