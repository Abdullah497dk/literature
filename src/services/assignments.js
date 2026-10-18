import { supabase, isSupabaseConfigured } from './supabase';
import { demoStore } from './demoStore';

export const assignmentsService = {
  async getAssignmentsByClass(classId, onlyActive = false) {
    if (!isSupabaseConfigured) {
      let list = demoStore.data.assignments.filter(a => a.class_id === classId);
      if (onlyActive) {
        list = list.filter(a => a.is_active);
      }
      return { data: list, error: null };
    }

    let query = supabase
      .from('assignments')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (onlyActive) {
      query = query.eq('is_active', true);
    }

    return await query;
  },

  async getAllAssignments() {
    if (!isSupabaseConfigured) {
      const list = demoStore.data.assignments.map(a => {
        const cls = demoStore.data.classes.find(c => c.id === a.class_id);
        const subCount = demoStore.data.submissions.filter(s => s.assignment_id === a.id && !s.deleted_at).length;
        return { ...a, class: cls, submission_count: subCount };
      });
      return { data: list, error: null };
    }

    const { data, error } = await supabase
      .from('assignments')
      .select('*, class:classes(*)')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getAssignmentById(assignmentId) {
    if (!isSupabaseConfigured) {
      const item = demoStore.data.assignments.find(a => a.id === assignmentId);
      return { data: item || null, error: item ? null : { message: 'Ödev konusu bulunamadı' } };
    }

    return await supabase
      .from('assignments')
      .select('*, class:classes(*)')
      .eq('id', assignmentId)
      .single();
  },

  async createAssignment({ class_id, title, description, due_at, created_by }) {
    if (!isSupabaseConfigured) {
      const newAsg = {
        id: `asg-${Date.now()}`,
        class_id,
        title,
        description,
        due_at: due_at || null,
        is_active: true,
        created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      demoStore.data.assignments.push(newAsg);
      demoStore.save();
      return { data: newAsg, error: null };
    }

    return await supabase
      .from('assignments')
      .insert({
        class_id,
        title,
        description,
        due_at: due_at || null,
        created_by
      })
      .select()
      .single();
  },

  async updateAssignment(assignmentId, updates) {
    if (!isSupabaseConfigured) {
      const item = demoStore.data.assignments.find(a => a.id === assignmentId);
      if (item) {
        Object.assign(item, updates, { updated_at: new Date().toISOString() });
        demoStore.save();
      }
      return { data: item, error: null };
    }

    return await supabase
      .from('assignments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', assignmentId)
      .select()
      .single();
  },

  async toggleAssignmentActive(assignmentId, currentStatus) {
    return await this.updateAssignment(assignmentId, { is_active: !currentStatus });
  }
};

export default assignmentsService;
