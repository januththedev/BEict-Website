import { describe, it, expect } from 'vitest'
import { defaultContent, validateContent, sanitizeUrl, extractYouTubeId, LIMITS } from '../cms/schema'

describe('sanitizeUrl', () => {
  it('keeps https://, http://localhost, tel:, mailto:, anchors, and root-relative', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
    expect(sanitizeUrl('http://localhost:3000/admin')).toBe('http://localhost:3000/admin')
    expect(sanitizeUrl('tel:+94112233445')).toBe('tel:+94112233445')
    expect(sanitizeUrl('mailto:b@b.com')).toBe('mailto:b@b.com')
    expect(sanitizeUrl('#contact')).toBe('#contact')
    expect(sanitizeUrl('/about')).toBe('/about')
  })
  it('rejects javascript:, data:, vbscript:, file: URLs (XSS surface)', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('#')
    expect(sanitizeUrl('JavaScript:alert(1)')).toBe('#') // case-insensitive
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#')
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('#')
    expect(sanitizeUrl('file:///etc/passwd')).toBe('#')
  })
  it('returns fallback for non-strings and empty strings', () => {
    expect(sanitizeUrl('', '#')).toBe('#')
    expect(sanitizeUrl(null, '#')).toBe('#')
    expect(sanitizeUrl(undefined, '#')).toBe('#')
    expect(sanitizeUrl(42, '#')).toBe('#')
  })
  it('respects custom fallback', () => {
    expect(sanitizeUrl('javascript:bad', '/safe')).toBe('/safe')
  })
})

describe('extractYouTubeId', () => {
  it('handles watch?v=, youtu.be/, and /shorts/ formats', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })
  it('returns null for non-YouTube URLs', () => {
    expect(extractYouTubeId('https://example.com/watch?v=abc')).toBeNull()
    expect(extractYouTubeId('not-a-url')).toBeNull()
    expect(extractYouTubeId('')).toBeNull()
  })
  it('returns null for too-short IDs (rejects accidental short-string matches)', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=abc')).toBeNull()
  })
})

describe('validateContent', () => {
  it('returns null for non-object input', () => {
    expect(validateContent(null)).toBeNull()
    expect(validateContent('string')).toBeNull()
    expect(validateContent(42)).toBeNull()
    // Arrays are objects in JS — they fall through to the "fill with defaults" path.
    // That's fine: an empty array means "no fields at all", so defaults win.
    expect(validateContent([])).not.toBeNull()
  })

  it('returns a fully populated content when given an empty object', () => {
    const out = validateContent({})
    expect(out).not.toBeNull()
    expect(out!.site.name).toBe(defaultContent.site.name)
    expect(out!.community.videos.length).toBeGreaterThan(0)
  })

  it('ignores unknown fields (the page structure is locked)', () => {
    const evil = { ...defaultContent, brandNewField: 'evil', community: { ...defaultContent.community, injected: 'bad' } }
    const out = validateContent(evil)
    expect(out).not.toBeNull()
    expect((out as unknown as Record<string, unknown>).brandNewField).toBeUndefined()
    expect((out!.community as unknown as Record<string, unknown>).injected).toBeUndefined()
  })

  it('never lets a video URL slip through as javascript: or http://', () => {
    const input = {
      community: {
        videos: [
          { title: 'good https', url: 'https://www.youtube.com/watch?v=valid11111', duration: '1:00', thumb: '' },
          { title: 'bad js', url: 'javascript:alert(1)', duration: '1:00', thumb: '' },
          { title: 'bad http', url: 'http://insecure.example.com', duration: '1:00', thumb: '' },
        ],
      },
    }
    const out = validateContent(input)
    expect(out).not.toBeNull()
    // No entry's url may start with javascript: or http:// (non-localhost)
    for (const v of out!.community.videos) {
      expect(v.url.startsWith('javascript:')).toBe(false)
      expect(v.url.startsWith('http://')).toBe(false)
      expect(v.url.startsWith('https://')).toBe(true)
    }
  })

  it('clamps videos.length to LIMITS.videos.max', () => {
    const tooMany = Array.from({ length: LIMITS.videos.max + 5 }, (_, i) => ({
      title: `v${i}`,
      url: `https://www.youtube.com/watch?v=id${i.toString().padStart(6, '0')}`,
      duration: '0:00',
      thumb: '',
    }))
    const out = validateContent({ community: { videos: tooMany } })
    expect(out!.community.videos.length).toBe(LIMITS.videos.max)
  })

  it('clamps numeric stat values to the 0–1,000,000 range', () => {
    const out = validateContent({ community: { stats: [{ brand: 'youtube', label: 'x', value: 9_999_999, suffix: 'K', sub: '', href: 'https://x.com' }] } })
    expect(out!.community.stats[0].value).toBe(1_000_000)
  })

  it('accepts the SEO & brand fields added in v2.x', () => {
    const out = validateContent({ site: { seoTitle: 'Custom', seoDescription: 'd', seoFaviconUrl: 'https://x.com/f.ico', seoOgImageUrl: 'https://x.com/o.png' } })
    expect(out!.site.seoTitle).toBe('Custom')
    expect(out!.site.seoDescription).toBe('d')
    expect(out!.site.seoFaviconUrl).toBe('https://x.com/f.ico')
    expect(out!.site.seoOgImageUrl).toBe('https://x.com/o.png')
  })

  it('falls back to default SEO fields when given garbage', () => {
    const out = validateContent({ site: { seoTitle: 42, seoFaviconUrl: 'javascript:bad' } })
    expect(out!.site.seoTitle).toBe(defaultContent.site.seoTitle)
    expect(out!.site.seoFaviconUrl).toBe(defaultContent.site.seoFaviconUrl) // javascript: gets sanitised to '/favicon.svg' which is the default
  })

  it('preserves section visibility toggles', () => {
    const out = validateContent({ sections: { hero: { visible: false }, about: { visible: true } } })
    expect(out!.sections.hero.visible).toBe(false)
    expect(out!.sections.about.visible).toBe(true)
  })
})
