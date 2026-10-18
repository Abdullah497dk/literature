import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Server, Database, ShieldCheck, Key, ExternalLink } from 'lucide-react';

export function Settings() {
  const { isSupabaseConfigured, role } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Sistem Ayarları &amp; Durum</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Bağlantı durumu, veritabanı ayarları ve platform ortam bilgileri.
        </p>
      </div>

      {/* Supabase Connection Status */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database size={22} style={{ color: 'var(--accent-purple)' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Supabase PostgreSQL &amp; Storage</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Arka plan veritabanı ve özel PDF depolama entegrasyonu
              </p>
            </div>
          </div>

          {isSupabaseConfigured ? (
            <Badge variant="success" size="sm">Canlı Bağlantı Aktif</Badge>
          ) : (
            <Badge variant="warning" size="sm">Yerel Test Modu</Badge>
          )}
        </div>

        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Supabase Proje URL:</span>
            <code style={{ color: 'var(--accent-cyan)' }}>
              {import.meta.env.VITE_SUPABASE_URL || 'Yapılandırılmadı (.env)'}
            </code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Anon / Public Key:</span>
            <code style={{ color: 'var(--accent-cyan)' }}>
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? '••••••••••••••••' : 'Yapılandırılmadı (.env)'}
            </code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Özel Depolama Kovası (Bucket):</span>
            <code style={{ color: 'var(--text-primary)' }}>homework-submissions</code>
          </div>
        </div>
      </Card>

      {/* Security Policies Info */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={22} style={{ color: 'var(--color-success)' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Güvenlik ve Satır Düzeyinde Yetkilendirme (RLS)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Veritabanı düzeyinde zorunlu kılınan güvenlik politikaları
            </p>
          </div>
        </div>

        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', lineHeight: 1.5 }}>
          <li>Öğrenciler yalnızca kendi sınıflarındaki ödevleri ve kendi teslim ettikleri PDF'leri yönetebilir.</li>
          <li>Öğretmen yorumları ve değerlendirmeleri strictly private (kesinlikle gizli) olup yalnızca ilgili öğrenciye ve öğretmenlere açıktır.</li>
          <li>Kullanıcı rolleri güvenilir veritabanı kayıtları ile yönetilir, tarayıcı üzerinden rol yükseltme engellenmiştir.</li>
          <li>PDF dosyaları özel (private) depolama alanında tutulur ve yalnızca yetkilendirilmiş kısa süreli imzalı URL'ler ile erişilebilir.</li>
        </ul>
      </Card>
    </div>
  );
}

export function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sayfa Bulunamadı</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '420px' }}>
        Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı kalmış olabilir.
      </p>
      <a href="/dashboard" className="dvlp-btn dvlp-btn-primary">
        Gösterge Paneline Dön
      </a>
    </div>
  );
}

export default Settings;
