import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classesService } from '../../services/classes';
import { submissionsService } from '../../services/submissions';
import { assignmentsService } from '../../services/assignments';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Layers, Users, BookOpen, FileText, ArrowRight, Copy, Check } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export function TeacherClasses() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const { showToast } = useNotifications();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: cls } = await classesService.getClasses();
        const { data: allSubs } = await submissionsService.getAllSubmissions();
        const { data: allAsgs } = await assignmentsService.getAllAssignments();

        const enriched = (cls || []).map(c => {
          const subs = (allSubs || []).filter(s => s.class_id === c.id);
          const asgs = (allAsgs || []).filter(a => a.class_id === c.id);
          const students = new Set(subs.map(s => s.student_id)).size;
          return {
            ...c,
            submissionCount: subs.length,
            assignmentCount: asgs.length,
            studentCount: students
          };
        });

        setClasses(enriched);
      } catch (e) {
        console.error('TeacherClasses load error', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Katılım kodu (${code}) kopyalandı.`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return <LoadingSpinner text="Sınıflar yükleniyor..." size="lg" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Tüm Edebiyat Sınıfları</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Mevcut şubeleri inceleyin, öğrenci listelerine ve sınıf ödevlerine ulaşın.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {classes.map(c => (
          <Card key={c.id} hoverable style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: 'var(--accent-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Layers size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {c.is_active ? 'Aktif Şube' : 'Arşivlenmiş'}
                  </span>
                </div>
              </div>

              {/* Join Code Tag */}
              <button
                type="button"
                onClick={() => handleCopy(c.join_code)}
                className="dvlp-badge dvlp-badge-neutral"
                style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', gap: '0.3rem' }}
                title="Katılım Kodunu Kopyala"
              >
                {c.join_code}
                {copiedCode === c.join_code ? <Check size={11} style={{ color: 'var(--color-success)' }} /> : <Copy size={11} />}
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: '38px' }}>
              {c.description || 'Türk Dili ve Edebiyatı Şubesi'}
            </p>

            {/* Quick Stats Grid */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '0.5rem', 
                padding: '0.75rem', 
                background: 'var(--bg-secondary)', 
                borderRadius: '12px',
                textAlign: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {c.studentCount}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Öğrenci</div>
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                  {c.assignmentCount}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ödev Konusu</div>
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {c.submissionCount}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Teslim</div>
              </div>
            </div>

            {/* Link to Detail */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <Link 
                to={`/teacher/classes/${c.id}`}
                className="dvlp-btn dvlp-btn-secondary dvlp-btn-sm"
                style={{ textDecoration: 'none', width: '100%' }}
              >
                Sınıfı Yönet ve İncele <ArrowRight size={13} />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TeacherClasses;
