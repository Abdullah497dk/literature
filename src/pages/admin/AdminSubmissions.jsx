import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { submissionsService } from '../../services/submissions';
import { classesService } from '../../services/classes';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotifications } from '../../context/NotificationContext';
import {
  FileCheck2,
  Search,
  ExternalLink,
  Clock,
  CheckCircle2,
  Trash2,
  Layers
} from 'lucide-react';

export function AdminSubmissions() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // PDF Preview Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);

  // Delete Confirm
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showToast } = useNotifications();

  const loadData = async () => {
    setLoading(true);
    try {
      const [subsRes, clsRes] = await Promise.all([
        submissionsService.getAllSubmissions(),
        classesService.getClasses()
      ]);
      setSubmissions(subsRes.data || []);
      setClasses(clsRes.data || []);
    } catch (e) {
      console.error('AdminSubmissions load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  const handleDelete = async () => {
    if (!subToDelete) return;
    setDeleteLoading(true);
    try {
      const { error } = await submissionsService.deleteSubmission(subToDelete.id);
      if (error) throw error;

      showToast('Ödev kaydı ve dosyası sistemden silindi.');
      setDeleteDialogOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Silinemedi.', 'danger');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = submissions.filter(s => {
    if (classFilter !== 'all' && s.class_id !== classFilter) return false;
    if (statusFilter !== 'all' && s.review_status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const sName = (s.student?.full_name || '').toLowerCase();
      const aTitle = (s.assignment?.title || '').toLowerCase();
      const fName = (s.original_filename || '').toLowerCase();
      return sName.includes(q) || aTitle.includes(q) || fName.includes(q);
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Ödevler yükleniyor..." size="lg" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Tüm Ödev Teslimleri</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sistemdeki tüm sınıflardan teslim edilen PDF ödevlerin listesi ve denetimi.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Öğrenci veya ödev ara..."
              className="dvlp-input"
              style={{ paddingLeft: '2.2rem', height: '38px', fontSize: '0.85rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="dvlp-select"
            style={{ width: '150px', height: '38px', fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="all">Tüm Sınıflar</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

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

      <div className="dvlp-table-container">
        <table className="dvlp-table">
          <thead>
            <tr>
              <th>Öğrenci</th>
              <th>Sınıf</th>
              <th>Ödev Başlığı</th>
              <th>Dosya (PDF)</th>
              <th>Teslim Tarihi</th>
              <th>Durum</th>
              <th style={{ textAlign: 'right' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sub => (
              <tr key={sub.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {sub.student?.full_name || 'Öğrenci'}
                </td>
                <td>
                  <span className="dvlp-badge dvlp-badge-neutral" style={{ fontSize: '0.75rem' }}>
                    {sub.class?.name || 'Sınıf'}
                  </span>
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
                <td style={{ fontSize: '0.85rem' }}>
                  {new Date(sub.created_at).toLocaleDateString('tr-TR')}
                </td>
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
                      title="PDF Aç"
                    >
                      <ExternalLink size={13} /> PDF
                    </button>
                    <button
                      type="button"
                      className="dvlp-btn dvlp-btn-ghost dvlp-btn-sm"
                      onClick={() => {
                        setSubToDelete(sub);
                        setDeleteDialogOpen(true);
                      }}
                      title="Sil"
                    >
                      <Trash2 size={13} style={{ color: 'var(--color-danger)' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Ödevi Sistemden Silmek İstediğinize Emin Misiniz?"
        message={`"${subToDelete?.assignment?.title}" (${subToDelete?.student?.full_name}) ödevi kalıcı olarak silinecektir.`}
        confirmText="Evet, Sil"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}

export default AdminSubmissions;
