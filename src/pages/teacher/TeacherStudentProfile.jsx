import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import { classesService } from '../../services/classes';
import { submissionsService } from '../../services/submissions';
import { feedbackService } from '../../services/feedback';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import {
  GraduationCap,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export function TeacherStudentProfile() {
  const { classId, studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [classData, setClassData] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  // PDF Preview Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [profRes, clsRes, subsRes] = await Promise.all([
          authService.getUserProfile(studentId),
          classesService.getClassById(classId),
          submissionsService.getSubmissionsByClass(classId)
        ]);

        setStudent(profRes.data);
        setClassData(clsRes.data);

        // Fetch submissions and their teacher feedback
        const studentSubs = (subsRes.data || []).filter(s => s.student_id === studentId);
        
        // Enrich with feedback
        const enriched = await Promise.all(
          studentSubs.map(async sub => {
            const { data: fb } = await feedbackService.getFeedbackBySubmission(sub.id, studentId, 'teacher');
            return { ...sub, feedback: fb || [] };
          })
        );

        setSubmissions(enriched);
      } catch (e) {
        console.error('TeacherStudentProfile error', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId, studentId]);

  const openPdfViewer = async (sub) => {
    const { url } = await submissionsService.getSignedPdfUrl(sub.file_path);
    setSelectedPdf({
      url: url || sub.pdf_url,
      filename: sub.original_filename,
      filesize: sub.file_size,
      studentName: student?.full_name,
      assignmentTitle: sub.assignment?.title
    });
    setPdfModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner text="Öğrenci profili ve ödev geçmişi yükleniyor..." size="lg" />;
  }

  if (!student) {
    return (
      <div className="dvlp-card" style={{ maxWidth: '480px', margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>
        <h3>Öğrenci Bulunamadı</h3>
        <Link to={`/teacher/classes/${classId}`} className="dvlp-btn dvlp-btn-secondary" style={{ marginTop: '1rem' }}>
          Sınıfa Dön
        </Link>
      </div>
    );
  }

  const reviewedCount = submissions.filter(s => s.review_status === 'reviewed').length;
  const pendingCount = submissions.filter(s => s.review_status === 'not_reviewed').length;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to={`/teacher/classes/${classId}`} className="dvlp-btn dvlp-btn-ghost dvlp-btn-sm" style={{ padding: '0.4rem' }}>
          <ArrowLeft size={18} />
        </Link>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {classData?.name} / Öğrenci Detay Profili
        </span>
      </div>

      {/* Profile Overview Card */}
      <Card glow style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
              {student.full_name ? student.full_name[0].toUpperCase() : 'Ö'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{student.full_name}</h1>
                <Badge variant="cyan" size="sm">Öğrenci</Badge>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {classData?.name} Şubesi • {student.email || 'Kayıtlı Edebiyat Öğrencisi'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {submissions.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toplam Teslim</div>
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-success)' }}>
                {reviewedCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>İncelenen</div>
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-warning)' }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bekleyen</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Submissions & Teacher Feedback List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Ödev Teslimleri ve Değerlendirmeler</h3>

        {submissions.length === 0 ? (
          <div className="dvlp-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Öğrencinin bu sınıfta henüz ödev teslimi bulunmuyor.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {submissions.map(sub => {
              const isRev = sub.review_status === 'reviewed';
              const hasFeedback = sub.feedback && sub.feedback.length > 0;

              return (
                <Card key={sub.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {sub.assignment?.title || 'Ödev'}
                        </h4>
                        {isRev ? (
                          <Badge variant="success" size="sm" icon={CheckCircle2}>İncelendi</Badge>
                        ) : (
                          <Badge variant="warning" size="sm" icon={Clock}>İnceleme Bekliyor</Badge>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>Teslim: {new Date(sub.created_at).toLocaleString('tr-TR')}</span>
                        {sub.updated_at !== sub.created_at && (
                          <span>• Son Düzenleme: {new Date(sub.updated_at).toLocaleString('tr-TR')}</span>
                        )}
                        <span 
                          style={{ 
                            maxWidth: '220px', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            display: 'inline-block',
                            verticalAlign: 'middle'
                          }}
                          title={sub.original_filename}
                        >
                          • {sub.original_filename}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={ExternalLink}
                        onClick={() => openPdfViewer(sub)}
                      >
                        PDF Aç
                      </Button>
                      <Link
                        to={`/teacher/submissions/${sub.id}`}
                        className="dvlp-btn dvlp-btn-primary dvlp-btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        İncele &amp; Yorum Yaz <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>

                  {/* Student Note */}
                  {sub.student_note && (
                    <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      <strong>Öğrenci Notu:</strong> "{sub.student_note}"
                    </div>
                  )}

                  {/* Existing Private Feedback */}
                  {hasFeedback && (
                    <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '0.85rem', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', color: 'var(--accent-purple)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <MessageSquare size={14} /> Öğretmen Yorumu:
                      </div>
                      {sub.feedback.map(fb => (
                        <p key={fb.id} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {fb.content}
                        </p>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* PDF Modal */}
      <PdfViewerModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        pdfUrl={selectedPdf?.url}
        filename={selectedPdf?.filename}
        fileSize={selectedPdf?.filesize}
        studentName={student?.full_name}
        assignmentTitle={selectedPdf?.assignmentTitle}
      />
    </div>
  );
}

export default TeacherStudentProfile;
