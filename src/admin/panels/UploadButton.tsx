import { useState } from 'react'

export function UploadButton({
  accept,
  label,
  fieldKey,
  disabled,
  onUploaded,
}: {
  accept: string
  label: string
  fieldKey: string
  /** When true, the button shows a "Replace" state. When false, it shows "Upload". */
  disabled?: boolean
  onUploaded: (url: string) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const inputId = `upload-${fieldKey}`

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError(null)
    setDone(false)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error || `Upload failed (${res.status})`)
      }
      const data = (await res.json()) as { url?: string }
      if (!data.url) throw new Error('Upload succeeded but no URL returned')
      onUploaded(data.url)
      setDone(true)
      setTimeout(() => setDone(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <input id={inputId} type="file" accept={accept} className="hidden" onChange={onChange} />
      <label
        htmlFor={inputId}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
          busy
            ? 'pointer-events-none border-slate-200 bg-slate-50 text-slate-body'
            : 'border-brand-200 bg-white text-brand-700 hover:border-brand-400 hover:bg-brand-50'
        }`}
      >
        {busy ? (
          <>
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
            Uploading…
          </>
        ) : (
          <>
            <span aria-hidden="true">↑</span>
            {disabled ? 'Replace' : 'Upload'}
          </>
        )}
      </label>
      <span className="text-[10px] text-slate-body">
        {done ? (
          <span className="font-semibold text-emerald-600">✓ Uploaded</span>
        ) : error ? (
          <span className="font-semibold text-red-600">{error}</span>
        ) : (
          label
        )}
      </span>
    </div>
  )
}
