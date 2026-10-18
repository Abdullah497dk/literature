import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersService } from '../../services/users';
import { classesService } from '../../services/classes';
import { submissionsService } from '../../services/submissions';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Shield,
  Users,
  Layers,
  FileCheck2,
  Inbox,
  Activity,
  ArrowRight,
  UserCheck,
  BookOpen
} from 'lucide-react';

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [usersRes, clsRes, subsRes, reqsRes, logsRes] = await Promise.all([
          usersService.getAllUsers(),
          classesService.getClasses(),
          submissionsService.getAllSubmissions(),
          classesService.getAllPendingRequests(),
          usersService.getAuditLogs()
        ]);

        setUsers(usersRes.data || []);
        setClasses(clsRes.data || []);
        setSubmissions(subsRes.data || []);
        setPendingRequests(reqsRes.data || []);
        setAuditLogs(logsRes.data || []);
      } catch (e) {
        console.error('AdminDashboard load error', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Yönetici paneli yükleniyor..." size="lg" />;
  }

  const studentCount = users.filter(u => u.role === 'student').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div 
        className="dvlp-card" 
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          padding: '2rem'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <span className="dvlp-badge dvlp-badge-warning" style={{ fontSize: '0.75rem', marginBottom: '0.4rem' }}>
              <Shield size={12} /> Sistem Yöneticisi Paneli
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              DVLP Edebiyat Yönetim Merkezi
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Kullanıcı rolleri, edebiyat sınıfları, katılım talepleri ve sistem denetim kayıtları.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/users" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" icon={Users}>
                Kullanıcıları Yönet
              </Button>
            </Link>
            <Link to="/admin/classes" style={{ textDecoration: 'none' }}>
              <Button variant="primary" icon={Layers}>
                Sınıfları Yönet
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toplam Kullanıcı</span>
            <Users size={20} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {users.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {studentCount} Öğrenci • {teacherCount} Öğretmen • {adminCount} Admin
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toplam Sınıf</span>
            <Layers size={20} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {classes.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Tanımlı şube sayısı
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toplam Ödev Teslimi</span>
            <FileCheck2 size={20} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)' }}>
            {submissions.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Sistemdeki PDF teslim sayısı
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bekleyen Talep</span>
            <Inbox size={20} style={{ color: 'var(--color-warning)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-warning)' }}>
            {pendingRequests.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Onay bekleyen sınıf başvurusu
          </div>
        </Card>
      </div>

      {/* Grid: Quick Navigation & Recent Audit Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Admin Modules Quick Jump */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Yönetici Modülleri</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <Link
              to="/admin/users"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color-subtle)',
                textDecoration: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={18} style={{ color: 'var(--accent-purple)' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    Kullanıcılar ve Roller
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Rol atamaları, hesap dondurma ve silme
                  </div>
                </div>
              </div>
              <ArrowRight size={15} style={{ color: 'var(--text-muted)' }} />
            </Link>

            <Link
              to="/admin/classes"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color-subtle)',
                textDecoration: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    Sınıf Yönetimi
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Yeni sınıf oluşturma, kod yenileme ve arşivleme
                  </div>
                </div>
              </div>
              <ArrowRight size={15} style={{ color: 'var(--text-muted)' }} />
            </Link>

            <Link
              to="/admin/requests"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color-subtle)',
                textDecoration: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Inbox size={18} style={{ color: 'var(--color-warning)' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    Üyelik Talepleri
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {pendingRequests.length} bekleyen başvuru
                  </div>
                </div>
              </div>
              <ArrowRight size={15} style={{ color: 'var(--text-muted)' }} />
            </Link>
          </div>
        </Card>

        {/* Audit Activity */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} style={{ color: 'var(--color-success)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Son Sistem İşlemleri</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {auditLogs.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                Kayıtlı sistem aktivitesi bulunmuyor.
              </p>
            ) : (
              auditLogs.slice(0, 5).map(log => (
                <div
                  key={log.id}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.825rem'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.action}
                    </span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                      ({log.entity_type})
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {new Date(log.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
