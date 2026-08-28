/**
 * YouTube channel sync for the CMS "Latest lessons" section.
 *
 * Runs on a Vercel Cron schedule (once a day at 20:00 UTC = 02:00 next day
 * SLST — see vercel.json). The endpoint accepts requests with either the
 * `x-vercel-cron` header (production cron) OR a valid admin `cms_session`
 * cookie (so the admin can trigger it manually). Any other caller gets 401.
 *
 * Flow (YouTube Data API v3):
 *   1. channels.list         — get the uploads playlist id            (1 unit)
 *   2. playlistItems.list    — get the 4 most-recent video IDs         (1 unit)
 *   3. videos.list           — get title + duration                   (1 unit)
 * Net: 3 units per run. Default daily quota is 10,000.
 *
 * The sync respects `site.ytAutoSync` — if the admin has it OFF, the function
 * exits early without writing. The `site.ytLastSyncAt` field is bumped on
 * every successful run regardless, so the admin can see when the last
 * successful check happened.
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

function parseIsoDuration(iso: string): string {
  // PT1H46M14S -> 1:46:14 ; PT2M27S -> 2:27 ; PT39S -> 0:39
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso)
  if (!m) return iso
  const h = m[1] ? Number(m[1]) : 0
  const mn = m[2] ? Number(m[2]) : 0
  const s = m[3] ? Number(m[3]) : 0
  if (h > 0) return `${h}:${String(mn).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${mn}:${String(s).padStart(2, '0')}`
}

function thumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
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

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return json({ error: 'YOUTUBE_API_KEY is not configured — add it in Vercel and redeploy' }, 500)
    }
    const channelId = process.env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID

    // Load the current saved content. We need to read the auto-sync switch
    // and the existing video list to preserve ordering where possible.
    let current: CmsContent | null = null
    try {
      current = (await loadContent()) as CmsContent | null
    } catch (err) {
      console.error('[cms] youtube-sync: loadContent failed:', err)
    }
    if (!current) current = null

    if (current && current.site && current.site.ytAutoSync === false) {
      // Admin has auto-sync off — exit early but bump lastSyncAt so the UI
      // shows we last checked.
      const bumped = current
        ? { ...current, site: { ...current.site, ytLastSyncAt: new Date().toISOString() } }
        : null
      if (bumped) {
        try {
          await saveContent(bumped)
        } catch (err) {
          console.error('[cms] youtube-sync: saveContent (skip bump) failed:', err)
        }
      }
      return json({ ok: true, skipped: 'auto-sync off', total: 0 })
    }

    try {
      // 1) Resolve the uploads playlist id for the channel.
      const chUrl =
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails` +
        `&id=${encodeURIComponent(channelId)}` +
        `&fields=items/contentDetails/relatedPlaylists/uploads` +
        `&key=${encodeURIComponent(apiKey)}`
      const chRes = await fetchWithTimeout(chUrl)
      if (!chRes.ok) {
        const text = await chRes.text().catch(() => '')
        console.error('[cms] youtube-sync: channels.list failed', chRes.status, text.slice(0, 200))
        return json({ error: `YouTube channels.list failed (${chRes.status})` }, 502)
      }
      const chData = (await chRes.json()) as {
        items?: { contentDetails?: { relatedPlaylists?: { uploads?: string } } }[]
      }
      const uploadsId = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
      if (!uploadsId) {
        return json({ error: 'YouTube channel has no uploads playlist (check YOUTUBE_CHANNEL_ID)' }, 502)
      }

      // 2) Get the latest N video IDs from the uploads playlist.
      const plUrl =
        `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails` +
        `&playlistId=${encodeURIComponent(uploadsId)}&maxResults=${MAX_RESULTS}` +
        `&fields=items/contentDetails(videoId,videoPublishedAt)` +
        `&key=${encodeURIComponent(apiKey)}`
      const plRes = await fetchWithTimeout(plUrl)
      if (!plRes.ok) {
        const text = await plRes.text().catch(() => '')
        console.error('[cms] youtube-sync: playlistItems.list failed', plRes.status, text.slice(0, 200))
        return json({ error: `YouTube playlistItems.list failed (${plRes.status})` }, 502)
      }
      const plData = (await plRes.json()) as {
        items?: { contentDetails?: { videoId?: string; videoPublishedAt?: string } }[]
      }
      const ids: string[] = (plData.items ?? [])
        .map((it) => it.contentDetails?.videoId)
        .filter((x): x is string => typeof x === 'string' && x.length > 0)
      if (ids.length === 0) {
        return json({ ok: true, added: 0, removed: 0, total: 0, message: 'no videos found' })
      }

      // 3) Hydrate each id with title + duration only.
      const vUrl =
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails` +
        `&id=${ids.join(',')}` +
        `&fields=items(id,snippet(title),contentDetails(duration))` +
        `&key=${encodeURIComponent(apiKey)}`
      const vRes = await fetchWithTimeout(vUrl)
      if (!vRes.ok) {
        const text = await vRes.text().catch(() => '')
        console.error('[cms] youtube-sync: videos.list failed', vRes.status, text.slice(0, 200))
        return json({ error: `YouTube videos.list failed (${vRes.status})` }, 502)
      }
      const vData = (await vRes.json()) as {
        items?: {
          id?: string
          snippet?: { title?: string }
          contentDetails?: { duration?: string }
        }[]
      }

      // Build the new videos array in the same order the playlist returned
      // them (newest first).
      const fetched: CmsVideo[] = []
      for (const id of ids) {
        const item = vData.items?.find((x) => x.id === id)
        if (!item) continue
        fetched.push({
          title: (item.snippet?.title ?? '').slice(0, 160),
          duration: parseIsoDuration(item.contentDetails?.duration ?? 'PT0S'),
          url: `https://www.youtube.com/watch?v=${id}`,
          thumb: thumbnailUrl(id),
        })
      }

      // Diff against the saved videos — count adds/removes for the response.
      const beforeUrls = new Set((current?.community?.videos ?? []).map((v) => v.url))
      const afterUrls = new Set(fetched.map((v) => v.url))
      let added = 0
      for (const u of afterUrls) if (!beforeUrls.has(u)) added++
      let removed = 0
      for (const u of beforeUrls) if (!afterUrls.has(u) && beforeUrls.size > 0) removed++

      // Write through the same Neon/Blob path the content API uses.
      const now = new Date().toISOString()
      if (!current) {
        return json({ error: 'no saved content to update — publish once first' }, 500)
      }
      const next: CmsContent = {
        ...current,
        community: { ...current.community, videos: fetched },
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
        total: fetched.length,
        lastSyncAt: now,
      })
    } catch (err) {
      console.error('[cms] youtube-sync crashed:', err)
      return json({ error: err instanceof Error ? err.message : 'sync crashed' }, 500)
    }
  },
}
