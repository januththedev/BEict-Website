/**
 * YouTube channel sync for the CMS "Latest lessons" section.
 *
 * Runs on a Vercel Cron schedule (once a day at 18:30 UTC = 00:00 next day
 * SLST — see vercel.json). The endpoint accepts requests with either the
 * `x-vercel-cron` header (production cron) OR a valid admin `cms_session`
 * cookie (so the admin can trigger it manually). Any other caller gets 401.
 *
 * Source: the public YouTube RSS feed for the channel at
 *   https://www.youtube.com/feeds/videos.xml?channel_id=<ID>
 *
 * No API key, no quota, no Google Cloud project — every YouTube channel
 * exposes this feed by default. It returns the most-recent 15 videos
 * with title, video id, published date, and thumbnail URL, which is
 * everything the public 4-up grid needs. The feed does NOT include
 * duration, so we leave `duration` empty on freshly-synced rows (the
 * VideoCard component hides the overlay when the field is empty).
 *
 * If the admin wants the original duration back, they can re-type it in
 * the admin panel after a sync; we never overwrite a non-empty duration
 * on a video that already exists in saved content.
 *
 * The sync respects `site.ytAutoSync` — if the admin has it OFF, the
 * function exits early without writing. The `site.ytLastSyncAt` field is
 * bumped on every successful run regardless, so the admin can see when
 * the last successful check happened.
 */

import { isAuthed } from '../src/cms/server/session.js'
import { loadContent, saveContent } from '../src/cms/server/db.js'
import { type CmsContent, type CmsVideo } from '../src/cms/schema.js'

const DEFAULT_CHANNEL_ID = 'UC2vJHPJnfJNwr8DpdRMNE6g'
const MAX_RESULTS = 4

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function fetchWithTimeout(url: string, ms = 6000): Promise<Response> {
  return Promise.race([
    fetch(url),
    new Promise<Response>((_, reject) => setTimeout(() => reject(new Error(`yt-sync timeout after ${ms}ms`)), ms)),
  ])
}

function thumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

/** Pull the latest N videos from a YouTube channel's public RSS feed. */
async function fetchFeed(channelId: string, n: number): Promise<CmsVideo[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`
  const res = await fetchWithTimeout(url)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`YouTube feed ${res.status}: ${text.slice(0, 120)}`)
  }
  const xml = await res.text()
  // The feed is small (<60 KB) — we run a few targeted regex passes rather
  // than pulling in an XML parser. The feed is owned by YouTube and has
  // been stable for over a decade; if YouTube ever changes the schema
  // we'll see it in the logs first.
  const entries: CmsVideo[] = []
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g
  let match: RegExpExecArray | null
  while ((match = entryRe.exec(xml)) && entries.length < n) {
    const block = match[1]
    const idMatch = /<yt:videoId>([\w-]{6,})<\/yt:videoId>/.exec(block)
    const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(block)
    if (!idMatch || !titleMatch) continue
    // Atom text is XML-encoded — decode the four entities that can
    // realistically appear in a video title.
    const title = titleMatch[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    entries.push({
      title: title.slice(0, 160),
      duration: '', // RSS doesn't expose duration — keep the slot empty
      url: `https://www.youtube.com/watch?v=${idMatch[1]}`,
      thumb: thumbnailUrl(idMatch[1]),
    })
  }
  return entries
}

async function isAuthorized(req: Request): Promise<boolean> {
  if (req.headers.get('x-vercel-cron')) return true
  return isAuthed(req)
}

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method !== 'GET' && req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
    if (!(await isAuthorized(req))) {
      return json({ error: 'Unauthorized — needs x-vercel-cron header or admin session' }, 401)
    }

    const channelId = process.env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID

    // Load the current saved content. We need to read the auto-sync switch
    // and the existing video list to preserve durations the admin set.
    let current: CmsContent | null = null
    try {
      current = (await loadContent()) as CmsContent | null
    } catch (err) {
      console.error('[cms] youtube-sync: loadContent failed:', err)
    }

    if (current && current.site && current.site.ytAutoSync === false) {
      // Admin has auto-sync off — exit early but bump lastSyncAt so the UI
      // shows we last checked.
      const bumped = {
        ...current,
        site: { ...current.site, ytLastSyncAt: new Date().toISOString() },
      }
      try {
        await saveContent(bumped)
      } catch (err) {
        console.error('[cms] youtube-sync: saveContent (skip bump) failed:', err)
      }
      return json({ ok: true, skipped: 'auto-sync off', total: 0 })
    }

    try {
      const fetched = await fetchFeed(channelId, MAX_RESULTS)
      if (fetched.length === 0) {
        return json({ ok: true, added: 0, removed: 0, total: 0, message: 'no videos in feed' })
      }

      // Merge durations forward — if the admin had typed a duration for a
      // video that still appears in the new top-N, keep it. The new
      // video always lands at the top (freshest first).
      const prevByUrl = new Map((current?.community?.videos ?? []).map((v) => [v.url, v]))
      const merged: CmsVideo[] = fetched.map((v) => {
        const prev = prevByUrl.get(v.url)
        if (prev?.duration) return { ...v, duration: prev.duration }
        return v
      })

      // Diff against the saved videos — count adds/removes for the response.
      const beforeUrls = new Set((current?.community?.videos ?? []).map((v) => v.url))
      const afterUrls = new Set(merged.map((v) => v.url))
      let added = 0
      for (const u of afterUrls) if (!beforeUrls.has(u)) added++
      let removed = 0
      for (const u of beforeUrls) if (!afterUrls.has(u) && beforeUrls.size > 0) removed++

      if (!current) {
        return json({ error: 'no saved content to update — publish once first' }, 500)
      }
      const now = new Date().toISOString()
      const next: CmsContent = {
        ...current,
        community: { ...current.community, videos: merged },
        site: { ...current.site, ytLastSyncAt: now },
      }
      try {
        await saveContent(next)
      } catch (err) {
        console.error('[cms] youtube-sync: saveContent failed:', err)
        return json({ error: 'saveContent failed — see function logs' }, 500)
      }

      return json({
        ok: true,
        added,
        removed,
        total: merged.length,
        lastSyncAt: now,
      })
    } catch (err) {
      console.error('[cms] youtube-sync crashed:', err)
      return json({ error: err instanceof Error ? err.message : 'sync crashed' }, 500)
    }
  },
}
