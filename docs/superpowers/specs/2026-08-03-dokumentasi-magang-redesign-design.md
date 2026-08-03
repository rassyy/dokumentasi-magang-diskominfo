# Desain Redesign Web Dokumentasi Magang

Tanggal: 2026-08-03
Repo: `rassyy/dokumentasi-magang-diskominfo`
Status: Design approved for planning review

## 1. Tujuan

Rombak total website dokumentasi magang agar terasa seperti portal dokumentasi modern, bukan halaman logbook statis lama. Website tetap ringan dan cocok untuk deployment container kecil.

Target utama:
- Tampil modern, clean, light minimal.
- Tetap formal untuk pembimbing Diskominfo.
- Menjadi karya dokumentasi: bukan hanya daftar minggu, tetapi portal yang mengelompokkan logbook, dokumentasi teknis, PDF, dan profil.
- Mudah dirawat saat minggu/dokumen baru ditambah.

## 2. Stack yang Dipilih

Gunakan Astro sebagai static site generator.

Alasan:
- Output akhir tetap static HTML/CSS/JS.
- Deployment tetap bisa memakai `nginx:alpine` lewat multi-stage Dockerfile.
- Konten logbook bisa ditulis sebagai Markdown/MDX per minggu.
- Komponen reusable: sidebar, timeline card, PDF card, profile card.
- Interaktif ringan lewat client-side JavaScript seperlunya: search, filter, dark mode optional, view transitions.

Bukan Next.js karena terlalu berat untuk dokumentasi statis. Bukan vanilla HTML lama karena maintenance konten akan berulang dan rawan berantakan.

## 3. Visual Direction

Nama arah desain: **Notion Editorial Docs + Subtle Glass**.

Karakter:
- Light minimal.
- Warm neutral background seperti Notion.
- Typography rapi dan editorial.
- Banyak whitespace.
- Card putih/off-white dengan border sangat tipis.
- Glassmorphism hanya sebagai aksen halus pada topbar/sidebar/hero shell.
- Konten utama tetap solid agar nyaman dibaca.

Tidak dilakukan:
- Full glass di semua card.
- Neon/gradient ramai.
- Shadow tebal.
- UI terlalu dashboard-heavy.
- Copy atau klaim baru yang tidak ada dasar kontennya.

### Token visual awal

```css
--bg: #fbfaf8;
--bg-soft: #f6f5f4;
--surface: #ffffff;
--surface-glass: rgba(255, 255, 255, 0.72);
--text: rgba(0, 0, 0, 0.92);
--muted: #615d59;
--muted-soft: #a39e98;
--border: rgba(0, 0, 0, 0.10);
--accent: #0075de;
--accent-soft: #f2f9ff;
--success: #1aae39;
--warning: #dd5b00;
```

Font:
- Primary: `Inter`.
- Optional display/serif: tidak dipakai dulu agar tetap clean dan aman.
- Mono: system monospace / `Geist Mono` untuk command atau label teknis.

Glass usage:
- `backdrop-filter: blur(16px)` sampai `blur(20px)`.
- Opacity 70–85%.
- Border `1px solid rgba(0,0,0,0.08)`.
- Shadow soft multi-layer opacity rendah.

## 4. Struktur Informasi

Pakai opsi C Hybrid.

Navigasi utama:
1. Overview
2. Timeline Magang
3. Dokumentasi Teknis
4. PDF Library
5. Profil

Alasan:
- Basis minggu tetap ada sebagai logbook resmi.
- Kategori teknis membuat website terasa seperti portal dokumentasi karya.
- PDF tidak tersebar sulit dicari.
- Profil tetap formal dan terpisah.

## 5. Halaman dan Komponen

### 5.1 Overview

Fungsi: landing page ringkas.

Konten:
- Hero: “Portal Dokumentasi Magang Diskominfo Tuban”.
- Subtitle: dokumentasi kegiatan, logbook, dan artefak teknis selama magang.
- Badge: UIN Malang, Diskominfo Tuban, Divisi Aptika, 2026.
- CTA: “Lihat Timeline” dan “Buka PDF Library”.
- Stats cards:
  - Total minggu.
  - Total dokumen PDF.
  - Topik teknis.
  - Status progress.
- Highlight topic cards:
  - Networking & MikroTik.
  - Virtualization & Proxmox.
  - Cloudflare Tunnel & Security.
  - AI Agent Infrastructure.
- Latest documents.

### 5.2 Timeline Magang

Fungsi: logbook resmi tetap berbasis minggu.

Layout:
- Vertical timeline dengan dot/status.
- Card tiap minggu berisi:
  - Judul minggu.
  - Subtitle topik.
  - Ringkasan 2–4 kalimat.
  - Activity bullets.
  - Document links.
  - Badge kategori.

Data awal:
- Minggu 1: MikroTik Dasar & Hotspot.
- Minggu 2: VLAN & Inter-VLAN Routing.
- Minggu 3: Proxmox & Dockerization.
- Minggu 4: Simulasi GNS3, Proxmox, Cloudflare Tunnel, VM/WordPress.
- Minggu 5: status “belum ada kegiatan” sampai konten resmi tersedia; tampil sebagai planned/empty state yang rapi, bukan halaman kosong.

