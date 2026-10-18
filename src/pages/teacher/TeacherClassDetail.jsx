import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { classesService } from '../../services/classes';
import { assignmentsService } from '../../services/assignments';
import { submissionsService } from '../../services/submissions';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import {
  Layers,
  Users,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Plus
} from 'lucide-react';

export function TeacherClassDetail() {
  const { classId } = useParams();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [members, setMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('submissions'); // submissions, students, assignments

  // PDF Preview
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [clsRes, memsRes, asgsRes, subsRes] = await Promise.all([
          classesService.getClassById(classId),
          classesService.getClassMembers(classId),
          assignmentsService.getAssignmentsByClass(classId),
          submissionsService.getSubmissionsByClass(classId)
        ]);

        setClassData(clsRes.data);
        setMembers((memsRes.data || []).filter(m => m.status === 'approved'));
        setAssignments(asgsRes.data || []);
        setSubmissions(subsRes.data || []);
      } catch (e) {
        console.error('TeacherClassDetail error', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId]);

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
    return <LoadingSpinner text="Sınıf bilgileri ve ödevler yükleniyor..." size="lg" />;
  }

  if (!classData) {
    return (
      <div className="dvlp-card" style={{ maxWidth: '480px', margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>
        <h3>Sınıf Bulunamadı</h3>
        <Link to="/teacher/classes" className="dvlp-btn dvlp-btn-secondary" style={{ marginTop: '1rem' }}>
          Sınıflara Dön
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/teacher/classes" className="dvlp-btn dvlp-btn-ghost dvlp-btn-sm" style={{ padding: '0.4rem' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="dvlp-badge dvlp-badge-cyan" style={{ fontSize: '0.75rem' }}>
                {classData.name} Şubesi
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Katılım Kodu: <code style={{ color: 'var(--accent-purple)' }}>{classData.join_code}</code>
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 600 }}>
              {classData.name} Edebiyat Sınıfı
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/teacher/assignments" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm" icon={Plus}>
              Yeni Ödev Konusu
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`dvlp-btn dvlp-btn-sm ${activeTab === 'submissions' ? 'dvlp-btn-primary' : 'dvlp-btn-ghost'}`}
        >
          <FileText size={15} /> Teslim Edilen Ödevler ({submissions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`dvlp-btn dvlp-btn-sm ${activeTab === 'students' ? 'dvlp-btn-primary' : 'dvlp-btn-ghost'}`}
        >
          <Users size={15} /> Öğrenci Listesi ({members.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`dvlp-btn dvlp-btn-sm ${activeTab === 'assignments' ? 'dvlp-btn-primary' : 'dvlp-btn-ghost'}`}
        >
          <BookOpen size={15} /> Ödev Konuları ({assignments.length})
        </button>
      </div>

      {/* Tab Content: Submissions */}
      {activeTab === 'submissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {submissions.length === 0 ? (
            <div className="dvlp-card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              Bu sınıfta henüz bir ödev teslimi bulunmuyor.
            </div>
          ) : (
            <div className="dvlp-table-container">
              <table className="dvlp-table">
                <thead>
                  <tr>
                    <th>Öğrenci</th>
                    <th>Ödev Başlığı</th>
                    <th>Teslim Tarihi</th>
                    <th>Durum</th>
                    <th style={{ textAlign: 'right' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <Link 
                          to={`/teacher/classes/${classId}/students/${sub.student_id}`}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {sub.student?.full_name || 'Öğrenci'}
                        </Link>
                      </td>
                      <td>{sub.assignment?.title || 'Ödev'}</td>
                      <td>{new Date(sub.created_at).toLocaleDateString('tr-TR')}</td>
                      <td>
                        {sub.review_status === 'reviewed' ? (
                          <Badge variant="success" size="sm" icon={CheckCircle2}>İncelendi</Badge>
                        ) : (
                          <Badge variant="warning" size="sm" icon={Clock}>İnceleme Bekliyor</Badge>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="dvlp-btn dvlp-btn-secondary dvlp-btn-sm"
                            onClick={() => openPdfViewer(sub)}
                          >
                            <ExternalLink size={13} /> PDF
                          </button>
                          <Link to={`/teacher/submissions/${sub.id}`} className="dvlp-btn dvlp-btn-primary dvlp-btn-sm" style={{ textDecoration: 'none' }}>
                            İncele <ArrowRight size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Students */}
      {activeTab === 'students' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {members.map(mem => (
            <Card key={mem.id} hoverable style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: 'var(--accent-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  {mem.profile?.full_name ? mem.profile.full_name[0] : 'Ö'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                    {mem.profile?.full_name || 'Öğrenci'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Kayıt: {new Date(mem.requested_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>

              <Link
                to={`/teacher/classes/${classId}/students/${mem.user_id}`}
                className="dvlp-btn dvlp-btn-secondary dvlp-btn-sm"
                style={{ textDecoration: 'none' }}
              >
                Profili Aç <ArrowRight size={12} />
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Tab Content: Assignments */}
      {activeTab === 'assignments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {assignments.map(asg => (
            <Card key={asg.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {asg.title}
                </h3>
                {asg.is_active ? <Badge variant="cyan" size="sm">Aktif</Badge> : <Badge variant="neutral" size="sm">Arşiv</Badge>}
              </div>
              {asg.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {asg.description}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* PDF Modal */}
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

export default TeacherClassDetail;
