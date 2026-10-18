// ==============================================================================
// DVLP EDEBIYAT — DEMO LOCAL STORE
// Stateful mock store used when Supabase credentials are not yet configured in .env
// Enables complete frontend evaluation and end-to-end testing of all roles.
// ==============================================================================

const STORAGE_KEY = 'dvlp_edebiyat_demo_state_v1';

const INITIAL_PROFILES = [
  {
    id: 'usr-student-1',
    full_name: 'Ahmet Yılmaz',
    email: 'ogrenci@dvlp.dev',
    role: 'student',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-09-01T08:00:00Z'
  },
  {
    id: 'usr-student-2',
    full_name: 'Zeynep Kaya',
    email: 'zeynep@dvlp.dev',
    role: 'student',
    is_active: true,
    created_at: '2026-09-02T09:30:00Z',
    updated_at: '2026-09-02T09:30:00Z'
  },
  {
    id: 'usr-student-3',
    full_name: 'Can Özkan',
    email: 'can@dvlp.dev',
    role: 'student',
    is_active: true,
    created_at: '2026-09-05T11:00:00Z',
    updated_at: '2026-09-05T11:00:00Z'
  },
  {
    id: 'usr-teacher-1',
    full_name: 'Emel Demir',
    email: 'ogretmen@dvlp.dev',
    role: 'teacher',
    is_active: true,
    created_at: '2026-08-15T08:00:00Z',
    updated_at: '2026-08-15T08:00:00Z'
  },
  {
    id: 'usr-admin-1',
    full_name: 'Kemal Arslan',
    email: 'admin@dvlp.dev',
    role: 'admin',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z'
  }
];

const INITIAL_CLASSES = [
  {
    id: 'cls-9a',
    name: '9-A',
    description: '9. Sınıf Türk Dili ve Edebiyatı Şubesi A',
    join_code: 'EDEB-9A',
    is_active: true,
    created_by: 'usr-teacher-1',
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-09-01T08:00:00Z'
  },
  {
    id: 'cls-9b',
    name: '9-B',
    description: '9. Sınıf Türk Dili ve Edebiyatı Şubesi B',
    join_code: 'EDEB-9B',
    is_active: true,
    created_by: 'usr-teacher-1',
    created_at: '2026-09-01T08:15:00Z',
    updated_at: '2026-09-01T08:15:00Z'
  },
  {
    id: 'cls-10a',
    name: '10-A',
    description: '10. Sınıf Türk Dili ve Edebiyatı Şubesi A',
    join_code: 'EDEB-10A',
    is_active: true,
    created_by: 'usr-teacher-1',
    created_at: '2026-09-01T08:30:00Z',
    updated_at: '2026-09-01T08:30:00Z'
  }
];

const INITIAL_MEMBERSHIPS = [
  {
    id: 'mem-1',
    class_id: 'cls-9a',
    user_id: 'usr-student-1',
    membership_role: 'student',
    status: 'approved',
    requested_at: '2026-09-01T09:00:00Z',
    approved_at: '2026-09-01T10:00:00Z',
    approved_by: 'usr-teacher-1'
  },
  {
    id: 'mem-2',
    class_id: 'cls-9a',
    user_id: 'usr-student-2',
    membership_role: 'student',
    status: 'approved',
    requested_at: '2026-09-02T10:00:00Z',
    approved_at: '2026-09-02T11:00:00Z',
    approved_by: 'usr-teacher-1'
  },
  {
    id: 'mem-3',
    class_id: 'cls-9a',
    user_id: 'usr-student-3',
    membership_role: 'student',
    status: 'pending',
    requested_at: '2026-10-17T14:20:00Z',
    approved_at: null,
    approved_by: null
  }
];

const INITIAL_ASSIGNMENTS = [
  {
    id: 'asg-1',
    class_id: 'cls-9a',
    title: 'Haksızlık Üzerine Deneme',
    description: 'Adalet ve haksızlık kavramlarını klasik Türk edebiyatı metinlerinden örneklerle ele alan en az 2 sayfalık PDF deneme hazırlayınız.',
    due_at: '2026-11-01T23:59:59Z',
    is_active: true,
    created_by: 'usr-teacher-1',
    created_at: '2026-09-10T10:00:00Z',
    updated_at: '2026-09-10T10:00:00Z'
  },
  {
    id: 'asg-2',
    class_id: 'cls-9a',
    title: 'Dede Korkut Hikayeleri Karakter Tahlili',
    description: 'Dirse Han Oğlu Boğaç Han boyundaki karakter tahlilleri ve kültürel motifleri PDF formatında teslim ediniz.',
    due_at: '2026-11-15T23:59:59Z',
    is_active: true,
    created_by: 'usr-teacher-1',
    created_at: '2026-09-15T11:00:00Z',
    updated_at: '2026-09-15T11:00:00Z'
  },
  {
    id: 'asg-3',
    class_id: 'cls-10a',
    title: 'Tanzimat Dönemi Şiir İncelemesi',
    description: 'Namık Kemal ve Şinasi şiirlerindeki vatan ve hürriyet temalarını karşılaştırınız.',
    due_at: '2026-11-20T23:59:59Z',
    is_active: true,
    created_by: 'usr-teacher-1',
    created_at: '2026-09-20T10:00:00Z',
    updated_at: '2026-09-20T10:00:00Z'
  }
];

