import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsService } from '../services/notifications';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await notificationsService.getMyNotifications(user.id);
      setNotifications(data || []);
    } catch (e) {
      console.error('Fetch notifications error', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const markAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (e) {
      console.error('Mark read error', e);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationsService.markAllAsRead(user.id);
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
    } catch (e) {
      console.error('Mark all read error', e);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    showToast
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Toast Notification Container */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: toast.type === 'danger' 
              ? 'var(--color-danger)' 
              : toast.type === 'warning' 
                ? 'var(--color-warning)' 
                : 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
            color: '#ffffff',
            padding: '0.85rem 1.5rem',
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            fontSize: '0.9rem',
            fontWeight: 500,
            animation: 'fadeIn 0.25s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {toast.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
