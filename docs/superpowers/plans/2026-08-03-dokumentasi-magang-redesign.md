# Redesign Dokumentasi Magang (Astro) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rombak total website dokumentasi magang dari HTML statis lama menjadi portal dokumentasi Astro modern (Notion Editorial Docs + subtle glass) dengan struktur Overview / Timeline Magang / Dokumentasi Teknis / PDF Library / Profil.

**Architecture:** Static Site Generator (Astro) → output static HTML/CSS/JS → nginx:alpine multi-stage Docker. Konten logbook di Markdown, dokumen PDF & topik di data module TypeScript.

**Tech Stack:** Astro 5, TypeScript (data modules), CSS vanilla dengan custom properties (tanpa framework UI), Markdown content collections, nginx:alpine (deploy).

## Global Constraints

- Bahasa konten: **Indonesia**.
- Design: Notion Editorial Docs + subtle glass — light minimal, warm neutral (`#f6f5f4`), accent `#0075de`, border `rgba(0,0,0,0.10)`, glass hanya topbar/sidebar/hero shell.
- Konten lama dipertahankan (minggu 1–5, PDF, profil mahasiswa). Desain lama dibuang.
- Tidak ada backend, login, DB, CMS, atau upload.
- PDF tetap di `public/assets/pdf/`.
- Semua interaksi client-side ringan (search/filter PDF, nav active state, view transitions opsional).
- Output static → Dockerfile multi-stage → nginx:alpine.
- Font: Inter (Google Fonts).
- Setiap task: verifikasi build, lalu commit.

---

### Task 1: Scaffold Astro Project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `.gitignore`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/styles/global.css`
- Create: `src/pages/index.astro` (placeholder)

**Interfaces:**
- Consumes: nothing
- Produces: project scaffold that runs `npm run build` and `npm run dev`; `BaseLayout` with `title` prop; `global.css` with CSS custom properties

- [ ] **Step 1: Initialize Astro (manual scaffold, non-empty repo)**

Repo sudah berisi `index.html`, `style.css`, `script.js`, `Dockerfile`, `assets/pdf/`. `npm create astro` menolak non-empty dir, jadi buat file manual — ini lebih aman dan deterministik.

```bash
cd /root/dokumentasi-magang-diskominfo
npm init -y
npm install astro@latest @astrojs/check typescript
```

Lalu di `package.json` ganti `"scripts"`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  }
}
```

> Catatan: `index.html`, `style.css`, `script.js`, dan `Dockerfile` lama tetap ada sampai Task 9. Astro tidak akan memakainya, tapi jangan dihapus dulu — content PDF di `public/` bakal di-migrate.

- [ ] **Step 2: Create config files**

`astro.config.mjs`:

```js
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://magang-diskominfo.local',
  output: 'static',
});
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

`src/env.d.ts`:

```ts
/// <reference types="astro/client" />
```

`.gitignore`:

```
node_modules/
dist/
.astro/
.DS_Store
```

- [ ] **Step 3: Create global.css with design tokens**

`src/styles/global.css`:

```css
:root {
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
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --shadow-card: rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.84688px, rgba(0,0,0,0.02) 0px 0.8px 2.925px, rgba(0,0,0,0.01) 0px 0.175px 1.04062px;
  --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

.container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
}
.btn-primary:hover { background: #005bab; text-decoration: none; }

.btn-ghost {
  background: rgba(0,0,0,0.05);
  color: var(--text);
}
.btn-ghost:hover { background: rgba(0,0,0,0.08); text-decoration: none; }
```

- [ ] **Step 4: Create BaseLayout**

`src/layouts/BaseLayout.astro`:

```astro
---
interface Props {
  title?: string;
  description?: string;
}

const { title = 'Dokumentasi Magang Diskominfo Tuban', description = 'Portal dokumentasi kegiatan magang' } = Astro.props;
---

<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/src/styles/global.css" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 5: Create placeholder index page**

`src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Overview | Dokumentasi Magang">
  <main class="container" style="padding-top: 120px">
    <h1>Overview</h1>
    <p>Placeholder — task selanjutnya mengganti ini.</p>
  </main>
</BaseLayout>
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: `dist/` ter-generate, exit 0.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro project with design tokens and BaseLayout"
```

---

### Task 2: Data Modules (documents, topics, profiles, weeks)

**Files:**
- Create: `src/data/documents.ts`
- Create: `src/data/topics.ts`
- Create: `src/data/profiles.ts`
- Create: `src/data/weeks.ts`
- Create: `src/types.ts`

**Interfaces:**
- Consumes: nothing (pure data)
- Produces:
  - `DOCUMENTS: DocumentItem[]` — `{ id, title, category, file, week, desc? }`
  - `TOPICS: Topic[]` — `{ id, name, icon?, desc, docs, weeks }`
  - `PROFILES: Profile[]` — `{ name, nim, study, role?, image? }`
  - `WEEKS: Week[]` — `{ id, number, title, subtitle, status, categories, summary, activities, documents, week }`
  - Types: `DocumentItem`, `Topic`, `Profile`, `Week`, `Category` (exported from `src/types.ts`)

- [ ] **Step 1: Migrate PDF assets to public/**

Astro menyalin seluruh isi `public/` ke root output. Pindahkan PDF dari `assets/` ke `public/assets/`:

```bash
cd /root/dokumentasi-magang-diskominfo
mkdir -p public/assets
mv assets/pdf public/assets/pdf
rmdir assets 2>/dev/null || true
```

Verify:

```bash
ls public/assets/pdf/
```

Expected: 7 file PDF. Nama file mengandung spasi — biarkan, nanti di-link dengan URL-encode di browser secara otomatis.

- [ ] **Step 2: Create types**

`src/types.ts`:

```ts
export type Category = 'networking' | 'virtualization' | 'cloud' | 'ai-agent';

