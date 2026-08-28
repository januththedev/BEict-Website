import { useState } from 'react'
import { useCms } from '../../cms/CmsProvider'
import { ArrowUpRightIcon } from '../../components/Icons'

export function Toolbar({
  onOpenSections,
  onOpenInspector,
  onOpenSeo,
}: {
  onOpenSections: () => void
  onOpenInspector: () => void
  onOpenSeo: () => void
}) {
  const cms = useCms()
  const [msg, setMsg] = useState<string | null>(null)

  const onPublish = async () => {
    const ok = await cms.publish()
    setMsg(ok ? 'Published — live on the site' : 'Publish failed — session expired?')
    setTimeout(() => setMsg(null), 3000)
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-[70] -translate-x-1/2">
      <div className="flex items-center gap-1.5 rounded-full border border-white/60 bg-navy-950/90 px-3 py-2 text-xs font-semibold text-white shadow-lift backdrop-blur-xl">
        <span className="flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
          EDIT MODE
        </span>
        {cms.dirty && <span className="px-1 text-amber-300">● unsaved</span>}
        {cms.saved && !cms.dirty && <span className="px-1 text-emerald-300">published ✓</span>}
        <button type="button" onClick={onOpenInspector} className="rounded-full px-2.5 py-1 hover:bg-white/10">
          Fields
        </button>
        <button type="button" onClick={onOpenSections} className="rounded-full px-2.5 py-1 hover:bg-white/10">
          Sections
        </button>
        <button type="button" onClick={onOpenSeo} className="rounded-full px-2.5 py-1 hover:bg-white/10">
          SEO & Brand
        </button>
        <button
          type="button"
          disabled={!cms.dirty || cms.saving}
          onClick={onPublish}
          className="rounded-full bg-emerald-500 px-3 py-1 text-navy-950 transition-colors hover:bg-emerald-400 disabled:opacity-40"
        >
          {cms.saving ? 'Publishing…' : 'Publish'}
        </button>
        <button
          type="button"
          disabled={!cms.dirty}
          onClick={() => {
            if (window.confirm('Discard all unsaved changes?')) cms.discard()
          }}
          className="rounded-full px-2.5 py-1 hover:bg-white/10 disabled:opacity-40"
        >
          Discard
        </button>
        <a href="/" className="flex items-center gap-0.5 rounded-full px-2.5 py-1 hover:bg-white/10">
          View site <ArrowUpRightIcon className="h-3 w-3" />
        </a>
        <button type="button" onClick={() => cms.logout()} className="rounded-full px-2.5 py-1 text-brand-200 hover:bg-white/10">
          Logout
        </button>
        {msg && (
          <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-navy-950 shadow-lift">
            {msg}
          </span>
        )}
      </div>
    </div>
  )
}
