import { useEffect, useState } from 'react'
import { CmsProvider, useCms, getPath, loadLocalOverrides } from '../cms/CmsProvider'
import { validateContent, type CmsContent, type SectionId } from '../cms/schema'
import { IconByName, ICON_REGISTRY, ArrowUpRightIcon, CloseIcon } from '../components/Icons'
import type { IconName } from '../components/Icons'
import { Site } from '../components/Site'

const SECTION_LABELS: Record<SectionId, string> = {
  hero: 'Hero',
  about: 'About',
  batches: 'Batches',
  lms: 'Online Learning',
  promos: 'Banners',
  community: 'Community',
  contact: 'Contact',
}

// ---------- login ----------

function LoginScreen({ onReady }: { onReady: (content: CmsContent) => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        // No API in this environment (local dev) — accept anything, use local data.
        if (res.status === 404 || res.status === 501) {
          onReady(loadLocalOverrides() ?? (validateContent({}) as CmsContent))
          return
        }
        let message = 'Wrong password. Try again.'
        try {
          const data = (await res.json()) as { error?: string }
          if (data.error) message = data.error
        } catch {
          /* keep default message */
        }
        setError(message)
        return
      }
      const data = await fetch('/api/content', { credentials: 'include' }).then((r) => r.json())
      const content = validateContent(data?.content)
      if (!content) {
        setError('Saved content is unavailable — starting from defaults.')
        onReady(validateContent({}) as CmsContent)
        return
      }
      onReady(content)
    } catch {
      // API unreachable — local dev mode.
      onReady(loadLocalOverrides() ?? (validateContent({}) as CmsContent))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ice px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-white/60 bg-white/70 p-8 shadow-lift backdrop-blur-2xl">
        <h1 className="font-display text-2xl font-bold text-ink">BEICT Admin</h1>
        <p className="mt-1 text-sm text-slate-body">Enter the admin password to edit the site.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          autoFocus
          className="mt-5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-4 w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white shadow-card transition-all hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? 'Checking…' : 'Sign in'}
        </button>
        <a href="/" className="mt-4 block text-center text-xs font-medium text-slate-body hover:text-brand-700">
          ← Back to the site
        </a>
      </form>
    </div>
  )
}

// ---------- toolbar ----------

function Toolbar({ onOpenSections, onOpenInspector }: { onOpenSections: () => void; onOpenInspector: () => void }) {
  const cms = useCms()
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <div className="fixed bottom-4 left-1/2 z-[70] -translate-x-1/2">
      <div className="flex items-center gap-1.5 rounded-full border border-white/60 bg-navy-950/90 px-3 py-2 text-xs font-semibold text-white shadow-lift backdrop-blur-xl">
        <span className="flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
          EDIT MODE
        </span>
        {cms.dirty && <span className="px-1 text-amber-300">● {cms.dirty ? 'unsaved' : ''}</span>}
        {cms.saved && !cms.dirty && <span className="px-1 text-emerald-300">published ✓</span>}
        <button type="button" onClick={onOpenInspector} className="rounded-full px-2.5 py-1 hover:bg-white/10">
          Fields
        </button>
        <button type="button" onClick={onOpenSections} className="rounded-full px-2.5 py-1 hover:bg-white/10">
          Sections
        </button>
        <button
          type="button"
          disabled={!cms.dirty || cms.saving}
          onClick={async () => {
            const ok = await cms.publish()
            setMsg(ok ? 'Published — live on the site' : 'Publish failed — session expired?')
            setTimeout(() => setMsg(null), 3000)
          }}
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

// ---------- sections panel ----------

function SectionsPanel({ onClose }: { onClose: () => void }) {
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

// ---------- inspector (generic field editor) ----------

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

function Inspector({ onClose }: { onClose: () => void }) {
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

// ---------- root ----------

export default function AdminApp() {
  const [state, setState] = useState<'checking' | 'login' | 'ready'>('checking')
  const [initial, setInitial] = useState<CmsContent | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/content', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        const content = validateContent(data?.content)
        if (data?.authed && content) {
          setInitial(content)
          setState('ready')
        } else {
          setState('login')
        }
      })
      .catch(() => {
        // No API (local dev) — allow local editing with localStorage persistence.
        if (!cancelled) setState('login')
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (state === 'checking') return null

  if (state === 'login') {
    return (
      <LoginScreen
        onReady={(content) => {
          setInitial(content)
          setState('ready')
        }}
      />
    )}

  return (
    <CmsProvider edit initialContent={initial ?? undefined}>
      <AdminChrome />
    </CmsProvider>
  )
}

function AdminChrome() {
  const cms = useCms()
  const [panel, setPanel] = useState<'none' | 'sections' | 'inspector'>('none')

  useEffect(() => {
    document.body.classList.add('edit-on')
    return () => document.body.classList.remove('edit-on')
  }, [])

  useEffect(() => {
    if (cms.selected) setPanel('inspector')
  }, [cms.selected])

  return (
    <div className="pb-24">
      <Site />
      <Toolbar onOpenSections={() => setPanel((p) => (p === 'sections' ? 'none' : 'sections'))} onOpenInspector={() => setPanel((p) => (p === 'inspector' ? 'none' : 'inspector'))} />
      {panel === 'sections' && <SectionsPanel onClose={() => setPanel('none')} />}
      {panel === 'inspector' && <Inspector onClose={() => setPanel('none')} />}
      {cms.dirty && (
        <div className="fixed left-4 top-4 z-[70] rounded-full bg-amber-400/95 px-4 py-1.5 text-xs font-bold text-navy-950 shadow-lift">
          UNSAVED CHANGES
        </div>
      )}
    </div>
  )
}
