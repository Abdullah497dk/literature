import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import { classesService } from '../../services/classes';
import { submissionsService } from '../../services/submissions';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import {
  GraduationCap,
  User,
  FileText,
  Calendar,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

export function ClassmateProfile() {
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
        
        // Filter submissions belonging to this student in this class
        const studentSubs = (subsRes.data || []).filter(s => s.student_id === studentId);
        setSubmissions(studentSubs);
      } catch (e) {
        console.error('Classmate profile load error', e);
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
    return <LoadingSpinner text="Profil yükleniyor..." size="lg" />;
  }

  if (!student) {
    return (
      <div className="dvlp-card" style={{ maxWidth: '480px', margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>
        <h3>Öğrenci Profili Bulunamadı</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
          İstenen öğrenci kaydı bulunamadı veya bu sınıfta kayıtlı değil.
        </p>
        <Link to={`/class/${classId}`} className="dvlp-btn dvlp-btn-secondary">
          Sınıfa Dön
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to={`/class/${classId}`} className="dvlp-btn dvlp-btn-ghost dvlp-btn-sm" style={{ padding: '0.4rem' }}>
          <ArrowLeft size={18} />
        </Link>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {classData?.name} / Sınıf Arkadaşı Profili
        </span>
      </div>

      {/* Profile Card */}
      <Card glow style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
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

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.full_name}
              </h1>
              <Badge variant="cyan" size="sm">Öğrenci</Badge>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {classData?.name} Sınıfı Öğrencisi
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {submissions.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Teslim Edilen Ödev
            </div>
          </div>
        </div>
      </Card>

      {/* Submissions Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Sınıfta Paylaşılan Ödevler</h3>
        
        {submissions.length === 0 ? (
          <div className="dvlp-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Bu öğrenci henüz bu sınıfta paylaşılan bir ödev teslim etmemiş.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {submissions.map(sub => (
              <Card key={sub.id} hoverable style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div 
                    style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '12px', 
                      background: 'var(--bg-secondary)', 
                      color: 'var(--accent-purple)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {sub.assignment?.title || 'Edebiyat Ödevi'}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} /> {new Date(sub.created_at).toLocaleDateString('tr-TR')}
                      </span>
                      <span>•</span>
                      <span 
                        style={{ 
                          maxWidth: '200px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          display: 'inline-block',
                          verticalAlign: 'middle'
                        }}
                        title={sub.original_filename}
                      >
                        {sub.original_filename}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => openPdfViewer(sub)}
                >
                  PDF Aç
                </Button>
              </Card>
            ))}
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

export default ClassmateProfile;
