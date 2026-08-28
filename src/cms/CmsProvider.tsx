/**
 * CMS state provider.
 *
 * Public site: loads saved overrides (GET /api/content) and merges them over
 * the defaults — render output is identical when no overrides exist.
 * Admin (/admin): same provider with edit mode enabled; exposes path-based
 * get/set, list operations (add/remove/duplicate/move), section visibility
 * and ordering, dirty tracking, and publish.
 *
 * Fallbacks: when the API is unavailable (local dev without Vercel), overrides
 * persist to localStorage so the whole admin flow still works.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { defaultContent, validateContent, LIMITS, type CmsContent, type SectionId } from './schema'

const LS_KEY = 'beict-cms-overrides-v2'

// ---------- tiny path utils ----------

export function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => {
    if (acc === null || acc === undefined) return undefined
    return (acc as Record<string, unknown>)[k]
  }, obj)
}

export function setPath(obj: any, path: string, value: unknown): void {
  const keys = path.split('.')
  let cur: any = obj
  for (let i = 0; i < keys.length - 1; i++) {
    cur = cur[keys[i]]
    if (cur === undefined || cur === null) return
  }
  cur[keys[keys.length - 1]] = value
}

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

// ---------- context ----------

export interface ListOps {
  add(path: string, template: Record<string, unknown>): void
  remove(path: string): void
  duplicate(path: string): void
  move(path: string, dir: -1 | 1): void
}

export interface CmsApi {
  c: CmsContent
  edit: boolean
  dirty: boolean
  saving: boolean
  saved: boolean
  authed: boolean
  selected: string | null
  select(path: string | null): void
  get(path: string): string
  set(path: string, value: unknown): void
  list: ListOps
  sectionVisible(id: SectionId): boolean
  setSectionVisible(id: SectionId, visible: boolean): void
  moveSection(id: SectionId, dir: -1 | 1): void
  sectionOrder: SectionId[]
  publish(): Promise<boolean>
  discard(): void
  resetSection(id: SectionId): void
  login(password: string): Promise<boolean>
  logout(): Promise<void>
}

const CmsContext = createContext<CmsApi | null>(null)

export function useCms(): CmsApi {
  const ctx = useContext(CmsContext)
  if (!ctx) throw new Error('useCms must be used inside <CmsProvider>')
  return ctx
}

interface ProviderProps {
  children: ReactNode
  /** Admin mode: enables editing + auth-gated toolbar (handled by caller). */
  edit?: boolean
  /** Initial content (admin passes the fetched server content). */
  initialContent?: CmsContent
  onAuthFailed?: () => void
}

