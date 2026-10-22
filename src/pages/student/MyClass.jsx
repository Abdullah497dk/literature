import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { classesService } from '../../services/classes';
import { assignmentsService } from '../../services/assignments';
import { submissionsService } from '../../services/submissions';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import {
  GraduationCap,
  Users,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  User,
  ArrowRight
} from 'lucide-react';

export function MyClass() {
  const { classId: routeClassId } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [members, setMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // PDF Preview Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      setLoading(true);
      try {
        let activeClassId = routeClassId;

        if (!activeClassId) {
          const { data: mems } = await classesService.getStudentMemberships(user.id);
          const approved = (mems || []).find(m => m.status === 'approved');
          if (approved) {
            activeClassId = approved.class_id;
          }
        }

        if (!activeClassId) {
          setClassData(null);
          setLoading(false);
          return;
        }

        const [clsRes, memsRes, asgsRes, subsRes] = await Promise.all([
          classesService.getClassById(activeClassId),
          classesService.getClassMembers(activeClassId),
          assignmentsService.getAssignmentsByClass(activeClassId),
          submissionsService.getSubmissionsByClass(activeClassId)
        ]);

        setClassData(clsRes.data);
        setMembers((memsRes.data || []).filter(m => m.status === 'approved'));
        setAssignments(asgsRes.data || []);
        setSubmissions(subsRes.data || []);
      } catch (e) {
        console.error('MyClass load error', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [routeClassId, user?.id]);

  const copyJoinCode = () => {
    if (classData?.join_code) {
      navigator.clipboard.writeText(classData.join_code);
      setCopiedCode(true);
      showToast('Sınıf katılım kodu panoya kopyalandı.');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const openPdfViewer = async (sub) => {
    const { url } = await submissionsService.getSignedPdfUrl(sub.file_path);
    setSelectedPdf({
      url: url || sub.pdf_url,
      filename: sub.original_filename,
      filesize: sub.file_size,
      studentName: sub.student?.full_name,
      assignmentTitle: sub.assignment?.title
    });
    setPdfModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner text="Sınıf bilgileri yükleniyor..." size="lg" />;
  }

  if (!classData) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Aktif Bir Sınıf Bulunamadı"
        description="Henüz onaylanmış bir sınıf üyeliğiniz bulunmuyor. Gösterge panelinden sınıf kodunuzla katılım talebinde bulunabilirsiniz."
        actionLabel="Gösterge Paneline Git"
        onAction={() => window.location.href = '/dashboard'}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Class Banner */}
      <div 
        className="dvlp-card" 
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)',
          borderColor: 'rgba(139, 92, 246, 0.25)',
          padding: '2rem'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="dvlp-badge dvlp-badge-cyan" style={{ fontSize: '0.75rem' }}>
                Edebiyat Şubesi
              </span>
              <span className="dvlp-badge dvlp-badge-neutral" style={{ fontSize: '0.75rem' }}>
                <Users size={12} /> {members.length} Öğrenci
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {classData.name} Sınıfı
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              {classData.description || 'Türk Dili ve Edebiyatı Dersliği'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-secondary)', padding: '0.5rem 0.85rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Katılım Kodu
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>
                {classData.join_code}
              </div>
            </div>
            <button
              type="button"
              onClick={copyJoinCode}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px'
              }}
              title="Kodu Kopyala"
            >
              {copiedCode ? <Check size={16} style={{ color: 'var(--color-success)' }} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Classmates & Assignments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Classmates Column */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Sınıf Arkadaşlarım</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {members.length} Kişi
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {members.map(mem => (
              <Link
                key={mem.id}
                to={`/class/${classData.id}/students/${mem.user_id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color-subtle)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'rgba(139, 92, 246, 0.15)',
                      color: 'var(--accent-purple)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    {mem.profile?.full_name ? mem.profile.full_name[0] : 'Ö'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {mem.profile?.full_name || 'Öğrenci'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {mem.user_id === user.id ? '(Siz)' : 'Öğrenci'}
                    </div>
                  </div>
                </div>

                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>
        </Card>

        {/* Assignments Column */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} style={{ color: 'var(--accent-purple)' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Ödev Konuları</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {assignments.length} Konu
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {assignments.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                Bu sınıf için henüz ödev konusu açılmadı.
              </p>
            ) : (
              assignments.map(asg => (
                <div
                  key={asg.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {asg.title}
                    </h4>
                    {asg.is_active ? (
                      <Badge variant="cyan" size="sm">Aktif</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Arşivlendi</Badge>
                    )}
                  </div>
                  {asg.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {asg.description}
                    </p>
                  )}
                  {asg.due_at && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                      <Clock size={12} /> Son Teslim: {new Date(asg.due_at).toLocaleDateString('tr-TR')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Class Activity: Shared Submissions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>Sınıfta Teslim Edilen Ödevler</h2>
        {submissions.length === 0 ? (
          <div className="dvlp-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Henüz sınıfta paylaşılan bir ödev teslimi yok.
          </div>
        ) : (
          <div className="dvlp-table-container">
            <table className="dvlp-table">
              <thead>
                <tr>
                  <th>Öğrenci</th>
                  <th>Ödev Başlığı</th>
                  <th>Dosya (PDF)</th>
                  <th>Teslim Tarihi</th>
                  <th>İnceleme Durumu</th>
                  <th style={{ textAlign: 'right' }}>Görüntüle</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <Link to={`/class/${classData.id}/students/${sub.student_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {sub.student?.full_name || 'Öğrenci'}
                      </Link>
                    </td>
                    <td>{sub.assignment?.title || 'Ödev'}</td>
                    <td style={{ maxWidth: '200px' }}>
                      <span 
                        style={{ 
                          fontSize: '0.85rem', 
                          color: 'var(--accent-cyan)',
                          display: 'inline-block',
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          verticalAlign: 'middle'
                        }}
                        title={sub.original_filename}
                      >
                        {sub.original_filename}
                      </span>
                    </td>
                    <td>{new Date(sub.created_at).toLocaleDateString('tr-TR')}</td>
                    <td>
                      {sub.review_status === 'reviewed' ? (
                        <Badge variant="success" size="sm">İncelendi</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">Teslim Edildi</Badge>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={ExternalLink}
                        onClick={() => openPdfViewer(sub)}
                      >
                        PDF Aç
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PDF Viewer Dialog */}
      <PdfViewerModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        pdfUrl={selectedPdf?.url}
        filename={selectedPdf?.filename}
        fileSize={selectedPdf?.filesize}
        studentName={selectedPdf?.studentName}
        assignmentTitle={selectedPdf?.assignmentTitle}
      />
    </div>
  );
}

export default MyClass;
