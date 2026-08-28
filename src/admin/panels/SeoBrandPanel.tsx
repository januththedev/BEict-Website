import { useCms } from '../../cms/CmsProvider'
import { CloseIcon } from '../../components/Icons'
import { UploadButton } from './UploadButton'

export function SeoBrandPanel({ onClose }: { onClose: () => void }) {
  const cms = useCms()
  const site = cms.c.site

  return (
    <aside className="fixed right-0 top-0 z-[80] flex h-full w-96 flex-col border-l border-slate-200 bg-white shadow-lift">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">SEO &amp; Brand</h2>
        <button type="button" onClick={onClose} aria-label="Close SEO & brand panel" className="rounded-lg p-1 hover:bg-slate-100">
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <p className="mb-4 text-xs leading-relaxed text-slate-body">
          These update the browser tab title, search-engine description, social-share image, and the favicon — live on the published site, no rebuild required.
        </p>

        <label className="mb-4 block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-body">Site title (browser tab)</span>
          <input
            type="text"
            value={site.seoTitle}
            onChange={(e) => cms.set('site.seoTitle', e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-body">Site description (meta + social)</span>
          <textarea
            value={site.seoDescription}
            rows={3}
            onChange={(e) => cms.set('site.seoDescription', e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <span className="mt-0.5 block text-[10px] text-slate-body">{site.seoDescription.length} / 500</span>
        </label>

        <div className="mb-4 rounded-xl border border-slate-100 bg-ice p-3">
          <label className="mb-2 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-body">Favicon URL</span>
            <input
              type="text"
              value={site.seoFaviconUrl}
              inputMode="url"
              onChange={(e) => cms.set('site.seoFaviconUrl', e.target.value)}
              placeholder="https://… or /favicon.ico"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <span className="mt-0.5 block text-[10px] text-slate-body">.png or .ico · appears next to the browser tab title</span>
          </label>
          <UploadButton
            accept="image/png,image/x-icon,image/vnd.microsoft.icon"
            label="Upload favicon (PNG or ICO)"
            fieldKey="favicon"
            disabled={!site.seoFaviconUrl}
            onUploaded={(url) => cms.set('site.seoFaviconUrl', url)}
          />
          {site.seoFaviconUrl && (
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <img src={site.seoFaviconUrl} alt="favicon preview" className="h-8 w-8 rounded" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">{site.seoTitle || 'BEICT'}</p>
                <p className="truncate text-[10px] text-slate-body">in browser tab</p>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 rounded-xl border border-slate-100 bg-ice p-3">
          <label className="mb-2 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-body">Social share image (Open Graph)</span>
            <input
              type="text"
              value={site.seoOgImageUrl}
              inputMode="url"
              onChange={(e) => cms.set('site.seoOgImageUrl', e.target.value)}
              placeholder="https://… or /og-image.svg"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <span className="mt-0.5 block text-[10px] text-slate-body">1200×630 recommended · shown when the site is shared on Facebook / WhatsApp / etc.</span>
          </label>
          <UploadButton
            accept="image/png,image/jpeg,image/webp"
            label="Upload OG image"
            fieldKey="og"
            disabled={!site.seoOgImageUrl}
            onUploaded={(url) => cms.set('site.seoOgImageUrl', url)}
          />
          {site.seoOgImageUrl && (
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img src={site.seoOgImageUrl} alt="og:image preview" className="aspect-[1200/630] w-full object-cover" />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 bg-ice p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-body">Latest lessons feed</p>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={Boolean(site.ytAutoSync)}
              onChange={(e) => cms.set('site.ytAutoSync', e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--color-brand-600)]"
            />
            <span>
              <span className="block text-sm font-semibold text-ink">Auto-update from YouTube</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-slate-body">
                When on, the latest 6 lessons refresh automatically from YouTube every 6 hours — no admin needed. Turn off to manage the lesson list manually.
              </span>
            </span>
          </label>
          {site.ytLastSyncAt && (
            <p className="mt-2 text-[10px] text-slate-body">Last sync: {new Date(site.ytLastSyncAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </aside>
  )
}
