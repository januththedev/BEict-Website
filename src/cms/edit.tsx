/**
 * CMS editing primitives. On the public site these render as plain elements;
 * in admin edit mode they add click-to-select, inline contentEditable text
 * editing, image uploads, per-item controls and section visibility gates.
 */
import { useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { useCms } from './CmsProvider'
import { IconByName, ICON_REGISTRY } from '../components/Icons'
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
}: {
  p: string
  src: string
  alt: string
  className?: string
  item?: string
}) {
  const cms = useCms()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!cms.edit) return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />

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
        {src !== cms.get(p) || cms.get(p) !== '' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              cms.set(p, src)
            }}
          >
            ↺ Default
          </button>
        ) : null}
      </span>
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
