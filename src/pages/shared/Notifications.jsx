import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  FileText,
  CheckCheck
} from 'lucide-react';

export function Notifications() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [filter, setFilter] = useState('all'); // all, unread

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read_at;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'review_completed':
        return <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />;
      case 'feedback_added':
        return <MessageSquare size={18} style={{ color: 'var(--accent-purple)' }} />;
      case 'membership_approved':
      case 'membership_rejected':
        return <UserPlus size={18} style={{ color: 'var(--accent-cyan)' }} />;
      default:
        return <FileText size={18} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Bildirimler</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Ödev incelemeleri, öğretmen geri bildirimleri ve sınıf katılım güncellemeleri.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`dvlp-btn dvlp-btn-sm ${filter === 'all' ? 'dvlp-btn-primary' : 'dvlp-btn-ghost'}`}
        >
          Tümü ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`dvlp-btn dvlp-btn-sm ${filter === 'unread' ? 'dvlp-btn-primary' : 'dvlp-btn-ghost'}`}
        >
          Okunmamış ({unreadCount})
        </button>
      </div>

      {filtered.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center' }}>
          <div 
            style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              background: 'var(--bg-secondary)', 
              color: 'var(--accent-purple)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.25rem auto' 
            }}
          >
            <Bell size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Bildirim Bulunmuyor</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {filter === 'unread' ? 'Okunmamış yeni bildiriminiz yok.' : 'Henüz bir bildirim almadınız.'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(notif => (
            <Card
              key={notif.id}
              hoverable
              onClick={() => markAsRead(notif.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1.25rem',
                borderLeft: !notif.read_at ? '3px solid var(--accent-purple)' : '1px solid var(--border-color)',
                background: !notif.read_at ? 'rgba(139, 92, 246, 0.04)' : 'var(--bg-surface)'
              }}
            >
              <div 
                style={{ 
                  marginTop: '2px', 
                  padding: '0.5rem', 
                  borderRadius: '10px', 
                  background: 'var(--bg-secondary)',
                  flexShrink: 0 
                }}
              >
                {getIcon(notif.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {notif.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(notif.created_at).toLocaleString('tr-TR')}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {notif.message}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