export function CmsProvider({ children, edit = false, initialContent, onAuthFailed }: ProviderProps) {
  const [c, setC] = useState<CmsContent>(() => deepClone(initialContent ?? defaultContent))
  const [savedContent, setSavedContent] = useState<CmsContent>(() => deepClone(initialContent ?? defaultContent))
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [authed, setAuthed] = useState(Boolean(initialContent))
  const [selected, setSelected] = useState<string | null>(null)
  const editRef = useRef(edit)
  editRef.current = edit

  // Public site: fetch saved overrides once. If the API doesn't exist
  // (local dev without Vercel), fall back to localStorage overrides.
  useEffect(() => {
    if (edit || initialContent) return
    let cancelled = false
    fetch('/api/content', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) throw new Error('no api')
        return r.json()
      })
      .then((data) => {
        if (cancelled || !data) return
        const valid = validateContent(data.content)
        if (valid) {
          setC(valid)
          setSavedContent(deepClone(valid))
        }
        setAuthed(Boolean(data.authed))
      })
      .catch(() => {
        if (cancelled) return
        const local = loadLocalOverrides()
        if (local) {
          setC(local)
          setSavedContent(deepClone(local))
        }
      })
    return () => {
      cancelled = true
    }
  }, [edit, initialContent])

  // Public site: probe YouTube for the live state of the most-recent video.
  // Merges the result into the in-memory videos array so the LiveHero can
  // appear within ~2 minutes of a stream starting, independent of the
  // 6-hour cron that refreshes the underlying video list. Fail-soft: any
  // network or quota error is a no-op and the page falls back to the
  // saved `liveBroadcastContent` value (which the cron may have set
  // earlier).
  useEffect(() => {
    if (edit || initialContent) return
    let cancelled = false
    fetch('/api/youtube-live', { credentials: 'omit' })
      .then(async (r) => {
        if (!r.ok) return null
        return (await r.json()) as {
          id?: string
          liveBroadcastContent?: 'live' | 'upcoming' | 'none'
          concurrentViewers?: number
        }
      })
      .then((probe) => {
        if (cancelled || !probe || !probe.id) return
        setC((prev) => {
          const videos = prev.community?.videos
          if (!videos || videos.length === 0) return prev
          const idx = videos.findIndex((v) => v.url.includes(probe.id!))
          if (idx === -1) return prev
          const current = videos[idx]
          const nextLbc = probe.liveBroadcastContent ?? current.liveBroadcastContent
          const nextCv = probe.concurrentViewers ?? current.concurrentViewers
          if (current.liveBroadcastContent === nextLbc && current.concurrentViewers === nextCv) return prev
          const draft = deepClone(prev)
          const target = draft.community.videos[idx]
          target.liveBroadcastContent = nextLbc
          target.concurrentViewers = nextCv
          // Promote the live item to position 0 so the LiveHero picks it up.
          if (nextLbc === 'live' && idx !== 0) {
            const [item] = draft.community.videos.splice(idx, 1)
            draft.community.videos.unshift(item)
          }
          return draft
        })
      })
      .catch(() => {
        /* probe is best-effort — saved value stands */
      })
    return () => {
      cancelled = true
    }
  }, [edit, initialContent])

  const get = useCallback((path: string) => String(getPath(c, path) ?? ''), [c])

  const mutate = useCallback((fn: (draft: CmsContent) => void) => {
    setC((prev) => {
      const draft = deepClone(prev)
      fn(draft)
      return draft
    })
    setDirty(true)
    setSaved(false)
  }, [])

  const set = useCallback(
    (path: string, value: unknown) => {
      mutate((draft) => setPath(draft, path, value))
    },
    [mutate],
  )

  const splitListPath = (path: string): { arrPath: string; index: number } | null => {
    const m = path.match(/^(.*)\.(\d+)$/)
    if (!m) return null
    return { arrPath: m[1], index: Number(m[2]) }
  }

  const list = useMemo<ListOps>(
    () => ({
      add(path, template) {
        mutate((draft) => {
          const target = getPath(draft, path)
          if (!Array.isArray(target) || target.length >= LIMITS.batchCards.max * 2) return
          target.push(deepClone(template))
        })
      },
      remove(path) {
        const sp = splitListPath(path)
        if (!sp) return
        mutate((draft) => {
          const target = getPath(draft, sp.arrPath)
          if (!Array.isArray(target) || target.length <= 1) return // never empty a list to zero
          target.splice(sp.index, 1)
        })
      },
      duplicate(path) {
        const sp = splitListPath(path)
        if (!sp) return
        mutate((draft) => {
          const target = getPath(draft, sp.arrPath) as unknown[]
          if (!Array.isArray(target) || target.length >= LIMITS.batchCards.max * 2) return
          target.splice(sp.index + 1, 0, deepClone(target[sp.index]))
        })
      },
      move(path, dir) {
        const sp = splitListPath(path)
        if (!sp) return
        mutate((draft) => {
          const target = getPath(draft, sp.arrPath) as unknown[]
          if (!Array.isArray(target)) return
          const to = sp.index + dir
          if (to < 0 || to >= target.length) return
          const [item] = target.splice(sp.index, 1)
          target.splice(to, 0, item)
        })
      },
    }),
    [mutate],
  )

  const sectionOrder = useMemo<SectionId[]>(
    () => (Object.keys(c.sections) as SectionId[]),
    [c.sections],
  )

  const sectionVisible = useCallback((id: SectionId) => c.sections[id]?.visible ?? true, [c.sections])

  const setSectionVisible = useCallback(
    (id: SectionId, visible: boolean) => {
      mutate((draft) => {
        draft.sections[id].visible = visible
      })
    },
    [mutate],
  )

  const moveSection = useCallback(
    (id: SectionId, dir: -1 | 1) => {
      mutate((draft) => {
        const keys = Object.keys(draft.sections) as SectionId[]
        const i = keys.indexOf(id)
        const to = i + dir
        if (i < 0 || to < 0 || to >= keys.length) return
        const entries = Object.entries(draft.sections) as [SectionId, { visible: boolean }][]
        const [item] = entries.splice(i, 1)
        entries.splice(to, 0, item)
        draft.sections = Object.fromEntries(entries) as CmsContent['sections']
      })
    },
    [mutate],
  )

  const publish = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: c }),
      })
      if (res.status === 401) {
        setAuthed(false)
        onAuthFailed?.()
        return false
      }
      if (!res.ok) {
        // No API in this environment (local dev) — persist locally instead.
        saveLocalOverrides(c)
        setSavedContent(deepClone(c))
        setDirty(false)
        setSaved(true)
        return true
      }
      const valid = validateContent(c)
      if (valid) setSavedContent(deepClone(valid))
      setDirty(false)
      setSaved(true)
      return true
    } catch {
      saveLocalOverrides(c)
      setSavedContent(deepClone(c))
      setDirty(false)
      setSaved(true)
      return true
    } finally {
      setSaving(false)
    }
  }, [c, onAuthFailed])

  const discard = useCallback(() => {
    setC(deepClone(savedContent))
    setDirty(false)
    setSelected(null)
  }, [savedContent])

  const resetSection = useCallback(
    (id: SectionId) => {
      mutate((draft) => {
        ;(draft as any)[id] = deepClone((defaultContent as any)[id])
        draft.sections[id] = { visible: true }
      })
    },
    [mutate],
  )

  const login = useCallback(async (password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) return false
      setAuthed(true)
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    setAuthed(false)
    window.location.href = '/'
  }, [])

  const api: CmsApi = {
    c,
    edit,
    dirty: edit && (dirty || JSON.stringify(c) !== JSON.stringify(savedContent)),
    saving,
    saved,
    authed,
    selected,
    select: setSelected,
    get,
    set,
    list,
    sectionVisible,
    setSectionVisible,
    moveSection,
    sectionOrder,
    publish,
    discard,
    resetSection,
    login,
    logout,
  }

  // Warn before leaving with unsaved changes (admin only)
  useEffect(() => {
    if (!edit || !dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [edit, dirty])

  return <CmsContext.Provider value={api}>{children}</CmsContext.Provider>
}

/** Load overrides from localStorage when the API isn't available (local dev). */
export function loadLocalOverrides(): CmsContent | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return validateContent(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveLocalOverrides(content: CmsContent): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(content))
  } catch {
    /* storage full — ignore */
  }
}

export { deepClone, LIMITS }
