import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submissionsService } from '../../services/submissions';
import { classesService } from '../../services/classes';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import {
  UploadCloud,
  FileText,
  Clock,
  CheckCircle2,
  GraduationCap,
  Users,
  Search,
  ExternalLink,
  PlusCircle,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export function StudentDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [classMemberships, setClassMemberships] = useState([]);
  const [classActivity, setClassActivity] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  
  // PDF Preview Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);

  // Join Class Form State
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // 1. Get student memberships
      const { data: mems } = await classesService.getStudentMemberships(user.id);
      const approvedMems = (mems || []).filter(m => m.status === 'approved');
      setClassMemberships(mems || []);

      // 2. Get student's own submissions
      const { data: subs } = await submissionsService.getMySubmissions(user.id);
      setMySubmissions(subs || []);

      // 3. If in an approved class, get class shared activity
      if (approvedMems.length > 0) {
        const activeClassId = approvedMems[0].class_id;
        const { data: classSubs } = await submissionsService.getSubmissionsByClass(activeClassId);
        // Exclude own submissions from class activity feed to highlight classmates' work
        setClassActivity(classSubs || []);
      }
    } catch (e) {
      console.error('Student dashboard load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const approvedMembership = classMemberships.find(m => m.status === 'approved');
  const pendingMembership = classMemberships.find(m => m.status === 'pending');

  const reviewedCount = mySubmissions.filter(s => s.review_status === 'reviewed').length;
  const pendingReviewCount = mySubmissions.filter(s => s.review_status === 'not_reviewed').length;

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinLoading(true);
    setJoinError('');
    setJoinSuccess('');

    try {
      const { data: cls, error: clsErr } = await classesService.getClassByJoinCode(joinCode);
      if (clsErr || !cls) {
        setJoinError('Girilen sınıf kodu bulunamadı veya sınıf pasif durumda.');
        setJoinLoading(false);
        return;
      }

      const { error: reqErr } = await classesService.requestJoinClass(cls.id, user.id);
      if (reqErr) {
        setJoinError(reqErr.message || 'Katılım talebi gönderilemedi.');
        setJoinLoading(false);
        return;
      }

      setJoinSuccess(`"${cls.name}" sınıfına katılım talebiniz iletildi. Öğretmen onayı bekleniyor.`);
      setJoinCode('');
      await loadData();
    } catch (err) {
      setJoinError(err.message || 'Bir hata oluştu.');
    } finally {
      setJoinLoading(false);
    }
  };

  const openPdfViewer = async (sub) => {
    const { url } = await submissionsService.getSignedPdfUrl(sub.file_path);
    setSelectedPdf({
      url: url || sub.pdf_url,
      filename: sub.original_filename,
      filesize: sub.file_size,
      studentName: sub.student?.full_name || profile?.full_name,
      assignmentTitle: sub.assignment?.title
    });
    setPdfModalOpen(true);
  };

  // Filtered own submissions
  const filteredSubmissions = mySubmissions.filter(s => {
    const titleMatch = s.assignment?.title?.toLowerCase().includes(searchFilter.toLowerCase());
    const fileMatch = s.original_filename?.toLowerCase().includes(searchFilter.toLowerCase());
    return titleMatch || fileMatch;
  });

  if (loading) {
    return <LoadingSpinner text="Öğrenci paneli yükleniyor..." size="lg" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div 
        className="dvlp-card" 
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(34, 211, 238, 0.06) 100%)',
          borderColor: 'rgba(139, 92, 246, 0.25)',
          padding: '2rem'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="dvlp-badge dvlp-badge-purple" style={{ fontSize: '0.75rem' }}>
                Öğrenci Portalı
              </span>
              {approvedMembership && (
                <span className="dvlp-badge dvlp-badge-cyan" style={{ fontSize: '0.75rem' }}>
                  <GraduationCap size={12} /> {approvedMembership.class?.name} Şubesi
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Hoş Geldiniz, {profile?.full_name || 'Öğrenci'} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Edebiyat ödevlerinizi dijital ortamda PDF formatında teslim edin ve öğretmen geri bildirimlerini anlık takip edin.
            </p>
          </div>

          <div>
            {approvedMembership ? (
              <Link to="/submissions/new" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg" icon={UploadCloud}>
                  Yeni Ödev Yükle
                </Button>
              </Link>
            ) : (
              <Button 
                variant="primary" 
                size="lg" 
                icon={PlusCircle}
                onClick={() => {
                  const el = document.getElementById('join-class-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Sınıfa Katıl
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Class Membership Warning if not in class */}
      {!approvedMembership && (
        <div id="join-class-section" className="dvlp-card" style={{ borderColor: 'var(--accent-purple)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div 
              style={{ 
                background: 'var(--accent-purple-subtle)', 
                color: 'var(--accent-purple)', 
                padding: '0.75rem', 
                borderRadius: '14px',
                flexShrink: 0
              }}
            >
              <GraduationCap size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>
                Henüz Bir Sınıfa Kayıtlı Değilsiniz
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Ödev teslim edebilmek ve sınıf ödevlerini görüntüleyebilmek için öğretmeninizin sağladığı sınıf kodunu girerek katılım talebi oluşturmalısınız.
              </p>

              {pendingMembership && (
                <div 
                  style={{ 
                    padding: '0.75rem 1rem', 
                    background: 'var(--color-warning-bg)', 
                    border: '1px solid var(--color-warning-border)', 
                    borderRadius: '12px',
                    color: '#fbbf24',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Clock size={16} />
                  <span>
                    <strong>{pendingMembership.class?.name || 'Sınıf'}</strong> için katılım talebiniz öğretmen onayında bekliyor.
                  </span>
                </div>
              )}

              {joinError && (
                <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  {joinError}
                </div>
              )}
              {joinSuccess && (
                <div style={{ color: 'var(--color-success)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  {joinSuccess}
                </div>
              )}

              <form onSubmit={handleJoinClass} style={{ display: 'flex', gap: '0.75rem', maxWidth: '440px' }}>
                <input
                  type="text"
                  placeholder="Sınıf Kodu (Örn: EDEB-9A)"
                  className="dvlp-input"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Button type="submit" variant="primary" loading={joinLoading}>
                  Katıl
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Kayıtlı Sınıf
            </span>
            <div style={{ color: 'var(--accent-purple)' }}>
              <GraduationCap size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {approvedMembership?.class?.name || 'Kayıtsız'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {approvedMembership ? 'Aktif sınıf üyeliği' : 'Onay bekliyor veya kayıtsız'}
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Toplam Ödevlerim
            </span>
            <div style={{ color: 'var(--accent-cyan)' }}>
              <FileText size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {mySubmissions.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Teslim edilen PDF ödev sayısı
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              İncelenen Ödevler
            </span>
            <div style={{ color: 'var(--color-success)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-success)' }}>
            {reviewedCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Öğretmen değerlendirmesi tamamlandı
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              İnceleme Bekleyen
            </span>
            <div style={{ color: 'var(--color-warning)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-warning)' }}>
            {pendingReviewCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Öğretmen incelemesi sırasında
          </div>
        </Card>
      </div>

      {/* Main Section: My Submissions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>Ödev Teslimlerim</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Yüklediğiniz ödevler, inceleme durumları ve öğretmen geri bildirimleri.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Ödev başlığında ara..."
                className="dvlp-input"
                style={{ paddingLeft: '2.4rem', height: '38px', fontSize: '0.85rem' }}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>

            {approvedMembership && (
              <Link to="/submissions/new" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm" icon={UploadCloud}>
                  Ödev Yükle
                </Button>
              </Link>
            )}
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={searchFilter ? 'Arama sonucu bulunamadı' : 'Henüz ödev tesliminiz bulunmuyor'}
            description={
              approvedMembership
                ? 'Öğretmeninizin belirlediği ödev konusunu seçerek ilk PDF ödevinizi sisteme yükleyebilirsiniz.'
                : 'Ödev teslim edebilmek için önce sınıfınıza katılmalısınız.'
            }
            actionLabel={approvedMembership && !searchFilter ? 'İlk Ödevi Yükle' : undefined}
            onAction={() => navigate('/submissions/new')}
          />
        ) : (
          <div className="dvlp-table-container">
            <table className="dvlp-table">
              <thead>
                <tr>
                  <th>Ödev Başlığı</th>
                  <th>Dosya</th>
                  <th>Teslim Tarihi</th>
                  <th>Son Düzenleme</th>
                  <th>İnceleme Durumu</th>
                  <th>Geri Bildirim</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub) => {
                  const isReviewed = sub.review_status === 'reviewed';
                  const hasFeedback = sub.feedback && sub.feedback.length > 0;
                  const createdDate = new Date(sub.created_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  const updatedDate = sub.updated_at !== sub.created_at
                    ? new Date(sub.updated_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                    : '—';

                  return (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <Link to={`/submissions/${sub.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {sub.assignment?.title || 'Ödev'}
                        </Link>
                      </td>
                      <td style={{ maxWidth: '220px' }}>
                        <button
                          type="button"
                          onClick={() => openPdfViewer(sub)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-cyan)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.85rem',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textAlign: 'left'
                          }}
                          title={sub.original_filename}
                        >
                          <FileText size={15} style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sub.original_filename}
                          </span>
                        </button>
                      </td>
                      <td>{createdDate}</td>
                      <td>{updatedDate}</td>
                      <td>
                        {isReviewed ? (
                          <Badge variant="success" icon={CheckCircle2}>
                            Öğretmen İnceledi
                          </Badge>
                        ) : (
                          <Badge variant="warning" icon={Clock}>
                            İnceleme Bekliyor
                          </Badge>
                        )}
                      </td>
                      <td>
                        {hasFeedback ? (
                          <Badge variant="purple" icon={MessageSquare}>
                            Yorum Var
                          </Badge>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/submissions/${sub.id}`} className="dvlp-btn dvlp-btn-secondary dvlp-btn-sm" style={{ textDecoration: 'none' }}>
                          İncele <ArrowRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Class Shared Activity Feed (Permitted metadata and PDF files, NO private feedback) */}
      {approvedMembership && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>Sınıfım Etkinlik Akışı</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {approvedMembership.class?.name} sınıfındaki sınıf arkadaşlarınızın paylaştığı ödevler.
              </p>
            </div>
            <Link to="/my-class" className="dvlp-btn dvlp-btn-ghost dvlp-btn-sm" style={{ textDecoration: 'none' }}>
              <Users size={15} /> Tüm Sınıfı Gör
            </Link>
          </div>

          {classActivity.length === 0 ? (
            <div className="dvlp-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Sınıfta henüz paylaşılan bir ödev teslimi bulunmuyor.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {classActivity.slice(0, 6).map((activitySub) => (
                <Card key={activitySub.id} hoverable style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div 
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        {activitySub.student?.full_name ? activitySub.student.full_name[0] : 'Ö'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {activitySub.student?.full_name || 'Sınıf Arkadaşı'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(activitySub.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    </div>

                    {activitySub.review_status === 'reviewed' ? (
                      <Badge variant="success" size="sm">İncelendi</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Teslim Edildi</Badge>
                    )}
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {activitySub.assignment?.title || 'Edebiyat Ödevi'}
                    </h4>
                    <p 
                      style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={activitySub.original_filename}
                    >
                      Dosya: {activitySub.original_filename}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color-subtle)' }}>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={ExternalLink}
                      onClick={() => openPdfViewer(activitySub)}
                    >
                      PDF Görüntüle
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

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

export default StudentDashboard;
