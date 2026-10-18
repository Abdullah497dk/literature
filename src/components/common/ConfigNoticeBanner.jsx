import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, UserCheck, Shield, BookOpen, ExternalLink, X } from 'lucide-react';

export function ConfigNoticeBanner({ 
  isConfigured, 
  currentRole, 
  onSwitchDemoRole,
  currentUser 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isConfigured || isDismissed) return null;

  return (
    <div 
      style={{
        background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(34, 211, 238, 0.15) 100%)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
        padding: '0.6rem 1.25rem',
        fontSize: '0.85rem',
        color: 'var(--text-primary)',
        position: 'relative',
        zIndex: 50
      }}
    >
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          maxWidth: '1280px',
          margin: '0 auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertCircle size={17} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
          <span>
            <strong>Geliştirme / Yerel Test Modu:</strong> Supabase API anahtarları henüz <code style={{ color: 'var(--accent-purple)', background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>.env</code> dosyasına girilmedi. 
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-cyan)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              fontWeight: 500,
              fontSize: '0.8rem',
              padding: '0.1rem 0.4rem'
            }}
          >
            {isExpanded ? <>Kapat <ChevronUp size={14} /></> : <>Nasıl Bağlanır? <ChevronDown size={14} /></>}
          </button>
        </div>

        {/* Quick Role Switcher for local verification */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Rol Testi:</span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => onSwitchDemoRole?.('student')}
              className={`dvlp-badge ${currentRole === 'student' ? 'dvlp-badge-cyan' : 'dvlp-badge-neutral'}`}
              style={{ cursor: 'pointer', border: '1px solid var(--border-color)' }}
            >
              <UserCheck size={12} /> Öğrenci
            </button>
            <button
              type="button"
              onClick={() => onSwitchDemoRole?.('teacher')}
              className={`dvlp-badge ${currentRole === 'teacher' ? 'dvlp-badge-purple' : 'dvlp-badge-neutral'}`}
              style={{ cursor: 'pointer', border: '1px solid var(--border-color)' }}
            >
              <BookOpen size={12} /> Öğretmen
            </button>
            <button
              type="button"
              onClick={() => onSwitchDemoRole?.('admin')}
              className={`dvlp-badge ${currentRole === 'admin' ? 'dvlp-badge-warning' : 'dvlp-badge-neutral'}`}
              style={{ cursor: 'pointer', border: '1px solid var(--border-color)' }}
            >
              <Shield size={12} /> Yönetici
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.2rem'
            }}
            title="Gizle"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div 
          style={{
            maxWidth: '1280px',
            margin: '0.75rem auto 0 auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5
          }}
        >
          <p style={{ marginBottom: '0.4rem' }}>
            <strong>Canlı Supabase Bağlantısı Kurulumu:</strong>
          </p>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>
              Projeniz için <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>supabase.com</a> adresinde yeni bir proje oluşturun.
            </li>
            <li>
              Supabase Dashboard &gt; <strong>SQL Editor</strong> bölümüne gidin ve proje kökündeki <code style={{ color: 'var(--text-primary)' }}>supabase/setup.sql</code> dosyasını yapıştırıp çalıştırın.
            </li>
            <li>
              Supabase Dashboard &gt; <strong>Project Settings &gt; API</strong> sekmesindeki <em>Project URL</em> ve <em>anon public key</em> değerlerini <code style={{ color: 'var(--text-primary)' }}>.env</code> dosyasına ekleyin.
            </li>
            <li>
              Depolama için <code style={{ color: 'var(--text-primary)' }}>homework-submissions</code> özel (private) depolama alanı otomatik oluşturulacaktır.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

export default ConfigNoticeBanner;
