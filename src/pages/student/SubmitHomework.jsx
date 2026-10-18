import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { assignmentsService } from '../../services/assignments';
import { classesService } from '../../services/classes';
import { submissionsService } from '../../services/submissions';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  UploadCloud,
  AlertCircle,
  ArrowLeft,
  X,
  FileCheck
} from 'lucide-react';

export function SubmitHomework() {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classInfo, setClassInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  
  // Form fields
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [studentNote, setStudentNote] = useState('');
  const [formError, setFormError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    async function init() {
      if (!user?.id) return;
      setLoading(true);
      try {
        const { data: mems } = await classesService.getStudentMemberships(user.id);
        const approved = (mems || []).find(m => m.status === 'approved');

        if (!approved) {
          setClassInfo(null);
          setLoading(false);
          return;
        }

        setClassInfo(approved.class);
        const { data: asgs } = await assignmentsService.getAssignmentsByClass(approved.class_id, true);
        setAssignments(asgs || []);
        if (asgs && asgs.length > 0) {
          setSelectedAssignmentId(asgs[0].id);
        }
      } catch (e) {
        console.error('SubmitHomework init error', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [user?.id]);

  const validateFile = (file) => {
    setFileError('');
    if (!file) return false;

    // Check type and extension
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setFileError('Lütfen yalnızca PDF (.pdf) formatında bir dosya seçin.');
      return false;
    }

    // Check size limit: 10 MB
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setFileError('Dosya boyutu 10 MB sınırını aşamaz. Lütfen dosyanızı sıkıştırın.');
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent duplicate clicks
    setFormError('');

    if (!selectedAssignmentId) {
      setFormError('Lütfen bir ödev konusu seçiniz.');
      return;
    }

    if (!selectedFile) {
      setFormError('Lütfen teslim edilecek PDF dosyasını yükleyiniz.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload to storage
      const uploadResult = await submissionsService.uploadPdfFile(
        selectedFile,
        classInfo.id,
        user.id
      );

      // 2. Create submission record in database
      const { data: sub, error: subErr } = await submissionsService.createSubmission({
        assignment_id: selectedAssignmentId,
        class_id: classInfo.id,
        student_id: user.id,
        file_path: uploadResult.path,
        original_filename: uploadResult.originalFilename,
        file_size: uploadResult.fileSize,
        student_note: studentNote,
        demoPreviewUrl: uploadResult.previewUrl
      });

      if (subErr) throw subErr;

      showToast('Ödeviniz başarıyla yüklendi! Öğretmen incelemesi bekleniyor.');
      navigate(`/submissions/${sub.id}`);
    } catch (err) {
      console.error('Submission error', err);
      setFormError(err.message || 'Ödev yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Ödev yükleme sayfası hazırlanıyor..." size="lg" />;
  }

  if (!classInfo) {
    return (
      <div className="dvlp-card" style={{ maxWidth: '560px', margin: '2rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <AlertCircle size={40} style={{ color: 'var(--color-warning)', margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Aktif Sınıf Bulunamadı</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Ödev yükleyebilmek için onaylanmış bir sınıf üyeliğinizin olması gerekmektedir. Lütfen önce gösterge panelinden sınıf kodunuzla katılım talebinde bulununuz.
        </p>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <Button variant="primary">Gösterge Paneline Dön</Button>
        </Link>
      </div>
    );
  }

  const selectedAsg = assignments.find(a => a.id === selectedAssignmentId);

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/dashboard" className="dvlp-btn dvlp-btn-ghost dvlp-btn-sm" style={{ padding: '0.4rem' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Ödev Teslim Et</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {classInfo.name} sınıfı için PDF formatında ödev yükleyin.
          </p>
        </div>
      </div>

      <Card glow style={{ padding: '2rem' }}>
        {formError && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger-border)',
              borderRadius: '12px',
              color: '#f87171',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Assignment Selection */}
          {assignments.length === 0 ? (
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Öğretmeniniz bu sınıf için henüz aktif bir ödev konusu tanımlamamış.
            </div>
          ) : (
            <div>
              <Select
                label="Ödev Konusu Seçin"
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                required
              >
                {assignments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.title} {a.due_at ? `(Son: ${new Date(a.due_at).toLocaleDateString('tr-TR')})` : ''}
                  </option>
                ))}
              </Select>

              {/* Assignment Instructions / Description */}
              {selectedAsg && selectedAsg.description && (
                <div 
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'rgba(139, 92, 246, 0.08)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginTop: '-0.5rem',
                    marginBottom: '1rem',
                    lineHeight: 1.5
                  }}
                >
                  <strong style={{ color: 'var(--accent-purple)', display: 'block', marginBottom: '0.2rem' }}>
                    Ödev Yönergesi:
                  </strong>
                  {selectedAsg.description}
                </div>
              )}
            </div>
          )}

          {/* PDF Drag & Drop Upload Zone */}
          <div>
            <label className="dvlp-label">Ödev Dosyası (PDF Formatında, En Fazla 10 MB)</label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragOver ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                borderRadius: '16px',
                padding: '2.25rem 1.5rem',
                textAlign: 'center',
                backgroundColor: isDragOver ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-secondary)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => document.getElementById('pdf-file-input')?.click()}
            >
              <input
                id="pdf-file-input"
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {selectedFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  <div style={{ color: 'var(--color-success)' }}>
                    <FileCheck size={32} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Hazır
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.4rem',
                      marginLeft: '0.5rem'
                    }}
                    title="Dosyayı Kaldır"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                  <div 
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '14px', 
                      background: 'rgba(139, 92, 246, 0.12)', 
                      color: 'var(--accent-purple)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <UploadCloud size={24} />
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    PDF dosyanızı buraya sürükleyin veya <span style={{ color: 'var(--accent-cyan)' }}>dosya seçin</span>
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    Sadece PDF dosyaları • Maksimum 10 MB
                  </div>
                </div>
              )}
            </div>

            {fileError && (
              <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                {fileError}
              </p>
            )}
          </div>

          {/* Student Note */}
          <Textarea
            label="Öğretmene Not (İsteğe Bağlı)"
            placeholder="Ödevle ilgili belirtmek istediğiniz ek açıklamalar veya kaynakça notları..."
            value={studentNote}
            onChange={(e) => setStudentNote(e.target.value)}
            rows={3}
          />

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" disabled={submitting}>
                Vazgeç
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={UploadCloud}
              disabled={!selectedFile || assignments.length === 0}
            >
              Ödevi Yükle ve Teslim Et
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default SubmitHomework;
