import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { assignmentsService } from '../../services/assignments';
import { classesService } from '../../services/classes';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Plus, Clock, Edit2, Archive } from 'lucide-react';

export function TeacherAssignments() {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClassId, setNewClassId] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueAt, setNewDueAt] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAsg, setEditingAsg] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [asgsRes, clsRes] = await Promise.all([
        assignmentsService.getAllAssignments(),
        classesService.getClasses()
      ]);
      setAssignments(asgsRes.data || []);
      const classList = clsRes.data || [];
      setClasses(classList);
      if (classList.length > 0) {
        setNewClassId(classList[0].id);
      }
    } catch (e) {
      console.error('TeacherAssignments load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClassId) return;
    setCreateLoading(true);

    try {
      const { error } = await assignmentsService.createAssignment({
        class_id: newClassId,
        title: newTitle.trim(),
        description: newDesc.trim(),
        due_at: newDueAt ? new Date(newDueAt).toISOString() : null,
        created_by: user.id
      });

      if (error) throw error;

      showToast('Yeni ödev konusu başarıyla oluşturuldu.');
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewDueAt('');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Ödev oluşturulamadı.', 'danger');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingAsg || !editingAsg.title.trim()) return;
    setEditLoading(true);

    try {
      const { error } = await assignmentsService.updateAssignment(editingAsg.id, {
        title: editingAsg.title.trim(),
        description: editingAsg.description?.trim(),
        due_at: editingAsg.due_at ? new Date(editingAsg.due_at).toISOString() : null,
        is_active: editingAsg.is_active
      });

      if (error) throw error;

      showToast('Ödev konusu güncellendi.');
      setEditModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Güncellenemedi.', 'danger');
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleArchive = async (asg) => {
    try {
      await assignmentsService.toggleAssignmentActive(asg.id, asg.is_active);
      showToast(asg.is_active ? 'Ödev konusu arşivlendi.' : 'Ödev konusu tekrar aktifleştirildi.');
      await loadData();
    } catch {
      showToast('İşlem başarısız.', 'danger');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Ödev başlıkları yükleniyor..." size="lg" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Ödev Başlıkları Yönetimi</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Öğrencilerin PDF teslim edecekleri ödev konularını ve yönergelerini tek bir merkezden oluşturun.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setCreateModalOpen(true)}
          disabled={classes.length === 0}
        >
          Yeni Ödev Başlığı Aç
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {assignments.map(asg => (
          <Card key={asg.id} hoverable style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div>
                <span className="dvlp-badge dvlp-badge-cyan" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                  {asg.class?.name || 'Sınıf'}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {asg.title}
                </h3>
              </div>
              {asg.is_active ? (
                <Badge variant="success" size="sm">Aktif</Badge>
              ) : (
                <Badge variant="neutral" size="sm">Arşivlendi</Badge>
              )}
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, minHeight: '40px' }}>
              {asg.description || 'Yönerge belirtilmemiş.'}
            </p>

            {asg.due_at && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} /> Son Teslim: {new Date(asg.due_at).toLocaleDateString('tr-TR')}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {asg.submission_count ?? '—'} Teslim Alındı
              </span>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAsg({ ...asg });
                    setEditModalOpen(true);
                  }}
                  className="dvlp-btn dvlp-btn-secondary dvlp-btn-sm"
                  title="Düzenle"
                >
                  <Edit2 size={13} /> Düzenle
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleArchive(asg)}
                  className="dvlp-btn dvlp-btn-ghost dvlp-btn-sm"
                  title={asg.is_active ? 'Arşivle' : 'Aktifleştir'}
                >
                  <Archive size={13} /> {asg.is_active ? 'Arşivle' : 'Aktif Et'}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Yeni Ödev Başlığı Tanımla"
        maxWidth="540px"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            label="Sınıf Şubesi"
            value={newClassId}
            onChange={(e) => setNewClassId(e.target.value)}
            required
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <Input
            label="Ödev Başlığı (Örn: Haksızlık Üzerine Makale)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <Textarea
            label="Ödev Yönergesi / Açıklama"
            placeholder="Öğrencilerin dikkat etmesi gereken noktalar ve metin gereksinimleri..."
            rows={4}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />

          <Input
            label="Son Teslim Tarihi (İsteğe Bağlı)"
            type="date"
            value={newDueAt}
            onChange={(e) => setNewDueAt(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Vazgeç
            </Button>
            <Button type="submit" variant="primary" loading={createLoading} icon={Plus}>
              Ödev Başlığını Yayınla
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editingAsg && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Ödev Başlığını Düzenle"
          maxWidth="540px"
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Ödev Başlığı"
              value={editingAsg.title}
              onChange={(e) => setEditingAsg({ ...editingAsg, title: e.target.value })}
              required
            />

            <Textarea
              label="Ödev Yönergesi"
              rows={4}
              value={editingAsg.description || ''}
              onChange={(e) => setEditingAsg({ ...editingAsg, description: e.target.value })}
            />

            <Input
              label="Son Teslim Tarihi"
              type="date"
              value={editingAsg.due_at ? editingAsg.due_at.substring(0, 10) : ''}
              onChange={(e) => setEditingAsg({ ...editingAsg, due_at: e.target.value })}
            />

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

export default TeacherAssignments;
