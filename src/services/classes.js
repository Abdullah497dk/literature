import { supabase, isSupabaseConfigured } from './supabase';
import { demoStore } from './demoStore';

export const classesService = {
  async getClasses() {
    if (!isSupabaseConfigured) {
      return { data: demoStore.data.classes, error: null };
    }

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true });

    return { data, error };
  },

  async getClassById(classId) {
    if (!isSupabaseConfigured) {
      const cls = demoStore.data.classes.find(c => c.id === classId);
      return { data: cls || null, error: cls ? null : { message: 'Sınıf bulunamadı' } };
    }

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    return { data, error };
  },

  async getClassByJoinCode(joinCode) {
    const trimmed = (joinCode || '').trim().toUpperCase();
    if (!isSupabaseConfigured) {
      const cls = demoStore.data.classes.find(
        c => c.join_code.toUpperCase() === trimmed && c.is_active
      );
      return { data: cls || null, error: cls ? null : { message: 'Geçersiz veya pasif sınıf kodu' } };
    }

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .ilike('join_code', trimmed)
      .eq('is_active', true)
      .maybeSingle();

    return { data, error };
  },

  async getStudentMemberships(studentId) {
    if (!isSupabaseConfigured) {
      const mems = demoStore.data.memberships
        .filter(m => m.user_id === studentId)
        .map(m => {
          const cls = demoStore.data.classes.find(c => c.id === m.class_id);
          return { ...m, class: cls };
        });
      return { data: mems, error: null };
    }

    const { data, error } = await supabase
      .from('class_memberships')
      .select('*, class:classes(*)')
      .eq('user_id', studentId);

    return { data, error };
  },

  async getClassMembers(classId) {
    if (!isSupabaseConfigured) {
      const mems = demoStore.data.memberships
        .filter(m => m.class_id === classId)
        .map(m => {
          const profile = demoStore.data.profiles.find(p => p.id === m.user_id);
          return { ...m, profile };
        });
      return { data: mems, error: null };
    }

    const { data, error } = await supabase
      .from('class_memberships')
      .select('*, profile:profiles(*)')
      .eq('class_id', classId);

    return { data, error };
  },

  async requestJoinClass(classId, studentId) {
    if (!isSupabaseConfigured) {
      // Check existing
      const existing = demoStore.data.memberships.find(
        m => m.class_id === classId && m.user_id === studentId
      );
      if (existing) {
        if (existing.status === 'approved') {
          return { data: null, error: { message: 'Bu sınıfa zaten üyesiniz.' } };
        }
        if (existing.status === 'pending') {
          return { data: null, error: { message: 'Bu sınıf için katılım talebiniz zaten onay bekliyor.' } };
        }
        // If rejected or removed, update to pending
        existing.status = 'pending';
        existing.requested_at = new Date().toISOString();
        demoStore.save();
        return { data: existing, error: null };
      }

      const newMem = {
        id: `mem-${Date.now()}`,
        class_id: classId,
        user_id: studentId,
        membership_role: 'student',
        status: 'pending',
        requested_at: new Date().toISOString(),
        approved_at: null,
        approved_by: null
      };
      demoStore.data.memberships.push(newMem);
      demoStore.save();
      return { data: newMem, error: null };
    }

    // Check existing in Supabase
    const { data: existing } = await supabase
      .from('class_memberships')
      .select('*')
      .eq('class_id', classId)
      .eq('user_id', studentId)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'approved') {
        return { data: null, error: { message: 'Bu sınıfa zaten üyesiniz.' } };
      }
      if (existing.status === 'pending') {
        return { data: null, error: { message: 'Katılım talebiniz onay bekliyor.' } };
      }
      return await supabase
        .from('class_memberships')
        .update({ status: 'pending', requested_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
    }

    return await supabase
      .from('class_memberships')
      .insert({
        class_id: classId,
        user_id: studentId,
        membership_role: 'student',
        status: 'pending'
      })
      .select()
      .single();
  },

  async updateMembershipStatus(membershipId, status, approverId) {
    const isApproved = status === 'approved';
    const approvedAt = isApproved ? new Date().toISOString() : null;

    if (!isSupabaseConfigured) {
      const mem = demoStore.data.memberships.find(m => m.id === membershipId);
      if (mem) {
        mem.status = status;
        mem.approved_at = approvedAt;
        mem.approved_by = approverId;
        demoStore.save();

        // Create notification for student
        const cls = demoStore.data.classes.find(c => c.id === mem.class_id);
        demoStore.data.notifications.push({
          id: `notif-${Date.now()}`,
          recipient_id: mem.user_id,
          type: isApproved ? 'membership_approved' : 'membership_rejected',
          title: isApproved ? 'Sınıf Katılım Talebi Onaylandı' : 'Sınıf Katılım Talebi Reddedildi',
          message: isApproved 
            ? `"${cls?.name || 'Sınıf'}" sınıfına katılım talebiniz öğretmen tarafından onaylandı.`
            : `"${cls?.name || 'Sınıf'}" sınıfına katılım talebiniz kabul edilmedi.`,
          class_id: mem.class_id,
          submission_id: null,
          read_at: null,
          created_at: new Date().toISOString()
        });
        demoStore.save();
      }
      return { data: mem, error: null };
    }

    return await supabase
      .from('class_memberships')
      .update({
        status,
        approved_at: approvedAt,
        approved_by: approverId
      })
      .eq('id', membershipId)
      .select()
      .single();
  },

  async getAllPendingRequests() {
    if (!isSupabaseConfigured) {
      const pending = demoStore.data.memberships
        .filter(m => m.status === 'pending')
        .map(m => {
          const profile = demoStore.data.profiles.find(p => p.id === m.user_id);
          const cls = demoStore.data.classes.find(c => c.id === m.class_id);
          return { ...m, profile, class: cls };
        });
      return { data: pending, error: null };
    }

    const { data, error } = await supabase
      .from('class_memberships')
      .select('*, profile:profiles(*), class:classes(*)')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    return { data, error };
  },

  async createClass({ name, description, join_code, created_by }) {
    if (!isSupabaseConfigured) {
      const newClass = {
        id: `cls-${Date.now()}`,
        name,
        description,
        join_code: join_code.toUpperCase(),
        is_active: true,
        created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      demoStore.data.classes.push(newClass);
      demoStore.save();
      return { data: newClass, error: null };
    }

    return await supabase
      .from('classes')
      .insert({
        name,
        description,
        join_code: join_code.toUpperCase(),
        created_by
      })
      .select()
      .single();
  },

  async updateClass(classId, updates) {
    if (!isSupabaseConfigured) {
      const cls = demoStore.data.classes.find(c => c.id === classId);
      if (cls) {
        Object.assign(cls, updates, { updated_at: new Date().toISOString() });
        demoStore.save();
      }
      return { data: cls, error: null };
    }

    return await supabase
      .from('classes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', classId)
      .select()
      .single();
  }
};

export default classesService;
