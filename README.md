# CloudSync

A private home for photos, documents and everything in between. Built with **Next.js 16**, **React 19**, **Tailwind CSS 4** and **Supabase** — with a zero-config local mode so the entire app runs on localhost immediately.

<p align="center">
  <a href="https://vercel.com">
    <img src="https://vercel.com/opengraph-card.vercel.dev.svg" alt="Deploy to Vercel">
  </a>
</p>

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The application starts in **local mode** by default — no environment variables required. Accounts, files, folders, stars and trash persist in `localStorage` and IndexedDB. Everything survives a reload.

---

## 📦 Deployment

### Vercel (Recommended)

Deploy to [Vercel](https://vercel.com/new) from this repository. Vercel automatically builds with Next.js 16.

- **Local mode (no config needed):** Leave `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` blank in the Vercel dashboard. The app runs fully in local mode.
- **Production Supabase mode:** Add both variables in the Vercel dashboard:

  ```text
  NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
  ```

- **Production URL:** After deploy, your app will be available at `https://cloudsync.vercel.app`

### Netlify

1. Connect this repository to Netlify.
2. Set environment variables optional (for Supabase mode).
3. Deploy — Netlify auto-detects the Next.js build configuration.

---

## 💻 Local Development

```bash
npm install
npm run dev
```

- Open [http://localhost:3000](http://localhost:3000).
- **Local mode** starts automatically (no env vars needed).
- All features work: authentication, file uploads, stars, trash, search, sort, grid/list view.
- Data survives page reloads (stored in browser `localStorage` and IndexedDB).

### Switch to Supabase

1. Copy `.env.example` to `.env.local`.
2. Fill in the variables:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

3. In the Supabase SQL editor, run:

   ```sql
   -- From the project root
   \i database/schema.sql
   \i database/002_features.sql
   ```

4. In Supabase Storage, create a **private** bucket named `cloudsync`.
5. Restart: `npm run dev`.

The app auto-detects the keys and switches to real Supabase authentication, database rows, and signed storage URLs.

---

## ✅ Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server (Next.js Turbopack) |
| `npm run build` | Production build (Next.js 16.4.6, optimized) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint — zero errors, zero warnings |

---

## 📁 Project Structure

```
src/
  app/
    page.tsx              Landing page with 18 routes
    dashboard/            My Drive view
    recent/ starred/ …    Library sub-views
    auth/signin|register  Authentication screens
    settings/ profile/    Account screens
    error.tsx             404 page + error boundary
    globals.css           Design tokens + base styles
  components/
    AppShell.tsx          Sidebar, mobile nav, storage meter
    DriveView.tsx         Search, sort, grid/list, uploads, modals
    FileCard.tsx          File cards, rows, action menus
    ui/                   Button, Logo, Modal, Glyph, Spinner
  lib/
    cloud/                Local adapter, Supabase adapter, provider
    files.ts format.ts    File kind detection + formatting helpers
database/
  schema.sql              Supabase base schema
  002_features.sql        Columns: starred, deleted_at, updated_at + trigger
next.config.ts            Next.js 16 configuration
package.json              Project dependencies
tsconfig.json             TypeScript configuration
README.md               This file
```

---

## 🎨 Design References

This interface was rebuilt around two professional design systems:

- **[Nutlope/hallmark](https://github.com/Nutlope/hallmark)** — the anti-slop design floor:
  - Token-only colours and fonts (no hard-coded CSS values)
  - No `transition: all`, no width/height/top/left animations
  - One accent colour, one idea per screen
  - Text-first labels, product shown as itself (no stock art)

- **[emilkowalski/skills · apple-design](https://github.com/emilkowalski/skills)** and
  **[dickwu/apple-design-skill](https://github.com/dickwu/apple-design-skill)** — Apple HIG:
  - System typography with size-specific tracking and leading
  - Press feedback on pointer-down (`transform: scale()` only)
  - Spring-like motion on `transform`/`opacity` only
  - Translucent chrome with `backdrop-filter: blur(20px)`
  - Reduced-motion and reduced-transparency fallbacks
  - Increased-contrast for `prefers-contrast: more`

**Signature moment:** the live file shelf — real file tiles from the app's own data, not stock art.

---

## ⚠️ Limits Worth Knowing

| Limit | Description |
| --- | --- |
| **Sample files** | Metadata only; download works for files you upload yourself |
| **Sharing** | Placeholder; schema includes a `shares` table for future use |
| **Local mode** | Per browser and per origin. Clearing site data resets it |
| **Supabase mode** | Requires `.env.local` + SQL migration + private bucket `cloudsync` |
| **Authentication** | Local mode uses salted SHA-256 hash (never stores plaintext). Not a security boundary. |

---

## 🛠 Maintenance

### Adding a New Route

1. Create `src/app/NEW_ROUTE/page.tsx`
2. Add the route link to `src/components/AppShell.tsx` if needed
3. Run `npm run lint && npm run build` to verify

### Rebranding

All colours and fonts are declared as CSS tokens in `src/app/globals.css`. To rebrand:

1. Edit the `--c-*` variables in `globals.css`
2. Update `font-family: var(--font-ui)` if swapping system fonts
3. Re-run `npm run build` — no hard-coded values to chase

### Demo ↔ Supabase Mode

- **Demo:** Remove/empty `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local`
- **Supabase:** Add both variables, run the SQL migrations, create the private bucket `cloudsync`
- The `MODE` auto-detection lives in `src/lib/cloud/provider.tsx` — no code changes required

---

## 📄 License

MIT License. See the included `AGENTS.md` for project-internal notes.

---

<p align="center">
  <strong>CloudSync — Every file, in one calm place.</strong><br>
  <a href="https://vercel.com">
    <img src="https://vercel.com/opengraph-card.vercel.dev.svg" alt="Deploy to Vercel">
  </a>
</p>