export interface DocumentItem {
  id: string;
  title: string;
  category: Category;
  file: string;
  week?: number;
  desc?: string;
}

export interface Topic {
  id: string;
  name: string;
  desc: string;
  docs: string[];
  weeks: number[];
}

export interface Profile {
  name: string;
  nim: string;
  study: string;
  role: string;
}

export interface WeekActivity {
  title: string;
  desc?: string;
}

export interface Week {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  status: 'completed' | 'planned';
  categories: Category[];
  summary: string;
  activities: WeekActivity[];
  documents: string[];
}
```

- [ ] **Step 2: Create documents data**

`src/data/documents.ts`:

```ts
import type { DocumentItem } from '../types';

export const DOCUMENTS: DocumentItem[] = [
  {
    id: 'proxmox-mikrotik',
    title: 'Implementasi Proxmox VE dan Integrasi MikroTik',
    category: 'virtualization',
    file: '/assets/pdf/Implementasi Proxmox VE dan Integrasi MikroTik.pdf',
    week: 4,
    desc: 'Panduan implementasi hypervisor Proxmox VE dan integrasi dengan router MikroTik.',
  },
  {
    id: 'instalasi-vm-wordpress',
    title: 'Installasi VM dan WordPress',
    category: 'virtualization',
    file: '/assets/pdf/Installasi Vm dan Wordpress.pdf',
    week: 4,
    desc: 'Langkah instalasi virtual machine dan stack WordPress.',
  },
  {
    id: 'cloudflare-tunnel',
    title: 'Step by Step Cloudflare Tunnel',
    category: 'cloud',
    file: '/assets/pdf/step by step cloudflare tunnel.pdf',
    week: 4,
    desc: 'Konfigurasi Cloudflare Zero Trust Tunnel untuk ekspose layanan ke publik.',
  },
  {
    id: 'subnetting-virtualbox-slax',
    title: 'Step By Step Subnetting VirtualBox SLAX',
    category: 'networking',
    file: '/assets/pdf/Step By Step Subnetting VirtualBox SLAX.pdf',
    week: 4,
    desc: 'Simulasi subnetting menggunakan VirtualBox dan Linux SLAX.',
  },
  {
    id: 'vlan-simulasi',
    title: 'Simulasi VLAN',
    category: 'networking',
    file: '/assets/pdf/vlan-simulasi.pdf',
    week: 4,
    desc: 'Konfigurasi dan simulasi VLAN mode trunk-access serta tag-untag.',
  },
  {
    id: 'simulasi-hotspot-gns3',
    title: 'Simulasi Hotspot MikroTik di GNS3',
    category: 'networking',
    file: '/assets/pdf/simulasi-hotspot-gns3.pdf',
    week: 4,
    desc: 'Simulasi topologi hotspot MikroTik menggunakan GNS3.',
  },
  {
    id: 'langkah-instalasi-vm-proxmox',
    title: 'Langkah Installasi VM pada Proxmox VE',
    category: 'virtualization',
    file: '/assets/pdf/Langkah Installasi VM pada Proxmox VE.pdf',
    week: 4,
    desc: 'Panduan langkah instalasi VM pada Proxmox VE.',
  },
];
```

- [ ] **Step 3: Create topics data**

`src/data/topics.ts`:

```ts
import type { Topic } from '../types';

export const TOPICS: Topic[] = [
  {
    id: 'networking',
    name: 'Networking',
    desc: 'Subnetting, VLAN, dan simulasi topologi jaringan.',
    docs: ['subnetting-virtualbox-slax', 'vlan-simulasi', 'simulasi-hotspot-gns3'],
    weeks: [1, 2, 4],
  },
  {
    id: 'virtualization',
    name: 'Virtualization',
    desc: 'Proxmox VE, virtual machine, dan Docker.',
    docs: ['proxmox-mikrotik', 'langkah-instalasi-vm-proxmox', 'instalasi-vm-wordpress'],
    weeks: [3, 4],
  },
  {
    id: 'cloud',
    name: 'Cloud & Security',
    desc: 'Cloudflare Tunnel, HTTPS, dan keamanan layanan.',
    docs: ['cloudflare-tunnel'],
    weeks: [3, 4],
  },
  {
    id: 'ai-agent',
    name: 'AI Agent Infrastructure',
    desc: 'Hermes Agent, 9Router, dan integrasi Telegram.',
    docs: [],
    weeks: [],
  },
];
```

- [ ] **Step 4: Create profiles data**

`src/data/profiles.ts`:

```ts
import type { Profile } from '../types';

export const PROFILES: Profile[] = [
  {
    name: 'Muhammad Rasya Faiz Fajar Nabil',
    nim: '240605110098',
    study: 'Teknik Informatika, UIN Malang',
    role: 'Mahasiswa Magang — Divisi Aptika',
  },
  {
    name: 'Devandriya Athallah P',
    nim: '240605110107',
    study: 'Teknik Informatika, UIN Malang',
    role: 'Mahasiswa Magang — Divisi Aptika',
  },
];
```

- [ ] **Step 5: Create weeks data**

`src/data/weeks.ts`:

```ts
import type { Week } from '../types';

