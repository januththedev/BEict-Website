/**
 * YouTube live-state probe for the public site.
 *
 * Cached at the edge for 2 minutes (stale-while-revalidate 5 minutes), so a
 * returning visitor never hammers YouTube. One call per refresh.
 *
 * Looks at the most-recent video in the saved content and asks YouTube
 * whether it is currently live. Returns a minimal payload the browser merges
 * into its in-memory `community.videos[0]` so the LiveHero appears without
 * waiting on the 6-hour cron.
 *
 * The function deliberately ignores the saved `liveBroadcastContent` and asks
 * YouTube directly — the saved flag is at most 6 hours stale; the probe is
 * what gives the page its "live" feel.
 */

import { loadContent } from '../src/cms/server/db.js'
import { extractYouTubeId } from '../src/cms/schema.js'

type StoredShape = { community?: { videos?: { url?: string }[] } }

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
    ...extraHeaders,
  }
  return new Response(JSON.stringify(body), { status, headers })
}

async function fetchWithTimeout(url: string, ms = 4000): Promise<Response> {
  return Promise.race([
    fetch(url),
    new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('yt-live timeout')), ms)),
  ])
}

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      // No key — degrade to "not live" so the hero never shows without data.
      return json({ liveBroadcastContent: 'none', concurrentViewers: 0 }, 200, {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      })
    }

    let stored: StoredShape | null = null
    try {
      const raw = await loadContent()
      stored = (raw ?? null) as StoredShape | null
    } catch {
      stored = null
    }
    const videos = stored?.community?.videos ?? []
    if (videos.length === 0) return json({ liveBroadcastContent: 'none', concurrentViewers: 0 })

    const top = videos[0]
    const id = extractYouTubeId(top?.url ?? '')
    if (!id) return json({ liveBroadcastContent: 'none', concurrentViewers: 0 })

    const url =
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails` +
      `&id=${encodeURIComponent(id)}` +
      `&fields=items(id,snippet(liveBroadcastContent),liveStreamingDetails(concurrentViewers))` +
      `&key=${encodeURIComponent(apiKey)}`

    try {
      const res = await fetchWithTimeout(url)
      if (!res.ok) {
        console.error('[cms] youtube-live api status', res.status)
        return json({ liveBroadcastContent: 'none', concurrentViewers: 0 })
      }
      const data = (await res.json()) as {
        items?: { snippet?: { liveBroadcastContent?: string }; liveStreamingDetails?: { concurrentViewers?: string | number } }[]
      }
      const item = data.items?.[0]
      const lbc = item?.snippet?.liveBroadcastContent
      const cv = item?.liveStreamingDetails?.concurrentViewers
      const liveBroadcastContent: 'live' | 'upcoming' | 'none' =
        lbc === 'live' || lbc === 'upcoming' ? lbc : 'none'
      const concurrentViewers =
        typeof cv === 'number' ? cv : typeof cv === 'string' ? Number(cv) || 0 : 0
      return json({ id, liveBroadcastContent, concurrentViewers })
    } catch (err) {
      console.error('[cms] youtube-live probe failed:', err)
      return json({ liveBroadcastContent: 'none', concurrentViewers: 0 })
    }
  },
}
