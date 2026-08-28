import { useEffect, useState } from 'react'
import { CmsProvider, useCms, loadLocalOverrides } from '../cms/CmsProvider'
import { validateContent, type CmsContent } from '../cms/schema'
import { Site } from '../components/Site'
import { Toolbar } from './panels/Toolbar'
import { SectionsPanel } from './panels/SectionsPanel'
import { Inspector } from './panels/Inspector'
import { SeoBrandPanel } from './panels/SeoBrandPanel'

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
        if (res.status === 404 || res.status === 501) {
          onReady(loadLocalOverrides() ?? (validateContent({}) as CmsContent))
          return
        }
        let message = 'Wrong password. Try again.'
        try {
          const data = (await res.json()) as { error?: string }
          if (res.status === 500 && data.error?.includes('ADMIN_PASSWORD')) {
            message = 'Server has no ADMIN_PASSWORD set — add it in Vercel and redeploy.'
          } else if (data.error) {
            message = data.error
          }
        } catch {
          message = `Login failed (HTTP ${res.status})`
        }
        setError(message)
        return
      }
      const contentRes = await fetch('/api/content', { credentials: 'include' })
      const contentData = await contentRes.json()
      const content = validateContent(contentData?.content)
      if (!content) {
        setError('Saved content is unavailable — starting from defaults.')
        onReady(validateContent({}) as CmsContent)
        return
      }
      onReady(content)
    } catch {
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

function AdminChrome() {
  const cms = useCms()
  const [panel, setPanel] = useState<'none' | 'sections' | 'inspector' | 'seo'>('none')

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
      <Toolbar
        onOpenSections={() => setPanel((p) => (p === 'sections' ? 'none' : 'sections'))}
        onOpenInspector={() => setPanel((p) => (p === 'inspector' ? 'none' : 'inspector'))}
        onOpenSeo={() => setPanel((p) => (p === 'seo' ? 'none' : 'seo'))}
      />
      {panel === 'sections' && <SectionsPanel onClose={() => setPanel('none')} />}
      {panel === 'inspector' && <Inspector onClose={() => setPanel('none')} />}
      {panel === 'seo' && <SeoBrandPanel onClose={() => setPanel('none')} />}
      {cms.dirty && (
        <div className="fixed left-4 top-4 z-[70] rounded-full bg-amber-400/95 px-4 py-1.5 text-xs font-bold text-navy-950 shadow-lift">
          UNSAVED CHANGES
        </div>
      )}
    </div>
  )
}

export default function AdminApp() {
  const [state, setState] = useState<'checking' | 'login' | 'ready'>('checking')
  const [initial, setInitial] = useState<CmsContent | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/content', { credentials: 'include' })
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as { authed?: boolean; content?: unknown }
        if (cancelled) return
        const content = validateContent(data?.content)
        if (data?.authed && content) {
          setInitial(content)
          setState('ready')
        } else {
          setState('login')
        }
      } catch {
        if (!cancelled) setState('login')
      }
    }
    void load()
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
    )
  }

  return (
    <CmsProvider edit initialContent={initial ?? undefined}>
      <AdminChrome />
    </CmsProvider>
  )
}
