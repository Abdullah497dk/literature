import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { classesService } from '../../services/classes';
import { submissionsService } from '../../services/submissions';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import {
  Layers,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  BookOpen,
  Inbox
} from 'lucide-react';

export function TeacherDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [submissions, setSubmissions] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, not_reviewed, reviewed
  const [assignmentFilter, setAssignmentFilter] = useState('all');

  // PDF Viewer Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [clsRes, subsRes, reqsRes] = await Promise.all([
          classesService.getClasses(),
          submissionsService.getAllSubmissions(),
          classesService.getAllPendingRequests()
        ]);

        setClasses(clsRes.data || []);
        setSubmissions(subsRes.data || []);
        setPendingRequestsCount((reqsRes.data || []).length);
      } catch (e) {
        console.error('Teacher dashboard load error', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

  // Filter submissions
  const filteredSubmissions = submissions.filter(s => {
    if (selectedClassId !== 'all' && s.class_id !== selectedClassId) return false;
    if (statusFilter !== 'all' && s.review_status !== statusFilter) return false;
    if (assignmentFilter !== 'all' && s.assignment_id !== assignmentFilter) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const studentName = s.student?.full_name?.toLowerCase() || '';
      const asgTitle = s.assignment?.title?.toLowerCase() || '';
      const fname = s.original_filename?.toLowerCase() || '';
      if (!studentName.includes(q) && !asgTitle.includes(q) && !fname.includes(q)) {
        return false;
      }
    }

    return true;
  });

  // Calculate stats
  const totalSubmissions = submissions.length;
  const awaitingReviewCount = submissions.filter(s => s.review_status === 'not_reviewed').length;
  const reviewedCount = submissions.filter(s => s.review_status === 'reviewed').length;
  const uniqueStudents = new Set(submissions.map(s => s.student_id)).size;

  // Unique assignments for filter dropdown
  const uniqueAssignments = Array.from(
    new Map(submissions.map(s => [s.assignment_id, s.assignment])).values()
  ).filter(Boolean);

  if (loading) {
    return <LoadingSpinner text="Öğretmen paneli yükleniyor..." size="lg" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Teacher Welcome Banner */}
      <div 
        className="dvlp-card" 
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(34, 211, 238, 0.06) 100%)',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          padding: '2rem'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="dvlp-badge dvlp-badge-purple" style={{ fontSize: '0.75rem' }}>
                Öğretmen Yönetim Portalı
              </span>
              {pendingRequestsCount > 0 && (
                <span className="dvlp-badge dvlp-badge-warning" style={{ fontSize: '0.75rem' }}>
                  <Inbox size={12} /> {pendingRequestsCount} Bekleyen Talep
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Hoş Geldiniz, {profile?.full_name || 'Öğretmen'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Sınıflarınızdaki edebiyat ödevlerini inceleyin, PDF'leri denetleyin ve özel geri bildirimler yazın.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/teacher/assignments" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" icon={BookOpen}>
                Yeni Ödev Konusu Aç
              </Button>
            </Link>
            {pendingRequestsCount > 0 && (
              <Link to="/teacher/requests" style={{ textDecoration: 'none' }}>
                <Button variant="primary" icon={Inbox}>
                  Talepleri İncele ({pendingRequestsCount})
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Toplam Sınıf</span>
            <div style={{ color: 'var(--accent-purple)' }}>
              <Layers size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {classes.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Aktif şube sayısı
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>İnceleme Bekleyen</span>
            <div style={{ color: 'var(--color-warning)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-warning)' }}>
            {awaitingReviewCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Değerlendirme bekleyen PDF
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>İncelenen Ödevler</span>
            <div style={{ color: 'var(--color-success)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)' }}>
            {reviewedCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            İncelemesi tamamlanan
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Aktif Öğrenci</span>
            <div style={{ color: 'var(--accent-cyan)' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {uniqueStudents}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Ödev teslim eden öğrenci
          </div>
        </Card>
      </div>

      {/* Submissions Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>Ödev İnceleme Tablosu</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Tüm sınıflardan gelen ödevleri filtreleyin, PDF'leri açın ve değerlendirin.
            </p>
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Öğrenci veya ödev ara..."
                className="dvlp-input"
                style={{ paddingLeft: '2.2rem', height: '38px', fontSize: '0.85rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Class Selector */}
            <select
              className="dvlp-select"
              style={{ width: '150px', height: '38px', fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="all">Tüm Sınıflar</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Review Status Filter */}
            <select
              className="dvlp-select"
              style={{ width: '160px', height: '38px', fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tüm Durumlar</option>
              <option value="not_reviewed">İnceleme Bekleyen</option>
              <option value="reviewed">İncelenenler</option>
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        {filteredSubmissions.length === 0 ? (
          <div className="dvlp-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Filtrelere uygun ödev teslimi bulunamadı.
          </div>
        ) : (
          <div className="dvlp-table-container">
            <table className="dvlp-table">
              <thead>
                <tr>
                  <th>Öğrenci Adı</th>
                  <th>Sınıf</th>
                  <th>Ödev Başlığı</th>
                  <th>Teslim / Düzenleme Tarihi</th>
                  <th>İnceleme Durumu</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub) => {
                  const isRev = sub.review_status === 'reviewed';
                  const dateStr = new Date(sub.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                  const updatedStr = sub.updated_at !== sub.created_at
                    ? ` (Düzenlendi: ${new Date(sub.updated_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })})`
                    : '';

                  return (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <Link 
                          to={`/teacher/classes/${sub.class_id}/students/${sub.student_id}`}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {sub.student?.full_name || 'Öğrenci'}
                        </Link>
                      </td>
                      <td>
                        <span className="dvlp-badge dvlp-badge-neutral" style={{ fontSize: '0.75rem' }}>
                          {sub.class?.name || 'Sınıf'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sub.assignment?.title || 'Ödev'}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {dateStr}
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {updatedStr}
                        </span>
                      </td>
                      <td>
                        {isRev ? (
                          <Badge variant="success" icon={CheckCircle2} size="sm">
                            İncelendi
                          </Badge>
                        ) : (
                          <Badge variant="warning" icon={Clock} size="sm">
                            İnceleme Bekliyor
                          </Badge>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="dvlp-btn dvlp-btn-secondary dvlp-btn-sm"
                            onClick={() => openPdfViewer(sub)}
                            title="Hızlı PDF Önizleme"
                          >
                            <ExternalLink size={13} /> PDF
                          </button>
                          <Link 
                            to={`/teacher/submissions/${sub.id}`} 
                            className="dvlp-btn dvlp-btn-primary dvlp-btn-sm"
                            style={{ textDecoration: 'none' }}
                          >
                            İncele / Puanla <ArrowRight size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick PDF Viewer Modal */}
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

export default TeacherDashboard;
