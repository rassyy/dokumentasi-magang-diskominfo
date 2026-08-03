# Instruksi Design Polish — Web Dokumentasi Magang

Instruksi ini untuk agent (antigravity/gemini pro high) di laptop, lengkap dengan konteks, referensi desain, dan checklist. Tujuan: mengubah situs dari "polos/template" jadi karya desain yang layak — light minimal ala Notion + subtle glass, interaktif.

## Referensi gaya (wajib)

1. **Notion** — desain basis:
   - Warm neutral (`#f6f5f4`, `#31302e`, `#615d59`, `#a39e98`) — bukan gray dingin
   - Teks near-black `rgba(0,0,0,0.92)` bukan `#000` murni
   - Border super tipis `1px solid rgba(0,0,0,0.10)` — "whisper border"
   - Shadow multi-lapis opacity rendah (max 0.05)
   - Tipografi: negative letter-spacing di heading besar
   - Banyak whitespace, section alternasi putih ↔ warm white
2. **Subtle glass** — hanya aksen, bukan semua elemen:
   - `backdrop-filter: blur(16-20px)` + opacity 70-85%
   - Dipakai: topbar, sidebar, hero overlay
   - Konten utama tetap solid putih/off-white biar nyaman dibaca

## Tokens (sudah ada di `src/styles/global.css`)

```css
--bg: #fbfaf8;          /* background */
--bg-soft: #f6f5f4;     /* section alternate */
--surface: #ffffff;
--surface-glass: rgba(255,255,255,0.72);
--text: rgba(0,0,0,0.92);
--muted: #615d59;
--muted-soft: #a39e98;
--border: rgba(0,0,0,0.10);
--accent: #0075de;      /* Notion blue */
--accent-soft: #f2f9ff;
--success: #1aae39;
--warning: #dd5b00;
--radius-sm/md/lg/xl: 4/8/12/16px;
--shadow-card: multi-layer low-opacity
--font-sans: 'Inter'
```

Jangan ubah nilai konten/data. Fokus visual + interaktivitas.

## TUGAS UTAMA

### 1. Hero (Overview halaman `/`)
Saat ini polos. Bikin:
- Gradient warm halus di background hero (bukan warna flat).
- Badge + title + desc + CTA rapi.
- Hero-stats jadi card glass bernomor besar.
- Tambah elemen visual: pattern/gradient lambat, bukan flat.

### 2. Sidebar
- Glass (blur) + border halus.
- Item active dengan pill/fill subtle (accent), bukan cuma border-left.
- Logo monogram (DM) di circle dengan gradient subtle.

### 3. Komponen cards & grid
- TopicCard / doc-card / week-content / pdf-card: hover translateY(-2px) + shadow naik + border highlight.
- Empty state (minggu 5, topic tanpa doc, PDF tdk ada): bikin rapi, bukan just teks.

### 4. Typography
- Heading pakai `letter-spacing: -0.02em` sampai `-0.03em` (agak negatif, Notion feel).
- Beri variasi: display hero besar, section heading 28-32px.
- Pastikan font Inter ke-load (harus link di BaseLayout). Kalau belum, tambah.

### 5. Motion & Interaksi (bikin "hidup")
- Reveal-on-scroll halus pakai `IntersectionObserver` (fade + translateY).
- Hover pada CTA: `transform: translateY(-1px)` + shadow.
- Transisi halaman: smooth (opsional, Astro ViewTransitions).
- Progress bar di home animasi width dari 0→80% saat visible.
- Timeline: dot accent dengan pulse ring halus; card stagger muncul.
- Counter animasi pada hero stat (0→5, 0→7, 0→4, 0→80%) saat masuk viewport.

### 6. Responsive
- Mobile: sidebar drawer, grid kolom tunggal, tap target minimal 44px.
- Breakpoint 768px untuk drawer, 900px untuk grid 2-col.

## Interaktivitas yang sudah ada (pertahankan/bakal)
- PDF search & filter (`#pdf-search` + `.filter-btn` di `/pdf-library`).
- Mobile sidebar toggle.

## Checklist sebelum selesai
- [ ] `npm run build` exit 0
- [ ] 5 halaman jalan: /, /timeline, /dokumentasi, /pdf-library, /profil
- [ ] CSS tidak 404 — image path benar (lamp path: `public/assets/pdf/`)
- [ ] Tidak ada placeholder kosong
- [ ] Kontras terjaga (teks baca jelas di atas bg)
- [ ] Design Tokens dipakai konsisten (jangan hardcode warna pribadi)

## PENTING — cara buka yang benar (biar tidak "polos")
CSS hanya di **build output**, bukan `/src`:
```bash
npm run build      # hasil di dist/
npm run preview    # serve dist/ dengan benar (local)
# ATAU pakai dev:
npm run dev        # dev server, hot reload
```
JANGAN buka `index.html` / file `.astro` langsung di browser file:// — CSS/JS tidak ter-resolve → halaman tampil polos tanpa style.

## Dev flow
```bash
npm install
npm run dev        # preview yang bisa di-refresh
# edit src/styles/global.css + src/components/*.astro + src/pages/*.astro
```
Selalu `npm run build` sekali sebelum commit/deploy.

## Referensi desain file (baca sebelum mulai)
Gaya dan prinsip Notion detail ada di skill yang relevan, tapi paling cepat: pakai diretas di atas + token di CSS. Kalau perlu inspirasi, lihat referensi:
Vercel/Linear/Mintlify untuk dark→light handle, tapi JANGAN kloning brand — tetap light minimal Notion.