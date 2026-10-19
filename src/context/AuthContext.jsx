import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { demoStore } from '../services/demoStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentSession = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sessionData, error: sessionErr } = await authService.getSession();
      const currentUser = sessionData?.session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: userProfile } = await authService.getUserProfile(currentUser.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    } catch (e) {
      console.error('Session load error', e);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentSession();

    if (isSupabaseConfigured) {
      const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const { data: prof } = await authService.getUserProfile(session.user.id);
          setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe?.();
      };
    }
  }, [loadCurrentSession]);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await authService.signIn(email, password);
      if (error) throw error;
      await loadCurrentSession();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName, role = 'student') => {
    setLoading(true);
    try {
      const res = await authService.signUp(email, password, fullName, role);
      if (res.error) throw res.error;
      await loadCurrentSession();
      return {
        success: true,
        data: res.data,
        isEmailConfirmationRequired: res.isEmailConfirmationRequired
      };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmationEmail = async (email) => {
    return await authService.resendConfirmationEmail(email);
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      if (!isSupabaseConfigured) {
        // clear or leave demo
      }
      setUser(null);
      setProfile(null);
    } catch (e) {
      console.error('Sign out error', e);
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = async (role) => {
    if (isSupabaseConfigured) return;
    const nextUser = demoStore.switchRole(role);
    if (nextUser) {
      await loadCurrentSession();
    }
  };

  const updateProfile = async ({ fullName }) => {
    if (!profile?.id) return { success: false };
    const { data, error } = await authService.updateProfile(profile.id, { fullName });
    if (!error) {
      setProfile(prev => ({ ...prev, full_name: fullName }));
      return { success: true };
    }
    return { success: false, error };
  };

  const reloadProfile = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.auth.refreshSession();
        } catch (e) {
          console.warn('Session refresh warning:', e);
        }
      }
      await loadCurrentSession();
    } finally {
      setLoading(false);
    }
  };

  const accountStatus = profile?.account_status || 'pending';
  const isApproved = accountStatus === 'approved';

  const value = {
    user,
    profile,
    role: profile?.role || 'student',
    accountStatus,
    isApproved,
    isActive: profile?.is_active ?? true,
    loading,
    isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    resendConfirmationEmail,
    switchDemoRole,
    updateProfile,
    reloadProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
