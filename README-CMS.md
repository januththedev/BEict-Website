# BEICT CMS — click-to-edit admin

A Wix-style **structured** CMS: go to `/admin`, sign in, click any text on the real page
to edit it, add/remove cards and videos, swap icons, upload images, reorder or hide
sections — then hit **Publish** and the changes are live within seconds.

The layout system itself is **locked**: you edit and add/remove *content* inside the
designed sections, but nothing can be dragged into broken positions, no HTML/code
editing exists, and the server rejects any payload that tries to alter the structure.

## One-time Vercel setup

1. **Deploy the project to Vercel** (framework: Vite — auto-detected).
2. Dashboard → **Storage** → *Create Database* → **Blob** → connect it to this project.
   This injects `BLOB_READ_WRITE_TOKEN`.
3. Dashboard → **Settings** → **Environment Variables** → add:
   | Name | Value |
   |---|---|
   | `ADMIN_PASSWORD` | your admin password |
   | `CMS_SESSION_SECRET` | any long random string |
4. **Redeploy** (Deployments → ⋯ → Redeploy) so the new env vars apply.

That's it — open `https://<your-domain>/admin`, sign in, edit, **Publish**.

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

- Content lives as one validated JSON document in Vercel Blob (`cms/content.json`).
- `GET /api/content` — public; returns `{ authed, content }` (edge-cached ~15 s, so
  published edits appear within seconds).
- `PUT /api/content` — admin-only; validates the payload against `src/cms/schema.ts`
  (unknown fields dropped, URL schemes whitelisted, counts capped) before writing.
- `POST /api/login` — compares against `ADMIN_PASSWORD` server-side (timing-safe),
  sets a signed HttpOnly session cookie (7 days). Basic per-IP rate limiting.
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
- `api/*.ts` — Vercel functions (login/logout/content/upload)
