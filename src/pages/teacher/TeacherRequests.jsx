import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { classesService } from '../../services/classes';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Inbox, CheckCircle2, XCircle, Clock, User, Layers } from 'lucide-react';

export function TeacherRequests() {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data } = await classesService.getAllPendingRequests();
      setRequests(data || []);
    } catch (e) {
      console.error('TeacherRequests load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = async (membershipId, status) => {
    setActionLoadingId(membershipId);
    try {
      const { error } = await classesService.updateMembershipStatus(membershipId, status, user.id);
      if (error) throw error;

      showToast(status === 'approved' ? 'Öğrencinin katılım talebi onaylandı.' : 'Katılım talebi reddedildi.');
      await loadRequests();
    } catch (err) {
      showToast(err.message || 'İşlem gerçekleştirilemedi.', 'danger');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Katılım talepleri yükleniyor..." size="lg" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Sınıf Katılım Talepleri</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Sınıf kodunu girerek şubenize katılmak isteyen öğrencilerin onay bekleyen başvuruları.
        </p>
      </div>

      {requests.length === 0 ? (
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
            <Inbox size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Bekleyen Talep Yok</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Şu anda onay veya ret bekleyen yeni bir öğrenci katılım başvurusu bulunmamaktadır.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map(req => (
            <Card key={req.id} hoverable style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: 'var(--accent-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '1.1rem'
                  }}
                >
                  {req.profile?.full_name ? req.profile.full_name[0] : 'Ö'}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {req.profile?.full_name || 'Öğrenci'}
                    </h3>
                    <Badge variant="cyan" size="sm">
                      <Layers size={11} /> {req.class?.name || 'Sınıf'}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={13} />
                    Talep Tarihi: {new Date(req.requested_at).toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={XCircle}
                  loading={actionLoadingId === req.id}
                  onClick={() => handleUpdateStatus(req.id, 'rejected')}
                >
                  Reddet
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  loading={actionLoadingId === req.id}
                  onClick={() => handleUpdateStatus(req.id, 'approved')}
                >
                  Onayla
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeacherRequests;
