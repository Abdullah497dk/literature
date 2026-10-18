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
      .maybeSingle();

    // Safe fallback if profile record is pending provisioning:
    if (!data && !error) {
      return {
        data: {
          id: userId,
          full_name: 'Kayıtlı Kullanıcı',
          role: 'student',
          account_status: 'pending',
          is_active: true
        },
        error: null
      };
    }

    return { data, error };
  },

  async signIn(email, password) {
    if (!isSupabaseConfigured) {
      // In demo mode: find user by email or match role
      const found = demoStore.data.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (found) {
        demoStore.setActiveUser(found.id);
        return { data: { user: found, profile: found }, error: null };
      }
      const user = demoStore.getActiveUser();
      return { data: { user, profile: user }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      const isEmailNotConfirmed = 
        error.message?.toLowerCase().includes('email not confirmed') ||
        error.code === 'email_not_confirmed' ||
        (error.status === 400 && error.message?.toLowerCase().includes('confirm'));

      return {
        data: null,
        error: {
          ...error,
          isEmailNotConfirmed,
          message: isEmailNotConfirmed
            ? 'E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzdaki ve spam klasörünüzdeki aktivasyon bağlantısına tıklayın.'
            : error.message
        }
      };
    }

    // Fetch profile safely
    const { data: profile } = await this.getUserProfile(data.user.id);

    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      return { data: null, error: { message: 'Hesabınız yönetici tarafından devre dışı bırakılmıştır.' } };
    }

    return { data: { ...data, profile }, error: null };
  },

  async signUp(email, password, fullName) {
    if (!isSupabaseConfigured) {
      const newId = `usr-${Date.now()}`;
      const newProfile = {
        id: newId,
        full_name: fullName,
        email,
        role: 'student',
        account_status: 'pending',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      demoStore.data.profiles.push(newProfile);
      demoStore.setActiveUser(newId);
      demoStore.save();
      return { data: { user: newProfile, isEmailConfirmationRequired: false }, error: null };
    }

    // Requirement 1 & 11: Normal student account, pending approval, and correct redirect URL
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: fullName,
          role: 'student'
        }
      }
    });

    if (error) return { data: null, error };

    const isEmailConfirmationRequired = Boolean(data.user && !data.session);

    return {
      data: {
        ...data,
        isEmailConfirmationRequired
      },
      error: null
    };
  },

  async resendConfirmationEmail(email) {
    if (!isSupabaseConfigured) {
      return { data: { message: 'Doğrulama e-postası tekrar gönderildi (Demo)' }, error: null };
    }

    return await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`
      }
    });
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