### 5.3 Dokumentasi Teknis

Fungsi: mengelompokkan ilmu/artefak per domain teknis.

Kategori:
- Networking: Subnetting, VLAN, Hotspot MikroTik.
- Virtualization: Proxmox VE, VM, Docker.
- Cloud & Security: Cloudflare Tunnel, HTTPS, Zero Trust.
- AI Agent Infrastructure: Hermes Agent, 9Router, Telegram Gateway.

Layout:
- Docs page style.
- Sidebar subcategory atau anchor list.
- Content cards per domain.
- PDF terkait di setiap domain.

### 5.4 PDF Library

Fungsi: pusat dokumen.

Fitur:
- Search client-side.
- Filter kategori.
- Card grid.
- Tombol “Buka PDF”.
- Metadata: kategori, minggu, tipe dokumen.

Data PDF dari repo saat ini:
- Implementasi Proxmox VE dan Integrasi MikroTik.
- Installasi VM dan WordPress.
- step by step cloudflare tunnel.
- Step By Step Subnetting VirtualBox SLAX.
- vlan-simulasi.
- simulasi-hotspot-gns3.
- Langkah Installasi VM pada Proxmox VE.

### 5.5 Profil

Fungsi: formal profile page.

Konten:
- Muhammad Rasya Faiz Fajar Nabil.
- Devandriya Athallah P.
- Program Studi Teknik Informatika UIN Malang.
- Instansi: Diskominfo Tuban.
- Divisi: Aplikasi Informatika.
- Periode magang jika tersedia di konten.

Avatar placeholder lama diganti dengan card typographic jika foto tidak tersedia. Tidak memakai gravatar kosong.

## 6. Layout Responsif

Desktop:
- Left sidebar fixed / sticky.
- Topbar glass sticky.
- Main content max width 1080–1160px.
- Overview memakai 2-column hero saat cukup lebar.
- PDF library 3-column card grid.

Tablet:
- Sidebar collapsible.
- Grid jadi 2 column.

Mobile:
- Sidebar berubah jadi drawer atau top navigation.
- Cards single column.
- Timeline tetap vertical.
- Tap target minimal 44px.

## 7. Interaksi

Interaksi ringan:
- Search PDF client-side.
- Filter PDF by category.
- Smooth hash navigation.
- Active nav state.
- View transitions Astro untuk perpindahan halaman/section bila aman.
- Dark mode optional setelah light mode selesai; bukan scope awal utama.

Tidak ada backend.
Tidak ada login.
Tidak ada database.

## 8. Content Model

Gunakan data terstruktur agar mudah dirawat.

Usulan:

```text
src/content/logbook/week-1.md
src/content/logbook/week-2.md
src/content/logbook/week-3.md
src/content/logbook/week-4.md
src/content/logbook/week-5.md
src/data/documents.ts
src/data/profiles.ts
src/data/topics.ts
```

Contoh frontmatter logbook:

```yaml
title: Minggu 4
subtitle: Simulasi Hotspot, VLAN, Proxmox, dan Cloudflare Tunnel
status: completed
categories: [networking, virtualization, cloud]
documents:
  - simulasi-hotspot-gns3
  - vlan-simulasi
summary: >
  Ringkasan kegiatan minggu ini.
```

## 9. Migrasi Konten Lama

Migrasi dari `index.html` lama:
- Konten home dipindah ke Overview.
- Section Minggu 1–5 dipindah ke Markdown logbook.
- Link PDF dipindah ke `documents.ts`.
- Profil mahasiswa dipindah ke `profiles.ts`.
- CSS lama tidak dipakai sebagai dasar visual; hanya informasi konten yang dipertahankan.

Asset PDF tetap di `public/assets/pdf/` atau `assets/pdf/` sesuai final struktur Astro.

## 10. Testing dan Verifikasi

Sebelum dianggap selesai:
- `npm run build` sukses.
- Preview lokal bisa dibuka.
- Link PDF bekerja.
- Search/filter PDF bekerja.
- Responsive dicek desktop dan mobile.
- Tidak ada placeholder gambar/avatar kosong.
- Lighthouse dasar: tidak ada error fatal aksesibilitas.
- Docker build sukses.
- Container nginx melayani output static.

## 11. Scope Batasan

Masuk scope:
- Redesign total visual.
- Migrasi ke Astro.
- Struktur Opsi C Hybrid.
- Search/filter PDF client-side.
- Dockerfile multi-stage.

Tidak masuk scope awal:
- Backend/admin dashboard.
- CMS.
- Login.
- Database.
- Upload PDF dari UI.
- Animasi kompleks/3D.
- Full glassmorphism berat.

## 12. Acceptance Criteria

Selesai bila:
- Website terlihat Notion-inspired light minimal dengan subtle glass.
- Navigasi utama mengikuti Overview / Timeline Magang / Dokumentasi Teknis / PDF Library / Profil.
- Semua PDF lama tetap bisa dibuka.
- Konten minggu 1–5 tersedia dalam format baru.
- Build Astro dan Docker berhasil.
- Tampilan mobile tidak rusak.
- Repo punya struktur konten yang mudah ditambah untuk minggu/dokumen baru.
