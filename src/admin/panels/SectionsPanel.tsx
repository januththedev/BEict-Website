import { useCms } from '../../cms/CmsProvider'
import type { SectionId } from '../../cms/schema'
import { CloseIcon } from '../../components/Icons'

const SECTION_LABELS: Record<SectionId, string> = {
  hero: 'Hero',
  about: 'About',
  batches: 'Batches',
  lms: 'Online Learning',
  promos: 'Banners',
  community: 'Community',
  contact: 'Contact',
}

export function SectionsPanel({ onClose }: { onClose: () => void }) {
  const cms = useCms()
  return (
    <aside className="fixed right-0 top-0 z-[80] flex h-full w-80 flex-col border-l border-slate-200 bg-white shadow-lift">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Sections</h2>
        <button type="button" onClick={onClose} aria-label="Close sections panel" className="rounded-lg p-1 hover:bg-slate-100">
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-xs leading-relaxed text-slate-body">
          Toggle visibility or reorder sections. Hidden sections keep their content — nothing is deleted.
        </p>
        {cms.sectionOrder.map((id, i) => (
          <div key={id} className="mb-2 flex items-center justify-between rounded-xl border border-slate-100 bg-ice px-3 py-2.5">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={cms.sectionVisible(id)}
                onChange={(e) => cms.setSectionVisible(id, e.target.checked)}
                className="h-4 w-4 accent-[var(--color-brand-600)]"
              />
              {SECTION_LABELS[id]}
            </label>
            <span className="flex gap-1">
              <button
                type="button"
                title="Move up"
                disabled={i === 0}
                onClick={() => cms.moveSection(id, -1)}
                className="rounded-md px-2 py-0.5 text-xs hover:bg-white disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                title="Move down"
                disabled={i === cms.sectionOrder.length - 1}
                onClick={() => cms.moveSection(id, 1)}
                className="rounded-md px-2 py-0.5 text-xs hover:bg-white disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                title="Reset this section to defaults"
                onClick={() => {
                  if (window.confirm(`Reset "${SECTION_LABELS[id]}" to the original content?`)) cms.resetSection(id)
                }}
                className="rounded-md px-2 py-0.5 text-xs hover:bg-white"
              >
                ↺
              </button>
            </span>
          </div>
        ))}
      </div>
    </aside>
  )
}
