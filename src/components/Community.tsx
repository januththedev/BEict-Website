import { useCms } from '../cms/CmsProvider'
import { AddItemButton, ItemControls, T } from '../cms/edit'
import { extractYouTubeId, type CmsVideo } from '../cms/schema'
import { ArrowUpRightIcon, FacebookIcon, TiktokGlyph, YoutubeIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'
import { useCountUp, useInView } from '../hooks/useCountUp'
import { useTilt } from '../hooks/useTilt'

/** Split the videos array: the first currently-live item is the hero, the rest
 * (and any non-live items in the array) populate the 4-up grid below. */
function partitionVideos(
  videos: CmsVideo[],
): { live: CmsVideo | null; liveIndex: number | null; rest: CmsVideo[] } {
  const liveIdx = videos.findIndex((v) => v.liveBroadcastContent === 'live')
  if (liveIdx === -1) return { live: null, liveIndex: null, rest: videos }
  return {
    live: videos[liveIdx],
    liveIndex: liveIdx,
    rest: videos.filter((_, i) => i !== liveIdx),
  }
}

function StatCard({ path, index, delay }: { path: string; index: number; delay: number }) {
  const cms = useCms()
  const stat = cms.c.community.stats[index]
  const { ref: inViewRef, inView } = useInView<HTMLAnchorElement>()
  const tilt = useTilt<HTMLAnchorElement>(4)
  const count = useCountUp(stat.value, inView)
  const Icon = stat.brand === 'youtube' ? YoutubeIcon : FacebookIcon

  return (
    <Reveal delay={delay} className="h-full">
      <a
        ref={(node) => {
          inViewRef.current = node
          tilt.current = node
        }}
        href={stat.href}
        target="_blank"
        rel="noopener noreferrer"
        className="cms-item relative flex h-full flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition-all duration-200 hover:border-brand-200 hover:shadow-lift"
        aria-label={`${stat.label}: ${stat.value}${stat.suffix} (opens in a new tab)`}
      >
        <ItemControls path={path} removable={cms.c.community.stats.length > 1} />
        <T p={`${path}.label`} as="span" className="block text-xs font-semibold uppercase tracking-wider text-slate-body" />
        <span className="font-display text-5xl font-extrabold tracking-tight text-ink tabular-nums">
          {count}
          <span className="text-brand-600">{stat.suffix}</span>
        </span>
        <span className="mt-auto flex items-center gap-1.5 pt-2 text-sm text-slate-body">
          <Icon className="h-3.5 w-3.5 shrink-0 text-brand-600" />
          <T p={`${path}.sub`} />
        </span>
      </a>
    </Reveal>
  )
}

function VideoCard({ path, index, delay }: { path: string; index: number; delay: number }) {
  const cms = useCms()
  const video = cms.c.community.videos[index]
  const thumb = video.thumb || `https://i.ytimg.com/vi/${extractYouTubeId(video.url) ?? 'default'}/hqdefault.jpg`
  const tilt = useTilt<HTMLAnchorElement>(5)

  return (
    <Reveal delay={delay} className="h-full">
      <a
        ref={tilt}
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="cms-item group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-200 hover:border-brand-200 hover:shadow-lift"
        aria-label={`Watch "${video.title}" on YouTube (opens in a new tab)`}
      >
        <ItemControls path={path} removable={cms.c.community.videos.length > 1} />
        <span className="relative block aspect-video overflow-hidden bg-navy-900">
          <img
            src={thumb}
            alt=""
            width={480}
            height={360}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <T
            p={`${path}.duration`}
            as="span"
            className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 font-mono text-[11px] font-medium text-white"
          />
        </span>
        <span className="flex flex-1 flex-col gap-1 p-4">
          <T p={`${path}.title`} as="span" className="block text-sm font-semibold leading-snug text-ink" />
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs font-semibold text-brand-700">
            Watch on YouTube
            <ArrowUpRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </span>
      </a>
    </Reveal>
  )
}

function LiveHero({ path, video }: { path: string; video: CmsVideo }) {
  const cms = useCms()
  const thumb = video.thumb || `https://i.ytimg.com/vi/${extractYouTubeId(video.url) ?? 'default'}/hqdefault.jpg`
  const tilt = useTilt<HTMLAnchorElement>(3)
  const isArrayItem = path.match(/\.(\d+)$/) !== null
  return (
    <Reveal>
      <a
        ref={tilt}
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="cms-item group block overflow-hidden rounded-2xl border border-red-200 bg-white shadow-card transition-all duration-200 hover:border-red-300 hover:shadow-lift"
        aria-label={`Watch "${video.title}" live on YouTube (opens in a new tab)`}
      >
        {isArrayItem && <ItemControls path={path} removable={cms.c.community.videos.length > 1} />}
        <div className="flex flex-col sm:flex-row">
          <span className="relative block aspect-video w-full shrink-0 overflow-hidden bg-navy-900 sm:aspect-auto sm:h-full sm:w-1/2">
            <img
              src={thumb}
              alt=""
              width={960}
              height={540}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="cms-live-badge absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lift">
              <span className="cms-live-dot" aria-hidden="true" />
              Live
            </span>
          </span>
          <span className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              Streaming now
            </span>
            <T
              p={`${path}.title`}
              as="span"
              className="block font-display text-lg font-bold leading-snug text-ink sm:text-xl"
            />
            <span className="text-sm text-slate-body">
              Join the live class on YouTube. The stream link stays open in a new tab.
            </span>
            {video.concurrentViewers > 0 && (
              <span className="text-xs font-semibold text-slate-body">
                {video.concurrentViewers.toLocaleString('en-LK')} watching now
              </span>
            )}
            <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-red-600">
              Watch live on YouTube
              <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </span>
        </div>
      </a>
    </Reveal>
  )
}

export function Community() {
  const cms = useCms()
  const com = cms.c.community

  return (
    <section id="community" className="bg-ice py-20 sm:py-24" aria-labelledby="community-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="community-title"
          eyebrow="Community"
          titleKey="community.title"
          ledeKey="community.lede"
          variant="mask"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {com.stats.map((_, i) => (
            <StatCard key={i} path={`community.stats.${i}`} index={i} delay={i * 100} />
          ))}
        </div>
        <AddItemButton
          listPath="community.stats"
          template={{ brand: 'facebook', label: 'New stat', value: 10, suffix: '+', sub: 'Source', href: 'https://www.facebook.com/bhanukaekanyaka/' }}
          label="Add stat"
        />

        <Reveal delay={200}>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-body">
            <T p="community.tiktokPre" />
            <a
              href={cms.c.site.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-600"
            >
              <TiktokGlyph className="h-3.5 w-3.5" />
              {cms.c.site.tiktokLabel}
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
              <span className="sr-only">(opens TikTok in a new tab)</span>
            </a>
          </p>
        </Reveal>

        <div className="mt-12">
          <Reveal>
            <T p="community.videosTitle" as="h3" className="block font-display text-xl font-bold text-ink" />
          </Reveal>
          {(() => {
            const { live, liveIndex, rest } = partitionVideos(com.videos)
            // Indices in `rest` are sparse — build an indexOf map back to the original array.
            const originalIndices: number[] = []
            com.videos.forEach((_v, i) => {
              if (i !== liveIndex) originalIndices.push(i)
            })
            return (
              <>
                {live && (
                  <div className="mt-5">
                    <LiveHero path={`community.videos.${liveIndex!}`} video={live} />
                  </div>
                )}
                <div className={`mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4`}>
                  {rest.slice(0, 4).map((_v, i) => {
                    const origIdx = originalIndices[i]
                    return <VideoCard key={origIdx} path={`community.videos.${origIdx}`} index={origIdx} delay={i * 80} />
                  })}
                </div>
              </>
            )
          })()}
          <AddItemButton
            listPath="community.videos"
            template={{
              title: 'New lesson',
              duration: '0:00',
              url: 'https://www.youtube.com/watch?v=',
              thumb: '',
              liveBroadcastContent: 'none',
              concurrentViewers: 0,
            }}
            label="Add lesson video"
          />
        </div>
      </div>
    </section>
  )
}
