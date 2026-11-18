# CloudSync

A private home for photos, documents and everything in between. Built with **Next.js 16**, **React 19**, **Tailwind CSS 4** and **Supabase** — with a zero-config local mode so the entire app runs immediately on localhost.

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/emilkowalski/skills@main/skills/apple-design/banner.svg" alt="Apple Design Inspired" width="300" />
  <img src="https://cdn.jsdelivr.net/gh/Nutlope/hallmark@main/README/header.svg" alt="Hallmark Design Floor" width="300" />
</p>

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

There is **no `.env.local` required** for demo mode. The app auto-detects and starts in local mode with pre-seeded sample data.

---

## 📦 Deployment

### Vercel (Recommended)

Deploy to [Vercel](https://vercel.com) from this repository. Vercel automatically builds with Next.js 16.

- **Demo mode (no config needed):** Leave `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` blank in the Vercel dashboard. The app runs fully in local mode.
- **Production Supabase mode:** Add both variables in the Vercel dashboard:

  ```text
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

- **Production URL:** After deploy, your app will be available at `https://cloudsync.vercel.app`

### Netlify

1. Connect this repo to Netlify.
2. Set environment variables in the dashboard (optional, for Supabase mode).
3. Deploy — Netlify will auto-detect the Next.js build config.

### Static export (optional)

```bash
npm run build
# The .next/ folder contains the production build.
```

---

## 📦 Local Development

```bash
npm install
npm run dev
```

- Open [http://localhost:3000](http://localhost:3000).
- **Demo mode** starts automatically (no env vars needed).
- All features work: auth, file uploads, stars, trash, search, sort, grid/list view.
- Files and accounts persist in `localStorage` + IndexedDB — survives reloads.

### Switch to Supabase

1. Copy `.env.example` to `.env.local`.
2. Fill in:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. In Supabase SQL editor, run:

   ```sql
   -- From project root
   \i database/schema.sql
   \i database/002_features.sql
   ```

4. In Supabase Storage, create a **private** bucket named `cloudsync`.
5. Restart: `npm run dev`.

The app auto-detects the keys and switches to real Supabase auth, database rows, and signed storage URLs.

---

## 📦 Available Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Start the dev server with Turbopack |
| `npm run build` | Production build (Next 16.4.6, optimized) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint — zero errors, zero warnings |

---

## 📁 Project Structure

```
src/
  app/
    page.tsx              Landing page (18 routes)
    dashboard/            My Drive
    recent/ starred/ …    Library views
    auth/signin|register  Auth screens
    settings/ profile/    Account screens
    error.tsx             404 + error boundary
    globals.css           Design tokens + base styles
  components/
    AppShell.tsx          Sidebar, mobile nav, storage meter
    DriveView.tsx         Search, sort, grid/list, uploads, modals
    FileCard.tsx          File cards, rows, action menus
    ui/                   Button, Logo, Modal, Glyph, Spinner
  lib/
    cloud/                Local adapter, Supabase adapter, provider
    files.ts format.ts    File kind + formatting helpers
database/
  schema.sql              Supabase base schema
  002_features.sql        starred/deleted_at/updated_at columns + trigger
  .env.example            Environment variables template

next.config.ts            Next.js 16 config
package.json              Project dependencies
tsconfig.json             TypeScript config
README.md                 This file
```

---

## 🎨 Design References

The interface was rebuilt around two design systems:

- **[Nutlope/hallmark](https://github.com/Nutlope/hallmark)** — the anti-slop design floor:
  - Token-only colours and fonts (no hard-coded CSS values)
  - No `transition: all`, no animated `width`/`height`/`top`/`left`
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
| **Sharing** | Placeholder; schema includes a `shares` table for the next step |
| **Local mode** | Per browser and per origin. Clearing site data resets it |
| **Supabase mode** | Requires `.env.local` + SQL migration + private bucket `cloudsync` |
| **Auth** | Local mode: salted SHA-256 hash (never stores plaintext password). Not a security boundary. |

---

## 🛠 Maintenance Notes

### Adding a New Route

1. Create `src/app/NEW_ROUTE/page.tsx`
2. Add `<NavbarLink href="/NEW_ROUTE">NEW</NavbarLink>` to `AppShell.tsx` if needed
3. Ensure the route is listed in `next.config.ts` `turbopack.rules` if using CSS loaders

### Changing the Design System

All colours and fonts go through `:root` tokens in `src/app/globals.css`. To rebrand:

1. Edit the `--c-*` variables in `globals.css`
2. Update `font-family: var(--font-ui)` if swapping system fonts
3. Re-run `npm run build` — no hard-coded values to chase down

### Switching Between Demo & Supabase

- **Demo:** Remove/empty `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local`
- **Supabase:** Add both vars, run the SQL migrations, create the bucket

The `MODE` auto-detection lives in `src/lib/cloud/provider.tsx` — no code changes needed.

---

## 📄 License

MIT License. See the included `AGENTS.md` for project-level notes.

---

## 🛠 Development Flow

```bash
# 1. Create a feature branch
git checkout -b feature/foo

# 2. Make changes (components, pages, styles, SQL)

# 3. Verify locally
npm run lint    # must pass clean
npm run build   # must pass

# 4. Commit & push
git add .
git commit -m "feat: add foo feature"
git push origin feature/foo

# 5. Open PR against main on GitHub
# 6. Deploy to Vercel for review
# 7. Merge & deploy to production
```

---

## 📞 Need Help?

- **Local mode issues?** Run `npm run lint && npm run build` — 99% of issues are caught there.
- **Supabase mode?** Ensure `database/schema.sql` and `database/002_features.sql` are run in the SQL editor, and the `cloudsync` bucket is private.
- **Design questions?** Refer to the Hallmark floor and Apple HIG links above.

---

<p align="center">
  <strong>CloudSync — Every file, in one calm place.</strong><br />
  <a href="https://vercel.com"><img src="https://vercel.com/opengraph-card.vercel.dev.svg" alt="Deploy to Vercel" /></a>
</p>