import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Save,
  CheckCircle2
} from 'lucide-react';

export function Profile() {
  const { user, profile, role, updateProfile } = useAuth();
  const { showToast } = useNotifications();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setLoading(true);

    const { success, error } = await updateProfile({ fullName: fullName.trim() });
    setLoading(false);

    if (success) {
      showToast('Profil adınız başarıyla güncellendi.');
    } else {
      showToast(error?.message || 'Güncelleme başarısız.', 'danger');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge variant="warning">Sistem Yöneticisi</Badge>;
      case 'teacher':
        return <Badge variant="purple">Edebiyat Öğretmeni</Badge>;
      default:
        return <Badge variant="cyan">Öğrenci</Badge>;
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Hesap Profilim</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Hesap detaylarınızı ve kişisel bilgilerinizi görüntüleyin.
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card glow style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700
            }}
          >
            {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>{profile?.full_name}</h2>
              {getRoleBadge(role)}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {profile?.email || user?.email || 'dvlp user'}
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <Input
            label="Ad Soyad"
            icon={User}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Kayıtlı E-posta Adresi (Değiştirilemez)"
            icon={Mail}
            value={profile?.email || user?.email || 'ogrenci@dvlp.dev'}
            disabled
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button type="submit" variant="primary" loading={loading} icon={Save}>
              Bilgileri Kaydet
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Profile;
