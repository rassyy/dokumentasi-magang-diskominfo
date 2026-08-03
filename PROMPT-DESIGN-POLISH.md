# PROMPT EKSEKUSI DESIGN POLISH — Web Dokumentasi Magang

Untuk: agent coding (antigravity / gemini pro high) via opencode di laptop.
Repo: `rassyy/dokumentasi-magang-diskominfo` (Sudah di-clone, branch `main`).

Eksekusi prompt ini. Tujuan: jadikan situs **sangat interaktif, bernyawa dengan animasi kecil halus, dan polished glassmorphism** — tetap light minimal ala Notion. JANGAN sekali pun menghapus, merusak, atau mengosongkan konten/data. Konten wajib tetap tampil (5 minggu, 7 PDF, 2 profil).

---

## KONTEKS PROJECT

- Stack: Astro SSG (static). Rendering server-side → semua konten jadi HTML statis di `dist/` saat build.
- **Konten BUKAN di HTML** — di module TypeScript:
  - `src/data/weeks.ts` → 5 minggu (export `WEEKS`)
  - `src/data/documents.ts` → 7 PDF (export `DOCUMENTS`)
  - `src/data/topics.ts` → 4 topik (export `TOPICS`)
  - `src/data/profiles.ts` → 2 profil (export `PROFILES`)
- Komponen: `src/components/*.astro` (Sidebar, Topbar, Footer, Hero, TopicCard, WeekCard).
- Halaman: `src/pages/*.astro` (index/overview, timeline, dokumentasi, pdf-library, profil).
- Style global: `src/styles/global.css` — SUDAH ada design tokens lengkap.
- PDF path benar di `public/assets/pdf/`.

**WARNING KRUCIAL — jangan rusak konten:**
- JANGAN menghapus import data / map dari `src/data/*`.
- Setiap halaman HARUS render konten statis. Kalau sudah icon, JANGAN pragari audio.
- Setelah elu, VERIFY: `npm run build` → buka `dist/`, pastikan isi muncul (Minggu 1-5, judul PDF, nama profil).

---

## DESIGN SYSTEM (gunakan token — jangan hardcode warna acak)

```css
--bg:#fbfaf8; --bg-soft:#f6f5f4; --surface:#fff;
--surface-glass:rgba(255,255,255,0.72);
--text:rgba(0,0,0,0.92); --muted:#615d59; --muted-soft:#a39e98;
--border:rgba(0,0,0,0.10);
--accent:#0075de; --accent-soft:#f2f9ff; --success:#1aae39; --warning:#dd5b00;
--radius-sm/md/lg/xl:4/8/12/16px;
--shadow-card: multi-layer opacity<0.05;
--font-sans:'Inter';
```

Prinsip:
- Warm neutral, not cold gray.
- Whisper border `1px solid rgba(0,0,0,0.10)`.
- Shadow multi-layer opacity rendah.
- Tipografi heading `letter-spacing:-0.02em` s/d `-0.03em`.
- Glass CUKA aksen: topbar, sidebar, hero card/overlay, floating element. Konten utama tetap solid.
- Banyak whitespace.

---

## TUGAS PRIORITAS (interaktif + animasi kecil + glass)

### 1. GLASSMORPHISM FEATURE (wajib)
- `src/styles/global.css` tambah:
```css
.glass {
  background: var(--surface-glass);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255,255,255,0.55);
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
}
```
- Terapkan: topbar, sidebar, hero overlay/stat cards, floating accent cards di home, PDF/topic card hover lift. Jaga tetap subtle, jangan blur semua.

### 2. ANIMASI & MOTION (entonyanya)
- **Reveal on scroll**: tambah `IntersectionObserver` di `BaseLayout` (inline `<script>`) — elemen `.reveal` muncul (fadeIn + translateY(12px→0), opacity 0→1), `transition 0.6s`. Terapkan di card, container, section.
- **Stagger**: daftar (topic-card, week-card, pdf-card, profile) berurutan delay `i*60ms`.
- **Counter**: hero stat angka ber-animasi dari 0 naik ke nilai saat masuk viewport.
- **Progress bar** home: width animate 0→80%.
- **Timeline dot**: `pulse ring` halus (bernafas).
- **Hover lift**: card `transform:translateY(-4px) + shadow naik + border accent`.
- **CTA**: hover `translateY(-1px)` + shadow, active scale.
- **Button/icon**: micro-interaction (efek ripple halus optional).
- **Page transition**: pakai Astro `<ViewTransitions />` bila aman (smooth fade antar halaman). Kalau tidak, cukup reveal.
- **Smooth scroll** antar section.

### 3. HERO (Overview)
- Latar: gradient halus + subtle radial blur accent (bukan flat).
- Badge + hero-stats card glass bergaya bernomor.
- Efek floating subtle di card hero (slight translateY bob terlalu).

### 4. SIDEBAR & TOPBAR
- Glass penuh, blur, border halus.
- Nav active: pill/fill accent-soft + accent text, transition.
- Logo monogram (DM) gradient subtle.

### 5. CARDS
- TopicCard/doc-card/week-content/pdf-card/profile: default clean; hover lift + border accent + shadow.
- Empty state rapi (minggu 5, tema tanpa dokumen).

### 6. RESPONSIVE
- Mobile: glass drawer, kolom tunggal, tap ≥44px.
- Breakpoints: 768px drawer, 900px 2-col.

---

## WAJIB VERIFIKASI SEBELUM SELESAI
1. `npm run build` → exit 0.
2. Cek `dist/` (atau `npm run dev`): `grep` pastikan muncul →
   - `Minggu 1 ... Minggu 5` di `/timeline`
   - judul PDF di `/pdf-library`
   - nama mahasiswa di `/profil`
3. Tidak ada konten kosong/six.
4. Jangan double-hapus ke mistak: kalau ragu, JANGAN hapus. backup dulu (git).
5. Commit lane.

## COMMIT & PUSH
```bash
git add -A
git commit -m "feat: interactif glassmorphism polish with animation"
git push origin main
```

Pilih deskripsi commit yang jelas. Laporan selesai dengan ringkas daftar apa yang diubah.

---

SELESAI. Ini sudah komplet. Kirim ke agent antigravity elu lewat opencode, cek hasil, push.