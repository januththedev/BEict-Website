# BEICT CMS — click-to-edit admin

A Wix-style **structured** CMS: go to `/admin`, sign in, click any text on the real page
to edit it, add/remove cards and videos, swap icons, upload images, reorder or hide
sections — then hit **Publish** and the changes are live within seconds.

The layout system itself is **locked**: you edit and add/remove *content* inside the
designed sections, but nothing can be dragged into broken positions, no HTML/code
editing exists, and the server rejects any payload that tries to alter the structure.

## One-time Vercel setup

1. **Deploy the project to Vercel** (framework: Vite — auto-detected).
2. **Neon (database)** — create a project at [neon.tech](https://neon.tech), copy the
   **pooled connection string**, and add it as env var `DATABASE_URL`.
   The CMS tables (`cms_content`, `cms_login_throttle`) auto-create on first publish —
   or run `cms.sql` manually. This is the content database and powers persistent
   login throttling.
3. **Vercel Blob (media store)** — Dashboard → **Storage** → *Create Database* →
   **Blob** → connect it to this project. This injects `BLOB_READ_WRITE_TOKEN`;
   it stores uploaded images.
4. Dashboard → **Settings** → **Environment Variables** → add:
   | Name | Value |
   |---|---|
   | `ADMIN_PASSWORD` | your admin password |
   | `CMS_SESSION_SECRET` | any long random string |
   | `DATABASE_URL` | your Neon pooled connection string |
5. **Redeploy** (Deployments → ⋯ → Redeploy) so the new env vars apply.

That's it — open `https://<your-domain>/admin`, sign in, edit, **Publish**.

### Storage precedence (graceful degradation)

| `DATABASE_URL` set? | `BLOB token` set? | Content stored in | Images |
|---|---|---|---|
| ✅ | ✅ | **Neon Postgres** | Vercel Blob |
| ❌ | ✅ | Vercel Blob (`cms/content.json`) | Vercel Blob |
| ❌ | ❌ | localStorage (local dev only) | inline data URLs |

## What's editable

- **Text**: every heading, paragraph, card, button label, nav item, form label, footer line.
- **Lists** (add ⧉ duplicate ✕ delete ↑↓ reorder): batch cards, LMS point cards, banner
  cards, community stats, lesson videos, about facts.
- **Icons**: any icon slot opens a picker (16 icons).
- **Images**: banner images upload to Vercel Blob (png/jpg/webp/gif/svg, ≤5 MB).
- **Links**: button/card/social/phone/WhatsApp/LMS targets (scheme-whitelisted).
- **Sections**: show/hide + reorder via the *Sections* panel; hidden sections keep their
  content (nothing is destroyed). Per-section ↺ resets to the original content.

## How it works

- Content lives as one validated JSON document in **Neon Postgres** (`cms_content`,
  jsonb) when `DATABASE_URL` is set; otherwise it falls back to Vercel Blob
  (`cms/content.json`).
- `GET /api/content` — public; returns `{ authed, content }` (edge-cached ~15 s, so
  published edits appear within seconds).
- `PUT /api/content` — admin-only; validates the payload against `src/cms/schema.ts`
  (unknown fields dropped, URL schemes whitelisted, counts capped) before writing.
- `POST /api/login` — compares against `ADMIN_PASSWORD` server-side (timing-safe),
  sets a signed HttpOnly session cookie (7 days). Login throttling is persistent in
  Neon (10 attempts / 10 min per IP) when the database is configured.
- `POST /api/upload` — admin-only image upload to Blob.

## Local development

Without Vercel env vars the admin still works: content changes persist to
`localStorage` and image uploads fall back to inline data URLs (≤800 KB).
`npm run dev` → `http://localhost:5173/admin` → sign in with any password.

## Files

- `src/cms/schema.ts` — content model, defaults, validation (the "lock")
- `src/cms/CmsProvider.tsx` — state, path get/set, list/section ops, publish
- `src/cms/edit.tsx` — `<T>` inline text, `EditableImage`, `EditableIcon`, item controls
- `src/admin/AdminApp.tsx` — login, toolbar, sections panel, fields panel
- `src/cms/server/db.ts` — Neon access + auto-migration + login throttle
- `api/*.ts` — Vercel functions (login/logout/content/upload)
- `cms.sql` — reference schema for the two Neon tables
