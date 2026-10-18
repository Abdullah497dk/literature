import { supabase, isSupabaseConfigured } from './supabase';
import { demoStore } from './demoStore';

export const authService = {
  async getSession() {
    if (!isSupabaseConfigured) {
      const activeUser = demoStore.getActiveUser();
      return {
        data: {
          session: {
            user: {
              id: activeUser.id,
              email: activeUser.email,
              user_metadata: { full_name: activeUser.full_name, role: activeUser.role }
            }
          }
        },
        error: null
      };
    }

    return await supabase.auth.getSession();
  },

  async getUserProfile(userId) {
    if (!isSupabaseConfigured) {
      const profile = demoStore.data.profiles.find(p => p.id === userId) || demoStore.getActiveUser();
      return { data: profile, error: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  },

  async signIn(email, password) {
    if (!isSupabaseConfigured) {
      // In demo mode: find user by email or match role
      const found = demoStore.data.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (found) {
        demoStore.setActiveUser(found.id);
        return { data: { user: found }, error: null };
      }
      // If user typed random email, check role hints or default to student
      const user = demoStore.getActiveUser();
      return { data: { user }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return { data: null, error };

    // Fetch profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      return { data: null, error: { message: 'Hesabınız yönetici tarafından devre dışı bırakılmıştır.' } };
    }

    return { data: { ...data, profile }, error: null };
  },

  async signUp(email, password, fullName, requestedRole = 'student') {
    if (!isSupabaseConfigured) {
      const newId = `usr-${Date.now()}`;
      const newProfile = {
        id: newId,
        full_name: fullName,
        email,
        role: requestedRole,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      demoStore.data.profiles.push(newProfile);
      demoStore.setActiveUser(newId);
      demoStore.save();
      return { data: { user: newProfile }, error: null };
    }

    // Role will be verified & set by database trigger
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: requestedRole
        }
      }
    });

    return { data, error };
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    return await supabase.auth.signOut();
  },

  async resetPasswordForEmail(email) {
    if (!isSupabaseConfigured) {
      return { data: { message: 'Sıfırlama bağlantısı gönderildi (Demo)' }, error: null };
    }
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
  },

  async updatePassword(newPassword) {
    if (!isSupabaseConfigured) {
      return { data: { message: 'Şifre güncellendi (Demo)' }, error: null };
    }
    return await supabase.auth.updateUser({ password: newPassword });
  },

  async updateProfile(userId, { fullName }) {
    if (!isSupabaseConfigured) {
      const profile = demoStore.data.profiles.find(p => p.id === userId);
      if (profile) {
        profile.full_name = fullName;
        profile.updated_at = new Date().toISOString();
        demoStore.save();
      }
      return { data: profile, error: null };
    }

    return await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
  },

  onAuthStateChange(callback) {
    if (!isSupabaseConfigured) {
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
    return supabase.auth.onAuthStateChange(callback);
  }
};

export default authService;
