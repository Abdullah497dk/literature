import { supabase, isSupabaseConfigured } from './supabase';
import { demoStore } from './demoStore';

export const feedbackService = {
  async getFeedbackBySubmission(submissionId, currentUserId, currentUserRole) {
    if (!isSupabaseConfigured) {
      const sub = demoStore.data.submissions.find(s => s.id === submissionId);
      if (!sub) return { data: [], error: null };

      // Strictly enforce access control
      if (currentUserRole === 'student' && sub.student_id !== currentUserId) {
        return { data: [], error: { message: 'Özel öğretmen yorumlarına yalnızca ödev sahibi erişebilir.' } };
      }

      const fb = demoStore.data.feedback
        .filter(f => f.submission_id === submissionId)
        .map(f => {
          const teacher = demoStore.data.profiles.find(p => p.id === f.teacher_id);
          return { ...f, teacher };
        });

      return { data: fb, error: null };
    }

    const { data, error } = await supabase
      .from('feedback')
      .select('*, teacher:profiles!feedback_teacher_id_fkey(*)')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true });

    return { data, error };
  },

  async addFeedback({ submission_id, teacher_id, content }) {
    if (!isSupabaseConfigured) {
      const newFb = {
        id: `fb-${Date.now()}`,
        submission_id,
        teacher_id,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      demoStore.data.feedback.push(newFb);

      // Create notification for student
      const sub = demoStore.data.submissions.find(s => s.id === submission_id);
      if (sub) {
        demoStore.data.notifications.push({
          id: `notif-${Date.now()}`,
          recipient_id: sub.student_id,
          type: 'feedback_added',
          title: 'Öğretmeniniz Geri Bildirim Ekledi',
          message: 'Öğretmeniniz teslim ettiğiniz ödeve özel bir inceleme notu ekledi.',
          submission_id,
          class_id: sub.class_id,
          read_at: null,
          created_at: new Date().toISOString()
        });
      }

      demoStore.save();
      return { data: newFb, error: null };
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        submission_id,
        teacher_id,
        content
      })
      .select('*, teacher:profiles!feedback_teacher_id_fkey(*)')
      .single();

    return { data, error };
  },

  async updateFeedback(feedbackId, content) {
    if (!isSupabaseConfigured) {
      const fb = demoStore.data.feedback.find(f => f.id === feedbackId);
      if (fb) {
        fb.content = content;
        fb.updated_at = new Date().toISOString();
        demoStore.save();
      }
      return { data: fb, error: null };
    }

    return await supabase
      .from('feedback')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', feedbackId)
      .select('*, teacher:profiles!feedback_teacher_id_fkey(*)')
      .single();
  },

  async deleteFeedback(feedbackId) {
    if (!isSupabaseConfigured) {
      const idx = demoStore.data.feedback.findIndex(f => f.id === feedbackId);
      if (idx !== -1) {
        demoStore.data.feedback.splice(idx, 1);
        demoStore.save();
      }
      return { data: true, error: null };
    }

    return await supabase
      .from('feedback')
      .delete()
      .eq('id', feedbackId);
  }
};

export default feedbackService;
