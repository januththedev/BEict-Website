import { useCms, getPath } from '../../cms/CmsProvider'
import { IconByName, ICON_REGISTRY, CloseIcon } from '../../components/Icons'
import type { IconName } from '../../components/Icons'

function FieldRow({ path, value }: { path: string; value: unknown }) {
  const cms = useCms()
  const key = path.split('.').pop() ?? ''
  const isLong = typeof value === 'string' && value.length > 60
  const isUrl = /href|url|link|image|thumb/i.test(key)
  const isIcon = key === 'icon'
  const isNum = typeof value === 'number'

  if (isIcon) {
    return (
      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-body">icon</span>
        <span className="flex flex-wrap gap-1">
          {(Object.keys(ICON_REGISTRY) as IconName[]).map((name) => (
            <button
              key={name}
              type="button"
              title={ICON_REGISTRY[name].label}
              onClick={() => cms.set(path, name)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                value === name ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 text-slate-body hover:bg-brand-50'
              }`}
            >
              <IconByName name={name} className="h-4 w-4" />
            </button>
          ))}
        </span>
      </label>
    )
  }

  if (isNum) {
    return (
      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-body">{key} (number)</span>
        <input
          type="number"
          value={Number(value)}
          onChange={(e) => cms.set(path, Number(e.target.value))}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </label>
    )
  }

  if (typeof value !== 'string') return null

  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-body">{key}</span>
      {isLong || key === 'body' || key.includes('lede') || key.includes('blurb') || key.includes('P1') || key.includes('P2') || key.includes('desc') || key.includes('note') ? (
        <textarea
          value={value}
          rows={3}
          onChange={(e) => cms.set(path, e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => cms.set(path, e.target.value)}
          inputMode={isUrl ? 'url' : undefined}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      )}
      {isUrl && <span className="mt-0.5 block text-[10px] text-slate-body">https:// · tel: · mailto: links only</span>}
    </label>
  )
}

export function Inspector({ onClose }: { onClose: () => void }) {
  const cms = useCms()
  const sel = cms.selected
  const item = sel ? (getPath(cms.c, sel) as Record<string, unknown> | undefined) : undefined

  return (
    <aside className="fixed right-0 top-0 z-[80] flex h-full w-80 flex-col border-l border-slate-200 bg-white shadow-lift">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Fields</h2>
        <button type="button" onClick={onClose} aria-label="Close fields panel" className="rounded-lg p-1 hover:bg-slate-100">
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {!sel && (
          <p className="text-xs leading-relaxed text-slate-body">
            Click any text on the page to edit it inline and select it here. Items (cards, videos, stats…) show all
            of their fields in this panel — including links, icons and images.
          </p>
        )}
        {sel && !item && <p className="text-xs text-slate-body">Nothing selected.</p>}
        {sel &&
          item &&
          typeof item === 'object' &&
          Object.entries(item).map(([k, v]) =>
            typeof v === 'object' && v !== null && !Array.isArray(v) ? (
              <div key={k} className="mb-4 rounded-xl border border-slate-100 bg-ice p-3">
                <p className="mb-2 font-display text-xs font-bold uppercase tracking-wide text-ink">{k}</p>
                <div className="grid gap-3">
                  {Object.entries(v as Record<string, unknown>).map(([k2, v2]) =>
                    typeof v2 !== 'object' ? <FieldRow key={k2} path={`${sel}.${k}.${k2}`} value={v2} /> : null,
                  )}
                </div>
              </div>
            ) : Array.isArray(v) ? (
              <p key={k} className="mb-3 text-[11px] text-slate-body">
                “{k}” list — use the ↑ ↓ ⧉ ✕ controls on the page.
              </p>
            ) : (
              <div key={k} className="mb-3">
                <FieldRow path={`${sel}.${k}`} value={v} />
              </div>
            ),
          )}
        {sel && item && (
          <button
            type="button"
            onClick={() => cms.select(null)}
            className="mt-2 w-full rounded-full border border-slate-200 py-2 text-xs font-semibold text-slate-body hover:bg-slate-50"
          >
            Deselect
          </button>
        )}
      </div>
    </aside>
  )
}
