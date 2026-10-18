# DVLP Edebiyat — Edebiyat Ödevi Teslim ve İnceleme Platformu

**DVLP Edebiyat**, öğrencilerin el yazısı ödev yerine edebiyat ödevlerini PDF olarak yükleyebildiği, öğretmenlerin ödevleri inceleyip strictly private (yalnızca öğrenciye özel) geri bildirimler verebildiği, yöneticilerin ise sınıfları, ödev başlıklarını ve kullanıcı rollerini güvenle yönettiği modern, koyu temalı bir web uygulamasıdır.

Uygulama, **DVLP Platform** marka kimliği ve tasarım sistemine ([https://dvlp-platform.vercel.app/kitchen-sink](https://dvlp-platform.vercel.app/kitchen-sink)) uygun olarak geliştirilmiştir.

---

## 🚀 Teknoloji Yığını

- **Ön Yüz:** React 19, JavaScript, Vite 8, React Router v7
- **Tasarım & Stil:** DVLP Dark-First Design System, CSS Variables, Lucide Icons
- **Kimlik Doğrulama:** Supabase Auth (E-posta / Şifre, Oturum Sürekliliği, Şifre Sıfırlama)
- **Veritabanı:** Supabase PostgreSQL (Satır Düzeyinde Güvenlik - RLS, Tetikleyiciler, Güvenlik Fonksiyonları)
- **Dosya Depolama:** Supabase Storage (Özel/Private `homework-submissions` kovası, İmzalı URL'ler)
- **Dağıtım Hazırlığı:** Vercel (SPA yönlendirme kuralları ile `vercel.json`)

---

## 🎨 Marka ve Tasarım Belirteçleri (Design Tokens)

- **Arka Plan (Background):** `#09090B`
- **İkincil Arka Plan (Secondary):** `#111113`
- **Kart Yüzeyi (Card Surface):** `#18181B`
- **Kenarlıklar (Border):** `#27272A`
- **Birincil Metin:** `#FAFAFA`
- **İkincil Metin:** `#A1A1AA`
- **Sessiz Metin:** `#82828A`
- **Mor Vurgu (Purple Accent):** `#8B5CF6`
- **Camgöbeği Vurgu (Cyan Accent):** `#22D3EE`
- **Başarı (Success):** `#10B981`
- **Hata (Danger):** `#EF4444`
- **Uyarı (Warning):** `#F59E0B`
- **Köşe Yuvarlatma:** Kartlar `20px`, Butonlar `12px`, Girdiler `14px`

---

## 👥 Kullanıcı Rolleri ve Yetki Matrisi

| Yetki / Eylem | Öğrenci (Student) | Öğretmen (Teacher) | Yönetici (Admin) |
|---|:---:|:---:|:---:|
| **Kendi Paneli ve İstatistikleri** | ✅ | ✅ | ✅ |
| **Kendi Sınıfı & Arkadaş Profilleri** | ✅ | ✅ | ✅ |
| **Sınıf Katılım Koduyla Başvuru** | ✅ | — | — |
| **PDF Ödev Teslim Etme & Güncelleme** | ✅ | — | — |
| **Kendi Teslimini Silme** | ✅ | — | ✅ |
| **Kendi Öğretmen Yorumunu Okuma** | ✅ | ✅ | ✅ |
| **Başkalarının Özel Yorumunu Okuma** | ❌ (Engelli) | ✅ | ✅ |
| **Tüm Sınıfları Görüntüleme** | ❌ | ✅ | ✅ |
| **Ödevi "İncelendi" Olarak İşaretleme** | ❌ | ✅ | ✅ |
| **Özel Öğretmen Geri Bildirimi Yazma** | ❌ | ✅ | ✅ |
| **Sınıf Katılım Taleplerini Onaylama** | ❌ | ✅ | ✅ |
| **Ödev Başlığı Tanımlama & Arşivleme** | ❌ | ✅ | ✅ |
| **Kullanıcı Rollerini ve Durumunu Yönetme** | ❌ | ❌ | ✅ |
| **Son Aktif Yöneticiyi Dondurma/Düşürme** | ❌ | ❌ | ❌ (Korumalı) |

---

## ⚙️ Kurulum ve Yerel Geliştirme

### 1. Depoyu Klonlayın ve Bağımlılıkları Yükleyin

```bash
# Bağımlılıkları yükleyin
npm install
```

### 2. Ortam Değişkenlerini Yapılandırın

Kök dizindeki `.env.example` dosyasını kopyalayarak `.env` dosyasını oluşturun:

```bash
cp .env.example .env
```

`.env` dosyasını açarak Supabase bilgilerinizi girin:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

> **Not (Yerel Test Modu):** `.env` dosyası boşken uygulama otomatik olarak yerel geliştirme ve test modunda çalışır. Üst bildirim çubuğundaki hızlı rol değiştirici ile **Öğrenci**, **Öğretmen** ve **Yönetici** panellerini doğrudan test edebilirsiniz. Canlı Supabase anahtarları girildiğinde uygulama anında gerçek veritabanı moduna geçer.

### 3. Yerel Sunucuyu Başlatın

```bash
npm run dev
```

Tarayıcınızda `http://127.0.0.1:5173/` adresine gidin.

### 4. Üretim Derlemesi

```bash
npm run build
npm run preview
```

---

## 🗄️ Supabase Kurulum Kılavuzu

### 1. Veritabanı Tabloları ve RLS Politikaları

1. [supabase.com](https://supabase.com) adresinden yeni bir proje oluşturun.
2. Sol menüden **SQL Editor** bölümüne gidin.
3. Projedeki `supabase/setup.sql` dosyasının içeriğini SQL editörüne yapıştırın ve **Run** butonuna tıklayın.

Bu betik şunları oluşturur:
- `profiles`, `classes`, `class_memberships`, `assignments`, `submissions`, `feedback`, `notifications`, `audit_logs` tabloları
- Güvenlik Fonksiyonları (`is_admin()`, `is_teacher()`, `has_approved_class()`)
- Satır Düzeyinde Güvenlik (RLS) politikaları
- Son yöneticinin silinmesini veya dondurulmasını engelleyen veritabanı tetikleyicisi (`protect_last_admin`)
- PDF dosyası değiştirildiğinde inceleme durumunu sıfırlayan tetikleyici (`handle_submission_update`)
- Kullanıcı kaydolduğunda otomatik profil oluşturan tetikleyici (`handle_new_user`)

### 2. Başlangıç Verileri (Opsiyonel)

Hazır sınıf şubeleri (9-A, 9-B, 10-A, 10-B) ve örnek ödev başlıkları için `supabase/seed.sql` dosyasını Supabase SQL Editor'da çalıştırabilirsiniz.

### 3. Özel PDF Depolama Kovası (Storage Bucket)

`supabase/setup.sql` betiği `homework-submissions` kovasını otomatik olarak oluşturur ve RLS politikalarını tanımlar:
- **Kova Adı:** `homework-submissions`
- **Genel Erişim (Public):** `false` (Özel kova, doğrudan herkese açık link oluşturulamaz)
- **Erişim Yöntemi:** Kısa ömürlü imzalı URL'ler (`createSignedUrl`, varsayılan 1 saat geçerli).

### 4. İlk Sistem Yöneticisinin (Admin) Yetkilendirilmesi

Güvenlik gereği sistemde varsayılan ve bilinen şifreye sahip açık bir admin hesabı bırakılmamıştır. İlk yöneticiyi yetkilendirmek için:

1. Uygulama üzerinden `/login` sayfasında "Kayıt Talebi Oluştur" adımıyla veya Supabase Dashboard > **Authentication > Users > Add User** ile e-posta ve şifrenizle bir hesap oluşturun.
2. Supabase **SQL Editor** bölümünde aşağıdaki sorguyu kendi e-posta veya kullanıcı ID'niz ile çalıştırın:

```sql
UPDATE public.profiles
SET role = 'admin', full_name = 'Sistem Yöneticisi'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin_epostaniz@ornek.com');
```

3. Artık hesabınız tam yönetici yetkilerine sahiptir ve `/admin` paneline erişebilirsiniz.

---

## 🔒 Güvenlik Mimarisi

- **Row Level Security (RLS):** Her tabloda RLS etkinleştirilmiştir. Tarayıcıdan gönderilen hiçbir SQL sorgusu doğrudan bypass edilemez.
- **Gizli Geri Bildirimler:** Öğretmen geri bildirimleri (`feedback` tablosu) sınıf akışına ve diğer öğrencilere tamamen kapalıdır.
- **Korumalı Dosya Yolları:** PDF'ler rastgele UUID tabanlı yollarla özel Supabase Storage kovasına yüklenir. Dosya yolu tahmin edilerek erişim sağlanamaz; mutlaka oturum açmış kullanıcının sınıf üyeliği doğrulanmalıdır.
- **Hizmet Rolü (Service Role) Güvenliği:** `service_role` anahtarı ön yüze asla eklenmemiştir. Sadece `anon_key` ile RLS kontrollü sorgular kullanılır.
- **Rol Değiştirme Koruması:** Öğrenciler tarayıcı üzerinden profil alanlarını değiştirerek kendilerini öğretmen veya admin yapamaz; veritabanı tetikleyicisi bu değişiklikleri engeller.

---

## 🚀 Vercel Dağıtım Kılavuzu

Proje Vercel ile doğrudan dağıtılmaya hazırdır:

1. Projeyi GitHub deponuza yükleyin.
2. [vercel.com](https://vercel.com) üzerinde **New Project** diyerek deponuzu bağlayın.
3. Framework Preset olarak **Vite** seçildiğinden emin olun.
4. **Environment Variables** bölümüne şu değişkenleri ekleyin:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-publishable-key`
5. **Deploy** butonuna tıklayın.
6. Projedeki `vercel.json` SPA yönlendirmelerini otomatik olarak `/index.html` üzerinden işleyecektir.

---

## 📋 Manuel Test ve Kabul Kontrol Listesi

- [x] **Öğrenci Akışı:**
  - Öğrenci hesabıyla giriş yapılabilmesi
  - Sınıf kodu (`EDEB-9A`) girilerek katılım talebi oluşturulması
  - Onaylanmamış sınıfa erişimin kısıtlanması
  - Öğretmen onayından sonra sınıfa ve ödevlere erişim
  - PDF ödevi seçip dosya boyutu kontrolü (max 10MB) ile yükleme
  - Ödev detayında inceleme durumunun ("İnceleme Bekliyor") görünmesi
  - Öğrencinin kendi ödevini düzenleyebilmesi veya silebilmesi
  - Öğrencinin öğretmen yorumunu yalnızca kendi ödevinde okuyabilmesi
- [x] **Öğretmen Akışı:**
  - Tüm sınıfları ve öğrenci listesini görüntüleyebilme
  - Yeni ödev başlığı tanımlama ve arşivleme
  - Sınıf katılım taleplerini onaylama ve reddetme
  - Öğrenci ödevini imzalı güvenli URL ile açıp PDF'i inceleme
  - Ödevi "İncelendi" olarak işaretleme
  - Özel öğretmen geri bildirimi yazma ve düzenleme
  - Öğrenciye anlık bildirim gitmesi
- [x] **Yönetici Akışı:**
  - Kullanıcı listesinde arama ve rol değiştirme (Öğrenci, Öğretmen, Yönetici)
  - Kullanıcı dondurma ve kalıcı silme
  - Son aktif yöneticinin korunması (dondurulamaz veya silinemez)
  - Yeni sınıf oluşturma ve katılım kodu yenileme
  - Sistem denetim kayıtlarını (Audit Logs) inceleme
