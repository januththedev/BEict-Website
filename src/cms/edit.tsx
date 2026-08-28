/**
 * CMS editing primitives. On the public site these render as plain elements;
 * in admin edit mode they add click-to-select, inline contentEditable text
 * editing, image uploads, per-item controls and section visibility gates.
 */
import { useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { useCms } from './CmsProvider'
import { IconByName, ICON_REGISTRY, LinkIcon, UnlinkIcon, ExternalLinkIcon } from '../components/Icons'
import type { IconName } from '../components/Icons'
import type { SectionId } from './schema'

const TEXT_TAGS = ['span', 'p', 'h1', 'h2', 'h3', 'h4', 'dt', 'dd', 'label'] as const
type TextTag = (typeof TEXT_TAGS)[number]

function selectEnd(el: HTMLElement): void {
  el.focus()
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

/** Path-based text. Click-to-edit inline in admin edit mode. */
export function T({
  p,
  as = 'span',
  className = '',
  multiline = false,
  item,
  id,
}: {
  p: string
  as?: TextTag
  className?: string
  multiline?: boolean
  /** Selecting this text also selects the parent item in the inspector. */
  item?: string
  id?: string
}) {
  const cms = useCms()
  const value = cms.get(p)
  const ref = useRef<HTMLElement | null>(null)
  const [editing, setEditing] = useState(false)
  const Tag = as as 'span'

  if (!cms.edit) {
    return (
      <Tag className={className} style={multiline ? { whiteSpace: 'pre-line' } : undefined}>
        {value}
      </Tag>
    )
  }

  const selected = cms.selected === p || (item ? cms.selected === item : false)

  const commit = () => {
    if (ref.current) cms.set(p, ref.current.innerText.replace(/\u00a0/g, ' ').replace(/\n{3,}/g, '\n\n'))
    setEditing(false)
  }

  return (
    <Tag
      ref={ref as never}
      id={id}
      data-cms={p}
      title={p}
      className={`${className} cms-editable ${selected ? 'cms-selected' : ''} ${editing ? 'cms-editing' : ''}`.trim()}
      style={multiline ? ({ whiteSpace: 'pre-line' } as CSSProperties) : undefined}
      contentEditable={editing}
      suppressContentEditableWarning
      spellCheck={editing}
      onClick={(e: MouseEvent) => {
        e.stopPropagation()
        cms.select(item ?? p)
        if (!editing) {
          setEditing(true)
          requestAnimationFrame(() => selectEnd(ref.current!))
        }
      }}
      onBlur={() => commit()}
      onKeyDown={(e: KeyboardEvent) => {
        e.stopPropagation()
        if (e.key === 'Escape') {
          if (ref.current) ref.current.innerText = cms.get(p)
          setEditing(false)
          ref.current?.blur()
        } else if (e.key === 'Enter' && !multiline) {
          e.preventDefault()
          commit()
        }
      }}
    >
      {value}
    </Tag>
  )
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

/** Uploads via /api/upload; falls back to a small dataURL in local dev. */
async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  try {
    const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd })
    if (res.ok) {
      const data = (await res.json()) as { url?: string }
      if (data.url) return data.url
    }
    if (res.status !== 404 && res.status !== 501) throw new Error(`upload failed (${res.status})`)
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('upload failed')) throw err
  }
  // dev fallback: inline small images
  if (file.size > 800 * 1024) throw new Error('Local dev fallback allows images up to 800 KB')
  return fileToDataUrl(file)
}

