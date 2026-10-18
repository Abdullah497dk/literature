import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { usersService } from '../../services/users';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';

export function AdminUsers() {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Change Role Modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('student');
  const [roleLoading, setRoleLoading] = useState(false);

  // Delete Confirm Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await usersService.getAllUsers();
      setUsers(data || []);
    } catch (e) {
      console.error('AdminUsers error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setRoleLoading(true);

    try {
      const { error } = await usersService.updateUserRole(selectedUser.id, newRole, user.id);
      if (error) throw error;

      showToast(`Kullanıcı rolü başarıyla "${newRole}" olarak güncellendi.`);
      setRoleModalOpen(false);
      await loadUsers();
    } catch (err) {
      showToast(err.message || 'Rol güncellenemedi.', 'danger');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleUpdateStatus = async (target, newStatus) => {
    try {
      const { error } = await usersService.updateAccountStatus(target.id, newStatus, user.id);
      if (error) throw error;

      const label = newStatus === 'approved' ? 'onaylandı' : newStatus === 'rejected' ? 'reddedildi' : 'onay bekliyor olarak işaretlendi';
      showToast(`Kullanıcı hesabı başarıyla ${label}.`);
      await loadUsers();
    } catch (err) {
      showToast(err.message || 'Hesap durumu güncellenemedi.', 'danger');
    }
  };

  const handleToggleActive = async (target) => {
    try {
      const { error } = await usersService.toggleUserActive(target.id, target.is_active, user.id);
      if (error) throw error;

      showToast(target.is_active ? 'Kullanıcı hesabı donduruldu.' : 'Kullanıcı hesabı aktifleştirildi.');
      await loadUsers();
    } catch (err) {
      showToast(err.message || 'İşlem başarısız.', 'danger');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      const { error } = await usersService.deleteUser(userToDelete.id, user.id);
      if (error) throw error;

      showToast('Kullanıcı hesabı kalıcı olarak silindi.');
      setDeleteDialogOpen(false);
      await loadUsers();
    } catch (err) {
      showToast(err.message || 'Silme işlemi gerçekleştirilemedi.', 'danger');
    } finally {
      setDeleteLoading(false);
    }
  };

  const pendingCount = users.filter(u => u.account_status === 'pending').length;

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    const userStatus = u.account_status || 'approved';
    if (statusFilter !== 'all' && userStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = (u.full_name || '').toLowerCase();
      const mail = (u.email || '').toLowerCase();
      return name.includes(q) || mail.includes(q);
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Kullanıcılar yükleniyor..." size="lg" />;
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge variant="warning" size="sm">Yönetici</Badge>;
      case 'teacher':
        return <Badge variant="purple" size="sm">Öğretmen</Badge>;
      default:
        return <Badge variant="cyan" size="sm">Öğrenci</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" size="sm">Onay Bekliyor</Badge>;
      case 'rejected':
        return <Badge variant="danger" size="sm">Reddedildi</Badge>;
      case 'approved':
      default:
        return <Badge variant="success" size="sm">Onaylandı</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Kullanıcı ve Rol Yönetimi</h1>
            {pendingCount > 0 && (
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                <Clock size={12} /> {pendingCount} Onay Bekliyor
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sistemdeki tüm öğrenci, öğretmen ve yönetici hesaplarını denetleyin ve onaylayın.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Ad veya e-posta ile ara..."
              className="dvlp-input"
              style={{ paddingLeft: '2.2rem', height: '38px', fontSize: '0.85rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="dvlp-select"
            style={{ width: '135px', height: '38px', fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tüm Roller</option>
            <option value="student">Öğrenciler</option>
            <option value="teacher">Öğretmenler</option>
            <option value="admin">Yöneticiler</option>
          </select>

          <select
            className="dvlp-select"
            style={{ width: '150px', height: '38px', fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Onay Bekleyenler</option>
            <option value="approved">Onaylananlar</option>
            <option value="rejected">Reddedilenler</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="dvlp-table-container">
        <table className="dvlp-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>E-posta</th>
              <th>Mevcut Rol</th>
              <th>Hesap Onayı</th>
              <th>Aktiflik</th>
              <th>Kayıt Tarihi</th>
              <th style={{ textAlign: 'right' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: u.role === 'admin' ? 'rgba(245, 158, 11, 0.2)' : u.role === 'teacher' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(34, 211, 238, 0.2)',
                        color: u.role === 'admin' ? '#fbbf24' : u.role === 'teacher' ? '#c4b5fd' : '#67e8f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      {u.full_name ? u.full_name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {u.full_name}
                      </span>
                      {u.id === user.id && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', marginLeft: '0.35rem' }}>
                          (Siz)
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {u.email || '—'}
                </td>
                <td>{getRoleBadge(u.role)}</td>
                <td>{getStatusBadge(u.account_status || 'approved')}</td>
                <td>
                  {u.is_active ? (
                    <Badge variant="success" size="sm">Aktif</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">Donduruldu</Badge>
                  )}
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  {new Date(u.created_at).toLocaleDateString('tr-TR')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    {u.account_status === 'pending' && (
                      <button
                        type="button"
                        className="dvlp-btn dvlp-btn-sm"
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.15)',
                          color: '#4ade80',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                        onClick={() => handleUpdateStatus(u, 'approved')}
                        title="Hesabı Onayla"
                      >
                        <CheckCircle2 size={13} /> Onayla
                      </button>
                    )}

                    {u.account_status === 'rejected' && (
                      <button
                        type="button"
                        className="dvlp-btn dvlp-btn-sm"
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.15)',
                          color: '#4ade80',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                        onClick={() => handleUpdateStatus(u, 'approved')}
                        title="Yeniden Onayla"
                      >
                        <CheckCircle2 size={13} /> Onayla
                      </button>
                    )}

                    {u.account_status === 'pending' && (
                      <button
                        type="button"
                        className="dvlp-btn dvlp-btn-ghost dvlp-btn-sm"
                        onClick={() => handleUpdateStatus(u, 'rejected')}
                        title="Başvuruyu Reddet"
                      >
                        <XCircle size={14} style={{ color: 'var(--color-danger)' }} />
                      </button>
                    )}

                    <button
                      type="button"
                      className="dvlp-btn dvlp-btn-secondary dvlp-btn-sm"
                      onClick={() => {
                        setSelectedUser(u);
                        setNewRole(u.role);
                        setRoleModalOpen(true);
                      }}
                      title="Rolü Değiştir"
                    >
                      <Edit2 size={13} /> Rol
                    </button>

                    <button
                      type="button"
                      className="dvlp-btn dvlp-btn-ghost dvlp-btn-sm"
                      onClick={() => handleToggleActive(u)}
                      title={u.is_active ? 'Hesabı Dondur' : 'Hesabı Aktifleştir'}
                    >
                      {u.is_active ? <UserX size={14} style={{ color: 'var(--color-warning)' }} /> : <UserCheck size={14} style={{ color: 'var(--color-success)' }} />}
                    </button>

                    <button
                      type="button"
                      className="dvlp-btn dvlp-btn-ghost dvlp-btn-sm"
                      onClick={() => {
                        setUserToDelete(u);
                        setDeleteDialogOpen(true);
                      }}
                      title="Hesabı Sil"
                    >
                      <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Change Modal */}
      {selectedUser && (
        <Modal
          isOpen={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          title={`Yetki Rolünü Düzenle: ${selectedUser.full_name}`}
          maxWidth="460px"
        >
          <form onSubmit={handleRoleChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Kullanıcının sistemdeki erişim seviyesini belirleyin. Rol değişiklikleri yetki politikalarıyla anında geçerli olur.
            </p>

            <Select
              label="Kullanıcı Rolü"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="student">Öğrenci (Ödev yükler, kendi sınıfını görür)</option>
              <option value="teacher">Öğretmen (Ödev inceler, yorum yazar, başlık açar)</option>
              <option value="admin">Yönetici (Tüm sistemi, sınıfları ve kullanıcıları yönetir)</option>
            </Select>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="secondary" onClick={() => setRoleModalOpen(false)}>
                Vazgeç
              </Button>
              <Button type="submit" variant="primary" loading={roleLoading}>
                Rolü Kaydet
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        title="Kullanıcıyı Silmek İstediğinize Emin Misiniz?"
        message={`"${userToDelete?.full_name}" kullanıcısı ve ilişkili erişim izinleri kalıcı olarak kaldırılacaktır.`}
        confirmText="Evet, Kullanıcıyı Sil"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}

export default AdminUsers;
