import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { classesService } from '../../services/classes';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Layers,
  Plus,
  RefreshCw,
  Archive,
  Edit2,
  Copy,
  Check,
  CheckCircle2
} from 'lucide-react';

export function AdminClasses() {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const { data } = await classesService.getClasses();
      setClasses(data || []);
    } catch (e) {
      console.error('AdminClasses load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const generateRandomCode = (prefix = 'EDEB') => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${res}`;
  };

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setJoinCode(generateRandomCode('EDEB'));
    setCreateModalOpen(true);
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!name.trim() || !joinCode.trim()) return;
    setCreateLoading(true);

    try {
      const { error } = await classesService.createClass({
        name: name.trim(),
        description: description.trim(),
        join_code: joinCode.trim().toUpperCase(),
        created_by: user.id
      });

      if (error) throw error;

      showToast(`"${name}" sınıfı başarıyla oluşturuldu.`);
      setCreateModalOpen(false);
      await loadClasses();
    } catch (err) {
      showToast(err.message || 'Sınıf oluşturulamadı.', 'danger');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingClass) return;
    setEditLoading(true);

    try {
      const { error } = await classesService.updateClass(editingClass.id, {
        name: editingClass.name.trim(),
        description: editingClass.description?.trim(),
        join_code: editingClass.join_code.trim().toUpperCase(),
        is_active: editingClass.is_active
      });

      if (error) throw error;

      showToast('Sınıf detayları güncellendi.');
      setEditModalOpen(false);
      await loadClasses();
    } catch (err) {
      showToast(err.message || 'Güncellenemedi.', 'danger');
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleArchive = async (cls) => {
    try {
      const nextActive = !cls.is_active;
      await classesService.updateClass(cls.id, { is_active: nextActive });
      showToast(nextActive ? 'Sınıf tekrar aktifleştirildi.' : 'Sınıf arşivlendi.');
      await loadClasses();
    } catch (err) {
      showToast('İşlem başarısız.', 'danger');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Sınıflar yükleniyor..." size="lg" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Sınıf Yönetimi</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Yeni edebiyat sınıfları açın, katılım kodlarını yönetin veya arşivleyin.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Yeni Sınıf Oluştur
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {classes.map(cls => (
          <Card key={cls.id} hoverable style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {cls.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Oluşturulma: {new Date(cls.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              {cls.is_active ? (
                <Badge variant="cyan" size="sm">Aktif</Badge>
              ) : (
                <Badge variant="neutral" size="sm">Arşivlendi</Badge>
              )}
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: '38px', lineHeight: 1.4 }}>
              {cls.description || 'Açıklama belirtilmemiş.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.6rem 0.85rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Katılım Kodu:</span>
              <code style={{ fontSize: '0.9rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                {cls.join_code}
              </code>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color-subtle)' }}>
              <button
                type="button"
                className="dvlp-btn dvlp-btn-secondary dvlp-btn-sm"
                onClick={() => {
                  setEditingClass({ ...cls });
                  setEditModalOpen(true);
                }}
              >
                <Edit2 size={13} /> Düzenle
              </button>
              <button
                type="button"
                className="dvlp-btn dvlp-btn-ghost dvlp-btn-sm"
                onClick={() => handleToggleArchive(cls)}
              >
                <Archive size={13} /> {cls.is_active ? 'Arşivle' : 'Aktif Et'}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Class Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Yeni Edebiyat Sınıfı Aç"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Sınıf Adı (Örn: 9-A, 10-B)"
            placeholder="9-A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Açıklama"
            placeholder="Sınıf şubesi açıklaması..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="dvlp-label" style={{ margin: 0 }}>Katılım Kodu</label>
              <button
                type="button"
                onClick={() => setJoinCode(generateRandomCode('EDEB'))}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                <RefreshCw size={11} /> Yeni Kod Üret
              </button>
            </div>
            <input
              type="text"
              className="dvlp-input"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
              style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Vazgeç
            </Button>
            <Button type="submit" variant="primary" loading={createLoading} icon={Plus}>
              Sınıfı Oluştur
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Class Modal */}
      {editingClass && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Sınıfı Düzenle: ${editingClass.name}`}
          maxWidth="500px"
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Sınıf Adı"
              value={editingClass.name}
              onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
              required
            />

            <Textarea
              label="Açıklama"
              rows={3}
              value={editingClass.description || ''}
              onChange={(e) => setEditingClass({ ...editingClass, description: e.target.value })}
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="dvlp-label" style={{ margin: 0 }}>Katılım Kodu</label>
                <button
                  type="button"
                  onClick={() => setEditingClass({ ...editingClass, join_code: generateRandomCode('EDEB') })}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  <RefreshCw size={11} /> Yeni Kod Üret
                </button>
              </div>
              <input
                type="text"
                className="dvlp-input"
                value={editingClass.join_code}
                onChange={(e) => setEditingClass({ ...editingClass, join_code: e.target.value.toUpperCase() })}
                required
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
                Vazgeç
              </Button>
              <Button type="submit" variant="primary" loading={editLoading}>
                Kaydet
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminClasses;