/** Path-based image with upload/replace/reset in edit mode. */
export function EditableImage({
  p,
  src,
  alt,
  className = '',
  item,
  /** Auto-derive a thumbnail from a YouTube/YouTube-short URL when pasted. */
  deriveThumbFromUrl,
}: {
  p: string
  src: string
  alt: string
  className?: string
  item?: string
  deriveThumbFromUrl?: boolean
}) {
  const cms = useCms()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlOpen, setUrlOpen] = useState(false)
  const [urlValue, setUrlValue] = useState('')

  if (!cms.edit) return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />

  const applyUrl = () => {
    const v = urlValue.trim()
    if (!v) return
    let next = v
    if (deriveThumbFromUrl) {
      // Paste a YouTube URL and we use its thumbnail.
      // `cms` carries `extractYouTubeId` via the schema module — re-import dynamically.
      // (Avoids pulling the regex util into the bundle twice.)
      const m = v.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/))([A-Za-z0-9_-]{6,15})/)
      if (m) {
        const id = m[1]
        const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
        // Persist the *thumbnail* to the image path; keep the *url* alongside if a paired field is provided.
        cms.set(p, thumb)
        if (item) {
          // Best-effort: also write the URL into a sibling `url` field on the same item.
          cms.set(`${item}.url`, v)
        }
        setUrlValue('')
        setUrlOpen(false)
        return
      }
    }
    cms.set(p, next)
    setUrlValue('')
    setUrlOpen(false)
  }

  return (
    <span className={`cms-img-wrap ${className}`.trim()}>
      <img src={src} alt={alt} className="w-full" loading="lazy" decoding="async" />
      <span className="cms-img-overlay">
        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation()
            cms.select(item ?? p)
            inputRef.current?.click()
          }}
        >
          {busy ? 'Uploading…' : '⬆ Replace image'}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            cms.select(item ?? p)
            setUrlOpen((v) => !v)
            setUrlValue('')
          }}
        >
          🔗 Paste URL
        </button>
        {cms.get(p) !== '' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              cms.set(p, '')
            }}
          >
            ↺ Reset
          </button>
        ) : null}
      </span>
      {urlOpen && (
        <span className="cms-img-url-pop" onClick={(e) => e.stopPropagation()}>
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                applyUrl()
              } else if (e.key === 'Escape') {
                setUrlOpen(false)
              }
            }}
            placeholder={deriveThumbFromUrl ? 'Paste a YouTube URL — thumbnail auto-derived' : 'https://…'}
            autoFocus
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <span className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={applyUrl}
              className="flex-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setUrlOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
          </span>
        </span>
      )}
      {error && <span className="cms-img-error">{error}</span>}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          setBusy(true)
          setError(null)
          try {
            cms.set(p, await uploadImage(file))
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
          } finally {
            setBusy(false)
          }
        }}
      />
    </span>
  )
}

/** Hover controls for a list item: move up/down, duplicate, delete. */
export function ItemControls({ path, removable = true }: { path: string; removable?: boolean }) {
  const cms = useCms()
  if (!cms.edit) return null
  return (
    <span className="cms-item-controls" contentEditable={false} suppressContentEditableWarning>
      <button type="button" title="Move up" onClick={(e) => { e.stopPropagation(); cms.list.move(path, -1) }}>
        ↑
      </button>
      <button type="button" title="Move down" onClick={(e) => { e.stopPropagation(); cms.list.move(path, 1) }}>
        ↓
      </button>
      <button type="button" title="Duplicate" onClick={(e) => { e.stopPropagation(); cms.list.duplicate(path) }}>
        ⧉
      </button>
      {removable && (
        <button type="button" title="Delete" className="cms-danger" onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this item?')) cms.list.remove(path) }}>
          ✕
        </button>
      )}
    </span>
  )
}

/** "+ Add item" button for a list. */
export function AddItemButton({
  listPath,
  template,
  label,
}: {
  listPath: string
  template: Record<string, unknown>
  label: string
}) {
  const cms = useCms()
  if (!cms.edit) return null
  return (
    <button
      type="button"
      className="cms-add-btn"
      contentEditable={false}
      onClick={(e) => {
        e.stopPropagation()
        cms.list.add(listPath, template)
      }}
    >
      + {label}
    </button>
  )
}

/** Renders children only when the section is visible; ghost card in admin. */
export function SectionGate({ id, children }: { id: SectionId; children: ReactNode }) {
  const cms = useCms()
  const visible = cms.sectionVisible(id)
  if (!cms.edit && !visible) return null
  if (!visible) {
    return (
      <div className="cms-hidden-section">
        <span>“{id}” section is hidden</span>
        <button type="button" onClick={() => cms.setSectionVisible(id, true)}>
          Show it
        </button>
      </div>
    )
  }
  return <>{children}</>
}

/**
 * Editable hyperlink.
 *
 * In public mode this is a plain `<a href target rel>` and clicks follow the link.
 * In admin edit mode the click is captured (so the admin doesn't accidentally
 * navigate away) and an inline toolbar opens to add / change / remove the URL,
 * and the optional target-rel settings. The label is editable as inline text.
 */