export const WEEKS: Week[] = [
  {
    id: 'minggu-1',
    number: 1,
    title: 'MikroTik Dasar & Hotspot',
    subtitle: 'Perancangan topologi jaringan dan dasar MikroTik',
    status: 'completed',
    categories: ['networking'],
    summary: 'Perancangan topologi jaringan dan kalkulasi alokasi IP Address (subnetting), setup dasar MikroTik RouterBoard, serta konfigurasi hotspot server dan manajemen user profile.',
    activities: [
      { title: 'Perancangan topologi jaringan dan kalkulasi alokasi IP Address (Subnetting).' },
      { title: 'Setup dasar MikroTik RouterBoard: IP, Gateway, DNS, dan NAT Masquerade.' },
      { title: 'Konfigurasi Hotspot Server dan manajemen user profile.' },
    ],
    documents: [],
  },
  {
    id: 'minggu-2',
    number: 2,
    title: 'VLAN & Inter-VLAN Routing',
    subtitle: 'Segmentasi jaringan dengan VLAN',
    status: 'completed',
    categories: ['networking'],
    summary: 'Implementasi VLAN, konfigurasi port trunking dan access, inter-VLAN routing, serta penerapan firewall filter rules dasar.',
    activities: [
      { title: 'Implementasi VLAN: pembuatan VLAN ID dan konfigurasi port Trunking & Access.' },
      { title: 'Setup Inter-VLAN Routing untuk komunikasi antar sub-jaringan.' },
      { title: 'Penerapan Firewall Filter Rules dasar untuk mengamankan trafik internal.' },
    ],
    documents: [],
  },
  {
    id: 'minggu-3',
    number: 3,
    title: 'Proxmox & Dockerization',
    subtitle: 'Hypervisor dan containerisasi',
    status: 'completed',
    categories: ['virtualization', 'cloud'],
    summary: 'Deployment Proxmox VE, konfigurasi VM Alpine Linux, deployment stack WordPress + MariaDB dengan Docker Compose, dan integrasi Cloudflare Tunnel.',
    activities: [
      { title: 'Deployment bare-metal hypervisor Proxmox VE.' },
      { title: 'Konfigurasi VM Alpine Linux: SSH dan repository community.' },
      { title: 'Deployment stack WordPress + MariaDB 10.5 dengan Docker Compose.' },
      { title: 'Integrasi Cloudflare Zero Trust Tunnel untuk ekspose domain publik (HTTPS).' },
    ],
    documents: [],
  },
  {
    id: 'minggu-4',
    number: 4,
    title: 'Simulasi Hotspot, VLAN, Proxmox & Cloudflare Tunnel',
    subtitle: 'Simulasi jaringan dan dokumentasi teknis',
    status: 'completed',
    categories: ['networking', 'virtualization', 'cloud'],
    summary: 'Simulasi topologi hotspot MikroTik di GNS3, simulasi VLAN trunk-access, implementasi Proxmox VE, konfigurasi Cloudflare Tunnel, subnetting VirtualBox SLAX, dan instalasi VM WordPress.',
    activities: [
      { title: 'Simulasi Topologi Hotspot MikroTik di GNS3.' },
      { title: 'Konfigurasi dan Simulasi VLAN Mode Trunk-Access & Tag-Untag.' },
      { title: 'Implementasi Proxmox VE dan Integrasi MikroTik.' },
      { title: 'Konfigurasi dan Implementasi Cloudflare Tunnel.' },
      { title: 'Konfigurasi Subnetting menggunakan VirtualBox dan Linux SLAX.' },
      { title: 'Langkah Installasi VM pada Proxmox VE.' },
      { title: 'Instalasi VM dan WordPress.' },
    ],
    documents: ['simulasi-hotspot-gns3', 'vlan-simulasi', 'proxmox-mikrotik', 'cloudflare-tunnel', 'subnetting-virtualbox-slax', 'langkah-instalasi-vm-proxmox', 'instalasi-vm-wordpress'],
  },
  {
    id: 'minggu-5',
    number: 5,
    title: 'Belum ada kegiatan',
    subtitle: 'Menunggu materi atau tugas berikutnya',
    status: 'planned',
    categories: [],
    summary: 'Kegiatan minggu ini belum terisi. Halaman ini akan diperbarui ketika aktivitas resmi tersedia.',
    activities: [],
    documents: [],
  },
];
```

- [ ] **Step 6: Verify data compiles**

```bash
npx astro check
```

Expected: no type errors (types clean).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add data modules for documents, topics, profiles, weeks"
```

---

### Task 3: Layout Components (Sidebar, Topbar, Footer)

**Files:**
- Create: `src/components/Sidebar.astro`
- Create: `src/components/Topbar.astro`
- Create: `src/components/Footer.astro`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: nothing
- Produces: `<Sidebar />`, `<Topbar />`, `<Footer />` components used by BaseLayout; nav items with `href`, `label`, optional `icon`

- [ ] **Step 1: Create Sidebar**

`src/components/Sidebar.astro`:

```astro
---
const navItems = [
  { href: '/', label: 'Overview', icon: 'home' },
  { href: '/timeline', label: 'Timeline Magang', icon: 'calendar' },
  { href: '/dokumentasi', label: 'Dokumentasi Teknis', icon: 'book' },
  { href: '/pdf-library', label: 'PDF Library', icon: 'description' },
  { href: '/profil', label: 'Profil', icon: 'person' },
];

const currentPath = Astro.url.pathname;
---

<aside class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <span class="sidebar-logo">DM</span>
    <div>
      <h1 class="sidebar-title">Docs Magang</h1>
      <p class="sidebar-subtitle">Diskominfo Tuban</p>
    </div>
  </div>
  <nav class="sidebar-nav">
    {
      navItems.map((item) => (
        <a
          href={item.href}
          class:list={['nav-link', { active: currentPath === item.href }]}
        >
          <span class="nav-icon">{item.icon}</span>
          {item.label}
        </a>
      ))
    }
  </nav>
  <div class="sidebar-footer">
    <p>© {new Date().getFullYear()} Magang Aptika</p>
  </div>
</aside>
```

- [ ] **Step 2: Create Topbar**

`src/components/Topbar.astro`:

```astro
---
const currentPath = Astro.url.pathname;
---

<header class="topbar">
  <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Buka menu" aria-expanded="false">
    <span class="topbar-icon">☰</span>
  </button>
  <div class="topbar-title">Dokumentasi Magang</div>
  <div class="topbar-actions">
    <a href="/pdf-library" class="btn btn-primary btn-sm">PDF Library</a>
  </div>
</header>
```

- [ ] **Step 3: Create Footer**

`src/components/Footer.astro`:

```astro
<footer class="footer">
  <div class="container footer-inner">
    <p>Dokumentasi Magang Diskominfo Tuban — Teknik Informatika UIN Malang.</p>
  </div>
</footer>
```

- [ ] **Step 4: Wire components into BaseLayout**

Modify `src/layouts/BaseLayout.astro` body to:

```astro
  <body>
    <div class="app-shell">
      <Sidebar />
      <div class="main-area">
        <Topbar />
        <main class="main-content">
          <slot />
        </main>
        <Footer />
      </div>
    </div>
    <script>
      // Mobile sidebar toggle
      const btn = document.getElementById('mobile-menu-btn');
      const sidebar = document.getElementById('sidebar');
      if (btn && sidebar) {
        btn.addEventListener('click', () => {
          sidebar.classList.toggle('open');
          btn.setAttribute('aria-expanded', sidebar.classList.contains('open').toString());
        });
      }
    </script>
  </body>
```

Plus imports at top:

```astro
---
import Sidebar from '../components/Sidebar.astro';
import Topbar from '../components/Topbar.astro';
import Footer from '../components/Footer.astro';
---
```

- [ ] **Step 5: Add layout CSS**

Append to `src/styles/global.css`:

```css
.app-shell { display: flex; min-height: 100vh; }

.sidebar {
  width: 280px;
  background: var(--surface-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-right: 1px solid var(--border);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  margin-bottom: 32px;
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.02em;
}

.sidebar-title { font-size: 16px; font-weight: 700; }
.sidebar-subtitle { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--muted);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}
.nav-link:hover { background: var(--bg-soft); color: var(--text); text-decoration: none; }
.nav-link.active {
  background: var(--accent-soft);
  color: var(--accent);
}
.nav-icon { font-size: 16px; }

.sidebar-footer { padding: 16px 8px 0; font-size: 12px; color: var(--muted-soft); border-top: 1px solid var(--border); }

.main-area { flex: 1; margin-left: 280px; display: flex; flex-direction: column; min-height: 100vh; }

.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: var(--surface-glass);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--border);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--text);
}

.topbar-title { font-size: 15px; font-weight: 600; color: var(--muted); }
.btn-sm { padding: 8px 16px; font-size: 13px; }

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
  padding: 48px 24px 96px;
}

.footer { border-top: 1px solid var(--border); padding: 24px 0; background: var(--bg-soft); }
.footer-inner { display: flex; justify-content: center; align-items: center; gap: 16px; font-size: 14px; color: var(--muted); }

@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); transition: transform 0.3s ease; }
  .sidebar.open { transform: translateX(0); }
  .main-area { margin-left: 0; }
  .mobile-menu-btn { display: block; }
}
```

- [ ] **Step 6: Verify build + render**

```bash
npm run build
```

Expected: build sukses; `dist/index.html` ada. Cek di browser (opsional): sidebar + topbar muncul.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add sidebar, topbar, footer shell components"
```

---

### Task 4: Overview Page (Home)

**Files:**
- Create: `src/pages/index.astro` (rewrite placeholder)
- Create: `src/components/Hero.astro`
- Create: `src/components/StatCard.astro`
- Create: `src/components/TopicCard.astro`

**Interfaces:**
- Consumes: `WEEKS`, `DOCUMENTS`, `TOPICS`, `PROFILES` from data modules
- Produces: home page rendering hero, stats, topic highlights, latest docs, profile preview

- [ ] **Step 1: Create Hero**

`src/components/Hero.astro`:

```astro
---
const stats = [
  { value: '5', label: 'Minggu Magang' },
  { value: '7', label: 'Dokumen PDF' },
  { value: '4', label: 'Topik Teknis' },
  { value: '80%', label: 'Progress' },
];
---

