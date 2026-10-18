import { supabase, isSupabaseConfigured } from './supabase';
import { demoStore } from './demoStore';

export const notificationsService = {
  async getMyNotifications(recipientId) {
    if (!isSupabaseConfigured) {
      const list = demoStore.data.notifications
        .filter(n => n.recipient_id === recipientId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return { data: list, error: null };
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async markAsRead(notificationId) {
    const now = new Date().toISOString();
    if (!isSupabaseConfigured) {
      const notif = demoStore.data.notifications.find(n => n.id === notificationId);
      if (notif) {
        notif.read_at = now;
        demoStore.save();
      }
      return { data: notif, error: null };
    }

    return await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('id', notificationId)
      .select()
      .single();
  },

  async markAllAsRead(recipientId) {
    const now = new Date().toISOString();
    if (!isSupabaseConfigured) {
      demoStore.data.notifications.forEach(n => {
        if (n.recipient_id === recipientId && !n.read_at) {
          n.read_at = now;
        }
      });
      demoStore.save();
      return { data: true, error: null };
    }

    return await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('recipient_id', recipientId)
      .is('read_at', null);
  }
};

export default notificationsService;
