import { supabase, isSupabaseConfigured } from './supabase';
import { demoStore } from './demoStore';

export const usersService = {
  async getAllUsers() {
    if (!isSupabaseConfigured) {
      return { data: demoStore.data.profiles, error: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async updateUserRole(targetUserId, newRole, adminUserId) {
    if (!isSupabaseConfigured) {
      const target = demoStore.data.profiles.find(p => p.id === targetUserId);
      if (!target) return { data: null, error: { message: 'Kullanıcı bulunamadı' } };

      // Protection: cannot demote the last active admin
      if (target.role === 'admin' && newRole !== 'admin') {
        const adminCount = demoStore.data.profiles.filter(p => p.role === 'admin' && p.is_active).length;
        if (adminCount <= 1) {
          return { data: null, error: { message: 'Sistemdeki son aktif yönetici rolü değiştirilemez.' } };
        }
      }

      target.role = newRole;
      target.updated_at = new Date().toISOString();

      demoStore.data.audit_logs.push({
        id: `aud-${Date.now()}`,
        user_id: adminUserId,
        action: 'role_changed',
        entity_type: 'user',
        entity_id: targetUserId,
        details: { new_role: newRole },
        created_at: new Date().toISOString()
      });

      demoStore.save();
      return { data: target, error: null };
    }

    // Check last admin protection via function/query
    if (newRole !== 'admin') {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('is_active', true);

      if (count <= 1) {
        // verify if this is the only admin
        const { data: current } = await supabase.from('profiles').select('role').eq('id', targetUserId).single();
        if (current?.role === 'admin') {
          return { data: null, error: { message: 'Sistemdeki son aktif yönetici rolü değiştirilemez.' } };
        }
      }
    }

    return await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', targetUserId)
      .select()
      .single();
  },

  async toggleUserActive(targetUserId, currentIsActive, adminUserId) {
    const nextIsActive = !currentIsActive;

    if (!isSupabaseConfigured) {
      const target = demoStore.data.profiles.find(p => p.id === targetUserId);
      if (!target) return { data: null, error: { message: 'Kullanıcı bulunamadı' } };

      // Protection: cannot deactivate the last active admin
      if (target.role === 'admin' && !nextIsActive) {
        const adminCount = demoStore.data.profiles.filter(p => p.role === 'admin' && p.is_active).length;
        if (adminCount <= 1) {
          return { data: null, error: { message: 'Sistemdeki son aktif yönetici hesabı dondurulamaz.' } };
        }
      }

      target.is_active = nextIsActive;
      target.updated_at = new Date().toISOString();

      demoStore.data.audit_logs.push({
        id: `aud-${Date.now()}`,
        user_id: adminUserId,
        action: nextIsActive ? 'account_reactivated' : 'account_deactivated',
        entity_type: 'user',
        entity_id: targetUserId,
        details: { is_active: nextIsActive },
        created_at: new Date().toISOString()
      });

      demoStore.save();
      return { data: target, error: null };
    }

    return await supabase
      .from('profiles')
      .update({ is_active: nextIsActive, updated_at: new Date().toISOString() })
      .eq('id', targetUserId)
      .select()
      .single();
  },

  async deleteUser(targetUserId, adminUserId) {
    if (!isSupabaseConfigured) {
      const target = demoStore.data.profiles.find(p => p.id === targetUserId);
      if (target?.role === 'admin') {
        const adminCount = demoStore.data.profiles.filter(p => p.role === 'admin' && p.is_active).length;
        if (adminCount <= 1) {
          return { data: null, error: { message: 'Son aktif yönetici hesabı silinemez.' } };
        }
      }

      const idx = demoStore.data.profiles.findIndex(p => p.id === targetUserId);
      if (idx !== -1) {
        demoStore.data.profiles.splice(idx, 1);
        demoStore.save();
      }
      return { data: true, error: null };
    }

    return await supabase
      .from('profiles')
      .delete()
      .eq('id', targetUserId);
  },

  async getAuditLogs() {
    if (!isSupabaseConfigured) {
      const logs = demoStore.data.audit_logs.map(log => {
        const actor = demoStore.data.profiles.find(p => p.id === log.user_id);
        return { ...log, actor };
      });
      return { data: logs, error: null };
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, actor:profiles!audit_logs_user_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(50);

    return { data, error };
  }
};

export default usersService;
