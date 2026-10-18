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
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  FileText,
  Clock,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  MessageSquare,
  Lock,
  Edit2,
  Trash2,
  Check
} from 'lucide-react';

export function TeacherSubmissionDetail() {
  const { submissionId } = useParams();
  const { user, profile } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [signedPdfUrl, setSignedPdfUrl] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);

  // Review status toggle
  const [reviewLoading, setReviewLoading] = useState(false);

  // New feedback state
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Edit feedback state
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const loadData = async () => {
    if (!submissionId) return;
    setLoading(true);
    try {
      const { data, error } = await submissionsService.getSubmissionById(submissionId);
      if (error || !data) {
        showToast('Ödev teslimi bulunamadı.', 'danger');
        navigate('/teacher/classes');
        return;
      }
      setSubmission(data);

      const { url } = await submissionsService.getSignedPdfUrl(data.file_path);
      setSignedPdfUrl(url || data.pdf_url);

      const { data: fb } = await feedbackService.getFeedbackBySubmission(
        data.id,
        user.id,
        profile?.role || 'teacher'
      );
      setFeedbackList(fb || []);
    } catch (e) {
      console.error('Teacher submission detail error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [submissionId]);

  const handleToggleReviewed = async () => {
    setReviewLoading(true);
    const nextReviewed = submission.review_status !== 'reviewed';
    try {
      const { error } = await submissionsService.markAsReviewed(submission.id, user.id, nextReviewed);
      if (error) throw error;

      showToast(nextReviewed ? 'Ödev "İncelendi" olarak işaretlendi.' : 'Ödev durumu "İnceleme Bekliyor" olarak güncellendi.');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Durum güncellenemedi.', 'danger');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedbackText.trim()) return;
    setFeedbackLoading(true);

    try {
      const { error } = await feedbackService.addFeedback({
        submission_id: submission.id,
        teacher_id: user.id,
        content: newFeedbackText.trim()
      });

      if (error) throw error;

      // Also automatically mark as reviewed if not yet reviewed
      if (submission.review_status !== 'reviewed') {
        await submissionsService.markAsReviewed(submission.id, user.id, true);
      }

      showToast('Özel öğretmen geri bildirimi kaydedildi ve öğrenciye bildirildi.');
      setNewFeedbackText('');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Geri bildirim kaydedilemedi.', 'danger');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleSaveEditFeedback = async (fbId) => {
    if (!editingText.trim()) return;
    try {
      const { error } = await feedbackService.updateFeedback(fbId, editingText.trim());
      if (error) throw error;

      showToast('Geri bildirim güncellendi.');
      setEditingFeedbackId(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Güncellenemedi.', 'danger');
    }
  };

  const handleDeleteFeedback = async (fbId) => {
    try {
      const { error } = await feedbackService.deleteFeedback(fbId);
      if (error) throw error;
      showToast('Geri bildirim silindi.');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Silinemedi.', 'danger');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Ödev ve PDF yükleniyor..." size="lg" />;
  }

  if (!submission) return null;

  const isReviewed = submission.review_status === 'reviewed';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="dvlp-btn dvlp-btn-ghost dvlp-btn-sm"
            style={{ padding: '0.4rem' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="dvlp-badge dvlp-badge-cyan" style={{ fontSize: '0.75rem' }}>
                {submission.class?.name}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Öğrenci: <strong style={{ color: 'var(--text-primary)' }}>{submission.student?.full_name}</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {submission.assignment?.title}
            </h1>
          </div>
        </div>

        {/* Mark as Reviewed Toggle Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant={isReviewed ? 'secondary' : 'primary'}
            icon={isReviewed ? CheckCircle2 : Clock}
            onClick={handleToggleReviewed}
            loading={reviewLoading}
          >
            {isReviewed ? 'İncelendi Olarak İşaretli (Geri Al)' : 'Ödevi İncelendi Olarak İşaretle'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Left PDF, Right Review Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(360px, 1fr)', gap: '1.5rem' }}>
        {/* PDF Frame */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} /> {submission.original_filename} ({(submission.file_size / (1024 * 1024)).toFixed(2)} MB)
            </span>
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
              height: '680px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              background: '#121215'
            }}
          >
            {signedPdfUrl ? (
              <iframe
                src={`${signedPdfUrl}#toolbar=1`}
                title="Ödev PDF İnceleme"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                PDF yüklenemedi.
              </div>
            )}
          </div>
        </div>

        {/* Right Inspection & Private Feedback Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Submission Metadata Card */}
          <Card style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Teslim Ayrıntıları
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Öğrenci:</span>
                <Link to={`/teacher/classes/${submission.class_id}/students/${submission.student_id}`} style={{ color: 'var(--accent-cyan)' }}>
                  {submission.student?.full_name}
                </Link>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>İlk Teslim Tarihi:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {new Date(submission.created_at).toLocaleString('tr-TR')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Son Düzenleme:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {submission.updated_at !== submission.created_at
                    ? new Date(submission.updated_at).toLocaleString('tr-TR')
                    : 'Düzenlenmedi'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>İnceleme Durumu:</span>
                {isReviewed ? (
                  <Badge variant="success" size="sm">İncelendi</Badge>
                ) : (
                  <Badge variant="warning" size="sm">İnceleme Bekliyor</Badge>
                )}
              </div>
            </div>

            {submission.student_note && (
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ÖĞRENCİ NOTU:</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontStyle: 'italic', background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '8px' }}>
                  "{submission.student_note}"
                </p>
              </div>
            )}
          </Card>

          {/* Private Feedback Box */}
          <Card glow style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} style={{ color: 'var(--accent-purple)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Özel Öğretmen Geri Bildirimi</h3>
              </div>
              <span className="dvlp-badge dvlp-badge-neutral" style={{ fontSize: '0.7rem' }}>
                <Lock size={10} /> Gizli &amp; Özel
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              * Yazacağınız değerlendirme yalnızca bu öğrenciye ve yetkili öğretmenlere görünür. Sınıftaki diğer öğrenciler bu yoruma kesinlikle erişemez.
            </p>

            {/* List of existing feedback */}
            {feedbackList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {feedbackList.map(fb => (
                  <div
                    key={fb.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '0.85rem'
                    }}
                  >
                    {editingFeedbackId === fb.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <textarea
                          className="dvlp-textarea"
                          rows={3}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <Button variant="secondary" size="sm" onClick={() => setEditingFeedbackId(null)}>
                            İptal
                          </Button>
                          <Button variant="primary" size="sm" onClick={() => handleSaveEditFeedback(fb.id)}>
                            Kaydet
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {fb.teacher?.full_name || 'Öğretmen'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {new Date(fb.created_at).toLocaleDateString('tr-TR')}
                            </span>
                            {fb.teacher_id === user.id && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingFeedbackId(fb.id);
                                    setEditingText(fb.content);
                                  }}
                                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                                  title="Düzenle"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFeedback(fb.id)}
                                  style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.2rem' }}
                                  title="Sil"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                          {fb.content}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Feedback Form */}
            <form onSubmit={handleAddFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Textarea
                placeholder="Öğrencinin ödevi için yapıcı geri bildirim ve notlarınızı yazın..."
                rows={4}
                value={newFeedbackText}
                onChange={(e) => setNewFeedbackText(e.target.value)}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={feedbackLoading}
                  disabled={!newFeedbackText.trim()}
                  icon={MessageSquare}
                >
                  Geri Bildirimi Kaydet ve Gönder
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TeacherSubmissionDetail;
