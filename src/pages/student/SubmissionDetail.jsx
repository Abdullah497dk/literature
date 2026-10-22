import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { submissionsService } from '../../services/submissions';
import { feedbackService } from '../../services/feedback';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Clock,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Trash2,
  ArrowLeft,
  MessageSquare,
  UploadCloud,
  FileCheck
} from 'lucide-react';

export function SubmissionDetail() {
  const { submissionId } = useParams();
  const { user, profile } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [signedPdfUrl, setSignedPdfUrl] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);

  // Edit State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadSubmission = async () => {
    if (!submissionId) return;
    setLoading(true);
    try {
      const { data, error } = await submissionsService.getSubmissionById(submissionId);
      if (error || !data) {
        showToast('Ödev teslimi bulunamadı.', 'danger');
        navigate('/dashboard');
        return;
      }

      setSubmission(data);
      setEditNote(data.student_note || '');

      // Load signed PDF URL
      const { url } = await submissionsService.getSignedPdfUrl(data.file_path);
      setSignedPdfUrl(url || data.pdf_url);

      // Load private feedback
      const { data: fb } = await feedbackService.getFeedbackBySubmission(
        data.id,
        user.id,
        profile?.role || 'student'
      );
      setFeedbackList(fb || []);
    } catch (e) {
      console.error('Submission load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmission();
  }, [submissionId, user?.id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      let filePath = submission.file_path;
      let filename = submission.original_filename;
      let fileSize = submission.file_size;
      let demoPreviewUrl = submission.pdf_url;

      // If user provided a new replacement PDF
      if (newFile) {
        if (newFile.type !== 'application/pdf' && !newFile.name.toLowerCase().endsWith('.pdf')) {
          setEditError('Yalnızca PDF formatında dosya yükleyebilirsiniz.');
          setEditLoading(false);
          return;
        }
        if (newFile.size > 10 * 1024 * 1024) {
          setEditError('Dosya boyutu 10 MB sınırını aşamaz.');
          setEditLoading(false);
          return;
        }

        const uploadRes = await submissionsService.uploadPdfFile(
          newFile,
          submission.class_id,
          user.id
        );
        filePath = uploadRes.path;
        filename = uploadRes.originalFilename;
        fileSize = uploadRes.fileSize;
        demoPreviewUrl = uploadRes.previewUrl;
      }

      // Update submission record
      const { error: updErr } = await submissionsService.updateSubmission(submission.id, {
        file_path: filePath,
        original_filename: filename,
        file_size: fileSize,
        student_note: editNote,
        ...(newFile ? { review_status: 'not_reviewed', reviewed_at: null, reviewed_by: null } : {}),
        demoPreviewUrl
      });

      if (updErr) throw updErr;

      showToast('Ödeviniz güncellendi! Düzenlenen ödev tekrar inceleme sırasına alındı.');
      setEditModalOpen(false);
      setNewFile(null);
      await loadSubmission();
    } catch (err) {
      setEditError(err.message || 'Güncelleme sırasında hata oluştu.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const { error } = await submissionsService.deleteSubmission(submission.id);
      if (error) throw error;

      showToast('Ödeviniz başarıyla silindi.');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Silme işlemi başarısız oldu.', 'danger');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Ödev detayları getiriliyor..." size="lg" />;
  }

  if (!submission) return null;

  const isReviewed = submission.review_status === 'reviewed';
  const isOwner = submission.student_id === user?.id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/dashboard" className="dvlp-btn dvlp-btn-ghost dvlp-btn-sm" style={{ padding: '0.4rem' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="dvlp-badge dvlp-badge-cyan" style={{ fontSize: '0.75rem' }}>
                {submission.class?.name || 'Sınıf'}
              </span>
              {isReviewed ? (
                <Badge variant="success" icon={CheckCircle2}>
                  Öğretmen İnceledi
                </Badge>
              ) : (
                <Badge variant="warning" icon={Clock}>
                  İnceleme Bekliyor
                </Badge>
              )}
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {submission.assignment?.title || 'Ödev'}
            </h1>
          </div>
        </div>

        {/* Action Buttons for Student */}
        {isOwner && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="secondary"
              size="sm"
              icon={Edit3}
              onClick={() => setEditModalOpen(true)}
            >
              Ödevi Düzenle
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Sil
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid: PDF & Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Metadata & Student Note */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>
              Teslim Bilgileri
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Öğrenci:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {submission.student?.full_name || profile?.full_name}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>İlk Teslim:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {new Date(submission.created_at).toLocaleString('tr-TR')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Son Düzenleme:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {submission.updated_at !== submission.created_at
                    ? new Date(submission.updated_at).toLocaleString('tr-TR')
                    : 'Düzenlenmedi'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dosya Boyutu:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {(submission.file_size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Dosya Adı:</span>
                <span 
                  style={{ 
                    color: 'var(--accent-cyan)', 
                    fontWeight: 500,
                    maxWidth: '220px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'right'
                  }}
                  title={submission.original_filename}
                >
                  {submission.original_filename}
                </span>
              </div>
            </div>

            {submission.student_note && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Öğrenci Notu:
                </span>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontStyle: 'italic', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px' }}>
                  "{submission.student_note}"
                </p>
              </div>
            )}
          </Card>

          {/* Assignment Description Info */}
          {submission.assignment?.description && (
            <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>
                Ödev Yönergesi
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {submission.assignment.description}
              </p>
            </Card>
          )}

          {/* Teacher Feedback Section (Strictly Private) */}
          <Card glow={feedbackList.length > 0} style={{ borderColor: feedbackList.length > 0 ? 'var(--accent-purple)' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <MessageSquare size={18} style={{ color: 'var(--accent-purple)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Öğretmen Geri Bildirimi</h3>
            </div>

            {feedbackList.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Öğretmeniniz henüz bu ödev için özel bir geri bildirim yorumu yazmadı.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {feedbackList.map(fb => (
                  <div 
                    key={fb.id} 
                    style={{
                      background: 'rgba(139, 92, 246, 0.08)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      borderRadius: '12px',
                      padding: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {fb.teacher?.full_name || 'Edebiyat Öğretmeni'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(fb.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {fb.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: PDF Preview Frame */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Teslim Edilen Belge (PDF)</h3>
            {signedPdfUrl && (
              <a
                href={signedPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="dvlp-btn dvlp-btn-secondary dvlp-btn-sm"
                style={{ textDecoration: 'none' }}
              >
                <ExternalLink size={14} /> Yeni Sekmede Aç
              </a>
            )}
          </div>

          <div 
            style={{
              width: '100%',
              height: '560px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              background: '#121215'
            }}
          >
            {signedPdfUrl ? (
              <iframe
                src={`${signedPdfUrl}#toolbar=1`}
                title="PDF Önizleme"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                PDF yükleniyor...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Homework Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Ödevi Düzenle"
        maxWidth="540px"
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {editError && (
            <div style={{ padding: '0.75rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '10px', fontSize: '0.85rem' }}>
              {editError}
            </div>
          )}

          <div>
            <label className="dvlp-label">PDF Dosyasını Değiştir (İsteğe Bağlı)</label>
            <div
              style={{
                border: '1px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center',
                background: 'var(--bg-secondary)',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('edit-pdf-file')?.click()}
            >
              <input
                id="edit-pdf-file"
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => setNewFile(e.target.files?.[0] || null)}
              />
              {newFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-success)', minWidth: 0 }}>
                  <FileCheck size={20} style={{ flexShrink: 0 }} />
                  <span 
                    style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: 500, 
                      maxWidth: '280px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}
                    title={newFile.name}
                  >
                    {newFile.name} seçildi
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <UploadCloud size={18} />
                  Yeni bir PDF seçerek mevcut dosyayı değiştirebilirsiniz
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              * PDF dosyasını değiştirirseniz inceleme durumu otomatik olarak "İnceleme Bekliyor" olarak güncellenir.
            </p>
          </div>

          <Textarea
            label="Öğrenci Notunu Düzenle"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            rows={3}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Vazgeç
            </Button>
            <Button type="submit" variant="primary" loading={editLoading}>
              Değişiklikleri Kaydet
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Ödevi Silmek İstediğinize Emin Misiniz?"
        message={`"${submission.assignment?.title}" başlıklı ödeviniz ve yüklediğiniz PDF dosyası kalıcı olarak silinecektir. Bu işlem geri alınamaz.`}
        confirmText="Evet, Ödevi Sil"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}

export default SubmissionDetail;