<section class="hero">
  <div class="container hero-inner">
    <span class="hero-badge">UIN Malang · Diskominfo Tuban · Divisi Aptika</span>
    <h1 class="hero-title">Portal Dokumentasi Magang Diskominfo Tuban</h1>
    <p class="hero-desc">
      Dokumentasi kegiatan magang, logbook mingguan, dan artefak teknis —
      dari jaringan, virtualisasi, hingga AI agent infrastructure.
    </p>
    <div class="hero-actions">
      <a href="/timeline" class="btn btn-primary">Lihat Timeline</a>
      <a href="/pdf-library" class="btn btn-ghost">Buka PDF Library</a>
    </div>
    <div class="hero-stats">
      {
        stats.map((s) => (
          <div class="hero-stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))
      }
    </div>
  </div>
</section>
```

- [ ] **Step 2: Create StatCard & TopicCard**

`src/components/StatCard.astro`:

```astro
---
interface Props { value: string; label: string; }
const { value, label } = Astro.props;
---

<div class="stat-card">
  <strong class="stat-value">{value}</strong>
  <span class="stat-label">{label}</span>
</div>
```

`src/components/TopicCard.astro`:

```astro
---
import type { Topic } from '../types';
interface Props { topic: Topic; }
const { topic } = Astro.props;
---

<a href="/dokumentasi" class="topic-card card">
  <h3 class="topic-name">{topic.name}</h3>
  <p class="topic-desc">{topic.desc}</p>
  <span class="topic-count">{topic.docs.length} dokumen</span>
</a>
```

- [ ] **Step 3: Rewrite index page**

`src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import TopicCard from '../components/TopicCard.astro';
import { DOCUMENTS } from '../data/documents';
import { TOPICS } from '../data/topics';
import { WEEKS } from '../data/weeks';
import { PROFILES } from '../data/profiles';

const latestDocs = DOCUMENTS.slice(0, 3);
---

<BaseLayout title="Overview | Dokumentasi Magang">
  <Hero />
  <section class="container home-section">
    <div class="section-head">
      <h2 class="section-title">Topik Teknis</h2>
      <a href="/dokumentasi" class="section-link">Lihat semua →</a>
    </div>
    <div class="topic-grid">
      {TOPICS.map((t) => <TopicCard topic={t} />)}
    </div>
  </section>
  <section class="container home-section">
    <div class="section-head">
      <h2 class="section-title">Dokumen Terbaru</h2>
      <a href="/pdf-library" class="section-link">PDF Library →</a>
    </div>
    <div class="doc-grid">
      {latestDocs.map((d) => (
        <a href={d.file} target="_blank" rel="noopener" class="doc-card card">
          <h4>{d.title}</h4>
          <p>{d.desc}</p>
          <span class="doc-badge">{d.category}</span>
        </a>
      ))}
    </div>
  </section>
  <section class="container home-section">
    <div class="section-head">
      <h2 class="section-title">Progress Magang</h2>
      <a href="/timeline" class="section-link">Timeline →</a>
    </div>
    <div class="progress-card card">
      <div class="progress-bar"><div class="progress-fill" style="width: 80%"></div></div>
      <div class="progress-stats">
        <span>{WEEKS.filter(w => w.status === 'completed').length}/{WEEKS.length} minggu selesai</span>
        <span>{PROFILES.length} mahasiswa</span>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 4: Add home CSS**

Append to `src/styles/global.css`:

```css
.hero {
  padding: 96px 24px 64px;
  background: var(--bg-soft);
  border-bottom: 1px solid var(--border);
  position: relative;
}

.hero-inner { max-width: 1160px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

.hero-badge {
  align-self: flex-start;
  background: var(--accent-soft);
  color: var(--accent);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.hero-title {
  font-size: clamp(32px, 5vw, 56px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  font-weight: 700;
  max-width: 720px;
}

.hero-desc { font-size: 18px; line-height: 1.6; color: var(--muted); max-width: 600px; }

.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

.hero-stats {
  display: flex;
  gap: 32px;
  margin-top: 24px;
  flex-wrap: wrap;
}
.hero-stat { display: flex; flex-direction: column; gap: 2px; }
.hero-stat strong { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; }
.hero-stat span { font-size: 13px; color: var(--muted); }

.home-section { padding: 48px 0; }
.section-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 24px; }
.section-title { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; }
.section-link { font-size: 14px; font-weight: 600; }

.topic-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }

.topic-card { display: flex; flex-direction: column; gap: 8px; padding: 24px; text-decoration: none; color: var(--text); }
.topic-card:hover { text-decoration: none; box-shadow: var(--shadow-card); transform: translateY(-2px); }
.topic-name { font-size: 18px; font-weight: 700; }
.topic-desc { font-size: 14px; color: var(--muted); }
.topic-count { font-size: 12px; color: var(--accent); font-weight: 600; }

.doc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
.doc-card { display: flex; flex-direction: column; gap: 8px; padding: 24px; text-decoration: none; color: var(--text); }
.doc-card:hover { text-decoration: none; box-shadow: var(--shadow-card); transform: translateY(-2px); }
.doc-card h4 { font-size: 16px; font-weight: 700; }
.doc-card p { font-size: 13px; color: var(--muted); }
.doc-badge { align-self: flex-start; background: var(--accent-soft); color: var(--accent); font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; }

.progress-card { padding: 24px; }
.progress-bar { width: 100%; background: var(--bg-soft); height: 10px; border-radius: 9999px; overflow: hidden; margin-bottom: 12px; }
.progress-fill { background: var(--accent); height: 100%; border-radius: 9999px; }
.progress-stats { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--muted); }
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: build sukses; home page render dengan hero/stats/topics/docs.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: build overview home page with hero and sections"
```

---

### Task 5: Timeline Magang Page

**Files:**
- Create: `src/pages/timeline.astro`
- Create: `src/components/WeekCard.astro`

**Interfaces:**
- Consumes: `WEEKS`, `DOCUMENTS`
- Produces: timeline page with vertical timeline of weeks; `WeekCard` with props `{ week, documents }`

- [ ] **Step 1: Create WeekCard**

`src/components/WeekCard.astro`:

```astro
---
import type { Week, DocumentItem } from '../types';
interface Props { week: Week; documents: DocumentItem[]; }
const { week, documents } = Astro.props;
const weekDocs = documents.filter((d) => week.documents.includes(d.id));
const catLabel: Record<string, string> = {
  networking: 'Networking',
  virtualization: 'Virtualization',
  cloud: 'Cloud & Security',
  'ai-agent': 'AI Agent',
};
---

<article class:list={['week-card', `status-${week.status}`]}>
  <div class="week-dot"></div>
  <div class="week-content card">
    <div class="week-head">
      <span class="week-badge">Minggu {week.number}</span>
      <span class:list={['status-badge', week.status]}>{week.status === 'completed' ? 'Selesai' : 'Planned'}</span>
    </div>
    <h3 class="week-title">{week.title}</h3>
    <p class="week-subtitle">{week.subtitle}</p>
    <p class="week-summary">{week.summary}</p>
    {week.categories.length > 0 && (
      <div class="week-cats">
        {week.categories.map((c) => <span class="cat-chip">{catLabel[c] ?? c}</span>)}
      </div>
    )}
    {week.activities.length > 0 && (
      <ul class="week-activities">
        {week.activities.map((a) => <li>{a.title}</li>)}
      </ul>
    )}
    {weekDocs.length > 0 && (
      <div class="week-docs">
        {weekDocs.map((d) => (
          <a href={d.file} target="_blank" rel="noopener" class="doc-link">
            📄 {d.title}
          </a>
        ))}
      </div>
    )}
  </div>
</article>
```

- [ ] **Step 2: Create timeline page**

`src/pages/timeline.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import WeekCard from '../components/WeekCard.astro';
import { WEEKS } from '../data/weeks';
import { DOCUMENTS } from '../data/documents';

const sortedWeeks = [...WEEKS].sort((a, b) => a.number - b.number);
---

<BaseLayout title="Timeline Magang | Dokumentasi Magang">
  <div class="page-head container">
    <h1 class="page-title">Timeline Magang</h1>
    <p class="page-desc">Perjalanan kegiatan magang minggu per minggu.</p>
  </div>
  <div class="timeline container">
    {sortedWeeks.map((week) => <WeekCard week={week} documents={DOCUMENTS} />)}
  </div>
</BaseLayout>
```

- [ ] **Step 3: Add timeline CSS**

Append to `src/styles/global.css`:

```css
.page-head { padding: 48px 0 24px; }
.page-title { font-size: 40px; font-weight: 700; letter-spacing: -0.03em; }
.page-desc { font-size: 17px; color: var(--muted); margin-top: 8px; }

.timeline { position: relative; padding: 24px 0 48px; display: flex; flex-direction: column; gap: 32px; }

.week-card { display: flex; gap: 20px; position: relative; }
.week-dot {
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--accent); margin-top: 28px; flex-shrink: 0;
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.week-card.status-planned .week-dot { background: var(--muted-soft); box-shadow: 0 0 0 4px var(--bg-soft); }

.week-content { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 12px; }
.week-head { display: flex; justify-content: space-between; align-items: center; }
.week-badge { font-size: 12px; font-weight: 700; color: var(--accent); background: var(--accent-soft); padding: 4px 12px; border-radius: 9999px; }
.status-badge { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; }
.status-completed { background: #e7f7ee; color: var(--success); }
.status-planned { background: var(--bg-soft); color: var(--muted); }

.week-title { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
.week-subtitle { font-size: 14px; font-weight: 600; color: var(--muted); }
.week-summary { font-size: 15px; color: var(--muted); }

.week-cats { display: flex; gap: 8px; flex-wrap: wrap; }
.cat-chip { font-size: 11px; font-weight: 600; background: var(--bg-soft); border: 1px solid var(--border); color: var(--muted); padding: 4px 10px; border-radius: 9999px; }

.week-activities { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.week-activities li { font-size: 14px; color: var(--text); padding-left: 20px; position: relative; }
.week-activities li::before { content: '✓'; position: absolute; left: 0; color: var(--success); font-weight: 700; }

.week-docs { display: flex; flex-direction: column; gap: 6px; padding-top: 8px; border-top: 1px solid var(--border); }
.doc-link { font-size: 14px; font-weight: 500; }
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: build sukses; `/timeline` render.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add timeline page with week cards"
```

---

### Task 6: Dokumentasi Teknis Page

**Files:**
- Create: `src/pages/dokumentasi.astro`

**Interfaces:**
- Consumes: `TOPICS`, `DOCUMENTS`
- Produces: docs page grouping content by topic with document lists

- [ ] **Step 1: Create page**

`src/pages/dokumentasi.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { TOPICS } from '../data/topics';
import { DOCUMENTS } from '../data/documents';

const catLabel: Record<string, string> = {
  networking: 'Networking',
  virtualization: 'Virtualization',
  cloud: 'Cloud & Security',
  'ai-agent': 'AI Agent',
};
---

<BaseLayout title="Dokumentasi Teknis | Dokumentasi Magang">
  <div class="page-head container">
    <h1 class="page-title">Dokumentasi Teknis</h1>
    <p class="page-desc">Kumpulan dokumentasi dan artefak teknis per domain.</p>
  </div>
  <div class="docs-list container">
    {
      TOPICS.map((topic) => {
        const docs = DOCUMENTS.filter((d) => topic.docs.includes(d.id));
        return (
          <section class="topic-section" id={topic.id}>
            <div class="topic-section-head">
              <h2 class="topic-section-title">{topic.name}</h2>
              <p class="topic-section-desc">{topic.desc}</p>
            </div>
            {docs.length > 0 ? (
              <div class="topic-docs">
                {docs.map((d) => (
                  <a href={d.file} target="_blank" rel="noopener" class="topic-doc card">
                    <div>
                      <h4>{d.title}</h4>
                      {d.desc && <p>{d.desc}</p>}
                    </div>
                    <span class="doc-badge">{d.week ? `Minggu ${d.week}` : 'Umum'}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p class="empty-note">Dokumentasi menyusul.</p>
            )}
          </section>
        );
      })
    }
  </div>
</BaseLayout>
```

- [ ] **Step 2: Add CSS**

Append to `src/styles/global.css`:

```css
.docs-list { display: flex; flex-direction: column; gap: 48px; padding-bottom: 48px; }

.topic-section { display: flex; flex-direction: column; gap: 16px; }
.topic-section-head { display: flex; flex-direction: column; gap: 4px; }
.topic-section-title { font-size: 24px; font-weight: 700; }
.topic-section-desc { font-size: 14px; color: var(--muted); }

.topic-docs { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.topic-doc { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 20px; text-decoration: none; color: var(--text); }
.topic-doc:hover { text-decoration: none; box-shadow: var(--shadow-card); transform: translateY(-2px); }
.topic-doc h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
.topic-doc p { font-size: 13px; color: var(--muted); }
.empty-note { font-size: 14px; color: var(--muted-soft); font-style: italic; }
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add technical documentation page"
```

---

### Task 7: PDF Library Page

**Files:**
- Create: `src/pages/pdf-library.astro`
- Create: `src/scripts/pdfLibrary.ts`

**Interfaces:**
- Consumes: `DOCUMENTS`
- Produces: searchable/filterable PDF library page; `pdfLibrary.ts` client script

- [ ] **Step 1: Create page**

`src/pages/pdf-library.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { DOCUMENTS } from '../data/documents';
import { pdfLibrary } from '../scripts/pdfLibrary';

const categories = ['all', ...new Set(DOCUMENTS.map((d) => d.category))];
---

<BaseLayout title="PDF Library | Dokumentasi Magang">
  <div class="page-head container">
    <h1 class="page-title">PDF Library</h1>
    <p class="page-desc">Cari dan buka dokumen PDF dokumentasi.</p>
  </div>
  <div class="pdf-lib container">
    <div class="pdf-controls">
      <input type="search" id="pdf-search" class="pdf-search" placeholder="Cari dokumen..." />
      <div class="pdf-filters" id="pdf-filters">
        {categories.map((c) => (
          <button class:list={['filter-btn', { active: c === 'all' }]} data-filter={c}>
            {c === 'all' ? 'Semua' : c.replace('-', ' ')}
          </button>
        ))}
      </div>
    </div>
    <div class="pdf-grid" id="pdf-grid">
      {DOCUMENTS.map((d) => (
        <a href={d.file} target="_blank" rel="noopener" class="pdf-card card" data-category={d.category}>
          <div class="pdf-icon">PDF</div>
          <h4 class="pdf-title">{d.title}</h4>
          {d.desc && <p class="pdf-desc">{d.desc}</p>}
          <div class="pdf-meta">
            <span class="doc-badge">{d.category}</span>
            {d.week && <span class="pdf-week">Minggu {d.week}</span>}
          </div>
        </a>
      ))}
    </div>
  </div>
  <script>
    {pdfLibrary()}
  </script>
</BaseLayout>
```

- [ ] **Step 2: Create client script**

`src/scripts/pdfLibrary.ts`:

```ts
export function pdfLibrary() {
  return `
    document.addEventListener('DOMContentLoaded', () => {
      const search = document.getElementById('pdf-search');
      const filters = document.querySelectorAll('.filter-btn');
      const cards = document.querySelectorAll('.pdf-card');

      if (!search) return;

      const applyFilter = () => {
        const q = search.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
        cards.forEach((card) => {
          const title = (card.querySelector('.pdf-title')?.textContent || '').toLowerCase();
          const desc = (card.querySelector('.pdf-desc')?.textContent || '').toLowerCase();
          const cat = card.getAttribute('data-category') || '';
          const matchQ = !q || title.includes(q) || desc.includes(q);
          const matchF = activeFilter === 'all' || cat === activeFilter;
          card.style.display = matchQ && matchF ? '' : 'none';
        });
      };

      search.addEventListener('input', applyFilter);
      filters.forEach((btn) => {
        btn.addEventListener('click', () => {
          filters.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          applyFilter();
        });
      });
    });
  `;
}
```

- [ ] **Step 3: Add CSS**

Append to `src/styles/global.css`:

```css
.pdf-controls { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
.pdf-search {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: var(--font-sans);
  background: var(--surface);
  outline: none;
}
.pdf-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }

.pdf-filters { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-btn {
  padding: 8px 16px;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-btn:hover { border-color: var(--accent); color: var(--accent); }
.filter-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }

.pdf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; padding-bottom: 48px; }
.pdf-card { display: flex; flex-direction: column; gap: 10px; padding: 24px; text-decoration: none; color: var(--text); }
.pdf-card:hover { text-decoration: none; box-shadow: var(--shadow-card); transform: translateY(-2px); }
.pdf-icon {
  width: 48px; height: 48px; border-radius: 10px;
  background: #ffebd6; color: #b45309;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
}
.pdf-title { font-size: 15px; font-weight: 700; line-height: 1.35; }
.pdf-desc { font-size: 13px; color: var(--muted); }
.pdf-meta { display: flex; align-items: center; gap: 8px; margin-top: auto; }
.pdf-week { font-size: 12px; color: var(--muted-soft); }
```

- [ ] **Step 4: Verify build + test search**

```bash
npm run build
```

Expected: build sukses. Di preview `npm run dev`, coba ketik di search → cards filter.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add searchable PDF library page"
```

---

### Task 8: Profil Page

**Files:**
- Create: `src/pages/profil.astro`

**Interfaces:**
- Consumes: `PROFILES`
- Produces: profile page with student cards and institution info

- [ ] **Step 1: Create page**

`src/pages/profil.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { PROFILES } from '../data/profiles';

const institution = {
  name: 'Diskominfo Tuban',
  division: 'Divisi Aplikasi Informatika',
  campus: 'Universitas Islam Negeri Maulana Malik Ibrahim Malang',
  study: 'Teknik Informatika',
};
---

<BaseLayout title="Profil | Dokumentasi Magang">
  <div class="page-head container">
    <h1 class="page-title">Profil</h1>
    <p class="page-desc">Informasi mahasiswa magang dan instansi.</p>
  </div>
  <div class="profile-page container">
    <section class="institution-card card">
      <h2 class="profile-section-title">{institution.name}</h2>
      <p class="profile-desc">{institution.division} · {institution.campus}</p>
      <p class="profile-desc">Program Studi {institution.study}</p>
    </section>
    <div class="profile-grid">
      {PROFILES.map((p) => (
        <div class="profile-card card">
          <div class="profile-avatar">
            {p.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
          </div>
          <h3 class="profile-name">{p.name}</h3>
          <p class="profile-role">{p.role}</p>
          <div class="profile-meta">
            <p><strong>NIM:</strong> {p.nim}</p>
            <p><strong>Studi:</strong> {p.study}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Add CSS**

Append to `src/styles/global.css`:

```css
.profile-page { display: flex; flex-direction: column; gap: 32px; padding-bottom: 48px; }

.institution-card { padding: 24px; display: flex; flex-direction: column; gap: 6px; }
.profile-section-title { font-size: 22px; font-weight: 700; }
.profile-desc { font-size: 15px; color: var(--muted); }

.profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.profile-card { padding: 24px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.profile-avatar {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--accent-soft); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 700;
}
.profile-name { font-size: 18px; font-weight: 700; }
.profile-role { font-size: 13px; color: var(--accent); font-weight: 600; }
.profile-meta { display: flex; flex-direction: column; gap: 4px; font-size: 14px; color: var(--muted); }
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add profile page"
```

---

### Task 9: Docker Multi-stage + Final QA

**Files:**
- Create: `Dockerfile` (replace nginx-only)
- Modify: `README.md` (optional, brief)

**Interfaces:**
- Consumes: Astro build output
- Produces: deployable container serving static dist via nginx

- [ ] **Step 1: Write Dockerfile**

`Dockerfile`:

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 2: Update .dockerignore**

Create `.dockerignore`:

```
node_modules
dist
.astro
.git
```

- [ ] **Step 3: Build Docker image**

```bash
docker build -t dokumentasi-magang:latest .
```

Expected: image builds, stage 1 compiles Astro, stage 2 copies dist.

- [ ] **Step 4: Test container**

```bash
docker run --rm -d -p 8085:80 --name dokmag-test dokumentasi-magang:latest
curl -s -o /dev/null -w "%{http_code}" http://localhost:8085/
```

Expected: HTTP 200.

- [ ] **Step 5: Final build check**

```bash
npm run build
```

Expected: no errors; all pages in `dist/`:
`index.html`, `timeline/index.html`, `dokumentasi/index.html`, `pdf-library/index.html`, `profil/index.html`.

- [ ] **Step 6: Cleanup test container**

```bash
docker rm -f dokmag-test
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add multi-stage Dockerfile for static deploy"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Astro + nginx static (Task 1, 9)
- ✅ Notion light minimal + subtle glass tokens (Task 1, 3)
- ✅ Opsi C Hybrid structure (Task 4-8)
- ✅ Search/filter PDF client-side (Task 7)
- ✅ Migrasi konten lama (Task 2, 5)
- ✅ Docker multi-stage (Task 9)
- ✅ Responsive (Task 3 CSS media query)
- ✅ No placeholder avatar — initials typographic (Task 8)

**Placeholder scan:**
- Tidak ada TBD/TODO.
- Semua file punya konten lengkap.
- Task 5 minggu-5 planned state jelas.

**Type consistency:**
- `DocumentItem.category: Category` = `'networking' | 'virtualization' | 'cloud' | 'ai-agent'` konsisten di types, documents, topics, weeks.
- `Week.status: 'completed' | 'planned'` dipakai di WeekCard & index.
- `Topic.docs: string[]` = document IDs, `Week.documents: string[]` = document IDs.
- `pdfLibrary()` return string di-inject via `<script>` — konsisten.
