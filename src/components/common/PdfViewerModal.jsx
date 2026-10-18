import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ExternalLink, FileText, Download } from 'lucide-react';

export function PdfViewerModal({
  isOpen,
  onClose,
  title = 'Ödev Dosyası (PDF)',
  pdfUrl,
  filename,
  fileSize,
  studentName,
  assignmentTitle
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="880px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Info Header Bar */}
        <div 
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={20} style={{ color: 'var(--accent-purple)' }} />
            <div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {filename || 'odev.pdf'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {assignmentTitle ? `${assignmentTitle} • ` : ''}
                {studentName ? `${studentName} • ` : ''}
                {fileSize ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB` : ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dvlp-btn dvlp-btn-secondary dvlp-btn-sm"
                style={{ textDecoration: 'none' }}
              >
                <ExternalLink size={14} /> Yeni Sekmede Aç
              </a>
            )}
          </div>
        </div>

        {/* PDF Embed Area */}
        <div 
          style={{
            width: '100%',
            height: '520px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            background: '#121215'
          }}
        >
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=1`}
              title="PDF Önizleme"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          ) : (
            <div 
              style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--text-muted)',
                gap: '0.5rem'
              }}
            >
              <FileText size={48} opacity={0.4} />
              <p>PDF URL'si oluşturulamadı veya bağlantı süresi doldu.</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Button variant="secondary" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default PdfViewerModal;