export function Link({
  hrefPath,
  labelPath,
  targetPath,
  relPath,
  fallback,
  className = '',
  item,
  external = false,
  children,
}: {
  /** CMS path to the URL string (e.g. "hero.primaryCta.href"). */
  hrefPath: string
  /** CMS path to the link label string. If absent, `children` is used as static text. */
  labelPath?: string
  /** CMS path to an optional "open in new tab" boolean. */
  targetPath?: string
  /** CMS path to an optional `rel` string (defaults to "noopener noreferrer" for external). */
  relPath?: string
  /** Plain anchor href to use when no CMS value is set (so the public site never 404s). */
  fallback: string
  className?: string
  /** Selecting this link also selects the parent item in the inspector. */
  item?: string
  /** Force target=_blank + rel=noopener noreferrer regardless of CMS values. */
  external?: boolean
  children?: ReactNode
}) {
  const cms = useCms()
  const [open, setOpen] = useState(false)

  const href = labelPath ? (cms.get(hrefPath) || fallback) : (cms.get(hrefPath) || fallback)
  const target = external ? '_blank' : targetPath ? (cms.get(targetPath) === 'true' ? '_blank' : undefined) : undefined
  const rel =
    target
      ? (relPath ? cms.get(relPath) : 'noopener noreferrer') || 'noopener noreferrer'
      : relPath
        ? cms.get(relPath) || undefined
        : undefined

  // ---- public site ----
  if (!cms.edit) {
    return (
      <a href={href} target={target} rel={rel} className={className}>
        {labelPath ? <T p={labelPath} as="span" /> : children}
      </a>
    )
  }

  // ---- admin mode ----
  const isExternal = /^https?:\/\//i.test(href) || external
  const hasHref = Boolean(href)

  return (
    <span className={`cms-link ${className}`.trim()}>
      <a
        href={href || '#'}
        target={target}
        rel={rel}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          cms.select(item ?? hrefPath)
          setOpen((v) => !v)
        }}
        className={`cms-link-anchor ${hasHref ? '' : 'cms-link-missing'} ${cms.selected === (item ?? hrefPath) ? 'cms-selected' : ''}`}
        title={hasHref ? `${href} — click to edit` : 'No URL set — click to add one'}
      >
        {labelPath ? <T p={labelPath} as="span" /> : children}
      </a>
      {open && (
        <span className="cms-link-pop" onClick={(e) => e.stopPropagation()}>
          <span className="cms-link-pop-head">
            <LinkIcon className="h-3.5 w-3.5" />
            <span className="font-semibold">{hasHref ? 'Edit link' : 'Add link'}</span>
            <span className="cms-link-pop-spacer" />
            <button type="button" aria-label="Close" className="cms-link-pop-x" onClick={() => setOpen(false)}>×</button>
          </span>
          <label className="block">
            <span className="cms-link-pop-label">URL</span>
            <input
              type="url"
              value={cms.get(hrefPath)}
              onChange={(e) => cms.set(hrefPath, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  setOpen(false)
                } else if (e.key === 'Escape') {
                  setOpen(false)
                }
              }}
              placeholder="https:// · tel: · mailto: · #anchor"
              autoFocus
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </label>
          {targetPath && !external && (
            <label className="mt-2 flex items-center gap-2 text-xs text-slate-body">
              <input
                type="checkbox"
                checked={target === '_blank'}
                onChange={(e) => cms.set(targetPath, e.target.checked ? 'true' : 'false')}
                className="h-3.5 w-3.5 accent-[var(--color-brand-600)]"
              />
              Open in new tab
            </label>
          )}
          {external && <span className="mt-2 block text-[10px] text-slate-body">External link — always opens in a new tab.</span>}
          <span className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              Done
            </button>
            {isExternal && href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-body hover:bg-slate-50"
              >
                <ExternalLinkIcon className="h-3 w-3" /> Open
              </a>
            )}
            {hasHref && (
              <button
                type="button"
                title="Remove link (text stays)"
                onClick={() => {
                  cms.set(hrefPath, '')
                  setOpen(false)
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              >
                <UnlinkIcon className="h-3 w-3" /> Remove
              </button>
            )}
          </span>
        </span>
      )}
    </span>
  )
}

/** Icon slot with picker popover in edit mode. */
export function EditableIcon({ path, name, className = '' }: { path: string; name: string; className?: string }) {
  const cms = useCms()
  const [open, setOpen] = useState(false)

  if (!cms.edit) return <IconByName name={name} className={className} />

  return (
    <span className="cms-icon-wrap">
      <button
        type="button"
        title={`${name} — click to change icon`}
        className={`cms-icon-btn ${cms.selected === path ? 'cms-selected' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          cms.select(path)
          setOpen((v) => !v)
        }}
      >
        <IconByName name={name} className={className} />
      </button>
      {open && (
        <span className="cms-icon-picker" onClick={(e) => e.stopPropagation()}>
          {(Object.keys(ICON_REGISTRY) as IconName[]).map((key) => (
            <button
              key={key}
              type="button"
              title={ICON_REGISTRY[key].label}
              className={key === name ? 'active' : ''}
              onClick={() => {
                cms.set(path, key)
                setOpen(false)
              }}
            >
              <IconByName name={key} className="h-5 w-5" />
            </button>
          ))}
        </span>
      )}
    </span>
  )
}