// Base64 demo minimal 1-page PDF for testing PDF preview
const SAMPLE_DEMO_PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const INITIAL_SUBMISSIONS = [
  {
    id: 'sub-1',
    assignment_id: 'asg-1',
    class_id: 'cls-9a',
    student_id: 'usr-student-1',
    file_path: 'submissions/cls-9a/sub-1.pdf',
    original_filename: 'Ahmet_Yilmaz_Haksizlik_Deneme.pdf',
    file_size: 245120, // ~240 KB
    review_status: 'reviewed',
    reviewed_at: '2026-10-15T16:30:00Z',
    reviewed_by: 'usr-teacher-1',
    student_note: 'Hocam, özellikle Kutadgu Bilig ve Yunus Emre dizelerinden alıntılar ekledim. Umarım beğenirsiniz.',
    deleted_at: null,
    created_at: '2026-10-12T14:20:00Z',
    updated_at: '2026-10-12T14:20:00Z',
    pdf_url: SAMPLE_DEMO_PDF
  },
  {
    id: 'sub-2',
    assignment_id: 'asg-1',
    class_id: 'cls-9a',
    student_id: 'usr-student-2',
    file_path: 'submissions/cls-9a/sub-2.pdf',
    original_filename: 'Zeynep_Kaya_Haksizlik_Uzerine.pdf',
    file_size: 382900,
    review_status: 'not_reviewed',
    reviewed_at: null,
    reviewed_by: null,
    student_note: 'Kaynakçamı son sayfada detaylıca belirttim.',
    deleted_at: null,
    created_at: '2026-10-16T19:45:00Z',
    updated_at: '2026-10-16T19:45:00Z',
    pdf_url: SAMPLE_DEMO_PDF
  }
];

const INITIAL_FEEDBACK = [
  {
    id: 'fb-1',
    submission_id: 'sub-1',
    teacher_id: 'usr-teacher-1',
    content: 'Denemenizde adalet ve haksızlık kavramlarını çok derin ve felsefi bir dille ele almışsınız. Kutadgu Bilig atıflarınız yerinde olmuş. İkinci sayfadaki paragraf geçişlerini biraz daha yumuşatabilirsiniz. Tebrik ederim!',
    created_at: '2026-10-15T16:30:00Z',
    updated_at: '2026-10-15T16:30:00Z'
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    recipient_id: 'usr-student-1',
    type: 'review_completed',
    title: 'Ödeviniz İncelendi',
    message: '"Haksızlık Üzerine Deneme" başlıklı ödeviniz Emel Demir tarafından incelendi.',
    submission_id: 'sub-1',
    class_id: 'cls-9a',
    read_at: '2026-10-15T17:00:00Z',
    created_at: '2026-10-15T16:30:00Z'
  },
  {
    id: 'notif-2',
    recipient_id: 'usr-student-1',
    type: 'feedback_added',
    title: 'Öğretmeniniz Geri Bildirim Ekledi',
    message: 'Öğretmeniniz ödevinize özel bir değerlendirme yorumu ekledi.',
    submission_id: 'sub-1',
    class_id: 'cls-9a',
    read_at: null,
    created_at: '2026-10-15T16:32:00Z'
  },
  {
    id: 'notif-3',
    recipient_id: 'usr-teacher-1',
    type: 'new_submission',
    title: 'Yeni Ödev Teslimi',
    message: 'Zeynep Kaya "Haksızlık Üzerine Deneme" ödevini teslim etti.',
    submission_id: 'sub-2',
    class_id: 'cls-9a',
    read_at: null,
    created_at: '2026-10-16T19:45:00Z'
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'aud-1',
    user_id: 'usr-admin-1',
    action: 'class_created',
    entity_type: 'class',
    entity_id: 'cls-9a',
    details: { name: '9-A', join_code: 'EDEB-9A' },
    created_at: '2026-09-01T08:00:00Z'
  },
  {
    id: 'aud-2',
    user_id: 'usr-teacher-1',
    action: 'submission_reviewed',
    entity_type: 'submission',
    entity_id: 'sub-1',
    details: { student_id: 'usr-student-1', assignment_id: 'asg-1' },
    created_at: '2026-10-15T16:30:00Z'
  }
];

class DemoStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('DemoStore load error', e);
    }
    return {
      profiles: INITIAL_PROFILES,
      classes: INITIAL_CLASSES,
      memberships: INITIAL_MEMBERSHIPS,
      assignments: INITIAL_ASSIGNMENTS,
      submissions: INITIAL_SUBMISSIONS,
      feedback: INITIAL_FEEDBACK,
      notifications: INITIAL_NOTIFICATIONS,
      audit_logs: INITIAL_AUDIT_LOGS,
      activeUserId: 'usr-student-1'
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('DemoStore save error', e);
    }
  }

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.load();
  }

  getActiveUser() {
    const user = this.data.profiles.find(p => p.id === this.data.activeUserId);
    return user || this.data.profiles[0];
  }

  setActiveUser(userId) {
    this.data.activeUserId = userId;
    this.save();
  }

  switchRole(role) {
    const profile = this.data.profiles.find(p => p.role === role);
    if (profile) {
      this.setActiveUser(profile.id);
      return profile;
    }
    return null;
  }
}

export const demoStore = new DemoStore();
export default demoStore;
