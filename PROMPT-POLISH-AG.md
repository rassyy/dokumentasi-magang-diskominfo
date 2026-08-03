# PROMPT POLISH NAVBAR + GLASS + CARD LOGO
Untuk: agent coding (opencode/antigravity/gemini pro high) di laptop.
Repo: `rassyy/dokumentasi-magang-diskominfo` — branch `main`, Astro SSG.

Eksekusi 3 tugas di bawah. UI sudah rampung, cuma perlu penyesuaian desain. JANGAN rusak konten/data (5 minggu, 7 PDF, 2 profil).

---

## KONTEKS FILE
- `src/components/Sidebar.astro` — navbar kiri (sudah ada sliding pill `.nav-indicator`)
- `src/styles/global.css` — semua styling
- `src/pages/*.astro` — halaman (index/timeline/dokumentasi/pdf-library/profil)

---

## TUGAS 1: ACTIVE STATE NAVBAR — WARNA PINDAH IKUT TAB (PALING PENTING)

Saat ini: pill geser putih polos, item aktif cuma text biru — user bilang "tidak berubah / tidak ada active state".

Yang diinginkan:
- Ada **pill glass yang SLIDING** mengikuti item aktif (sudah ada, pertahankan).
- **WARNA yang JELAS PINDAH** bersama aktif: item yang aktif harus tampil MENYOLOK berwarna (mis. bola/indicator berlatar accent biru dengan teks putih), dan saat pindah tab item tsb jadi abu polos.
- Jadi bukan "pill netral + text biru". Buat **active pill yang BERWARNA accent** (biru gradient) + teks putih, yang **ber-slide** dari item sekarang ke item klik. Item lain tetap transparan/abu-abu.
- Saat di Overview → Overview punya pill biru penuh (teks putih). Klik "Profil" → pill biru GESER smoothly ke Profil (transisi top/left 0.35s), Profil jadi biru-teks putih, Overview kembali abu-abu.
- Implementasi yang benar: sertakan **data-index** di tiap `<a class="nav-link">`, pill `.nav-active-pill` diposisikan via JS `offsetTop/offsetLeft/offsetWidth/offsetHeight`, `transition` pada top/left/width/height. Warna aktif (biru + teks putih) dibawa oleh pill, sehingga "warna ikut pindah".
- Hover item lain boleh geser preview, tapi tep-correct: on mouseleave pill kembali ke item `.active`.
- Verifikasi: buka `/`, lihat Overview biru. Klik Profil di sidebar → pill geser bawah → Profil biru. Ini yang user mau.

## TUGAS 2: SEMUA KOTAK = GLASS (modern, frosted)

Pastikan SETIAP elemen kotak/card di seluruh halaman memakai efek glassmorphic, bukan putih solid:
- `.card` base di `global.css` → frosted:
  ```css
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.75);
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  ```
- Pastikan semua elemen (topic-card, doc-card, week-content, pdf-card, profile-card, institution-card, progress-card, topic-doc, filter-btn, pdf-search, empty-note) terlihat seperti glass (transparan, blur, border putih halus).
- Kotak dengan sudut lancip: pastikan semua pakai radius besar (border-radius min 12px, kebanyakan 16-24px).
- Jangan ada kotak putih solid polos yang "kaku".

## TUGAS 3: CARD LOGO TEKNOLOGI di HOME (Overview)

Di halaman `/` (index.astro), tambah section baru "Stack Yang Dipelajari" berupa grid card glass, masing-masing menampilkan **logo/teknama + nama** teknologi yang relevan dgn kegiatan magang. List teknologi (wajib, dari data magang):
- **Proxmox VE** — virtualisasi
- **MikroTik** — jaringan/routerOS
- **Cloudflare** (Tunnel / Zero Trust)
- **Linux (Debian/Ubuntu)** — server/CT LXC
- **Docker** — container
- **Nginx** — reverse proxy
- **MySQL** — database
- **GNS3** — network simulator
- **VirtualBox** — VM
- **Tailscale** — VPN mesh

Cara:
- Buat `src/data/tools.ts` dengan array `TOOLS` = [{ name, desc, icon }]. Ikon: boleh pakai emoji/svg sederhana atau logo teks bergaya (mis prof card2), yang penting rapi. Kalau mau,. jelaskan: buat badan SVG kecil atau pakai emoji dengan tint accent-soft background.
- Tambah di index.astro section baru setelah "Dokumen Terbaru" (atau sebelum progress), render `TOOLS` jadi `.tool-grid` > `.tool-card card` (glass) dengan nama + desc, hover lift.
- Jangan terlalu ramai — rapi minimal.

---

## WAJIB SEBELUM SELESAI
1. `npm run build` exit 0.
2. Test di `npm run dev` (localhost:4321): klik nav → active pill biru GESER pindah, teks putih di pill.
3. Cek tiap halaman card-nya glass (blur, radius).
4. Cek home ada grid card logo teknologi.
5. Jangan hapus data/isi konten.
6. Commit + push.

## COMMIT
`feat: active sliding nav color, full glass cards, tech stack cards`