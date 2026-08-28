import { useCms } from '../cms/CmsProvider'
import { AddItemButton, ItemControls, Link, T } from '../cms/edit'
import { extractYouTubeId } from '../cms/schema'
import { ArrowUpRightIcon, FacebookIcon, TiktokGlyph, YoutubeIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'
import { useCountUp, useInView } from '../hooks/useCountUp'

function StatCard({ path, index, delay }: { path: string; index: number; delay: number }) {
  const cms = useCms()
  const stat = cms.c.community.stats[index]
  const { ref: inViewRef, inView } = useInView<HTMLAnchorElement>()
  const count = useCountUp(stat.value, inView)
  const Icon = stat.brand === 'youtube' ? YoutubeIcon : FacebookIcon

  return (
    <Reveal delay={delay} className="h-full">
      <Link
        hrefPath={`${path}.href`}
        fallback={stat.href}
        item={path}
        external
        className="cms-item group relative flex h-full flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
        aria-label={`${stat.label}: ${stat.value}${stat.suffix} (opens in a new tab)`}
      >
        <span
          ref={(node) => {
            inViewRef.current = node as HTMLAnchorElement | null
          }}
          className="flex h-full flex-col gap-2"
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
        </span>
      </Link>
    </Reveal>
  )
}

function VideoCard({ path, index, delay }: { path: string; index: number; delay: number }) {
  const cms = useCms()
  const video = cms.c.community.videos[index]
  const thumb = video.thumb || `https://i.ytimg.com/vi/${extractYouTubeId(video.url) ?? 'default'}/hqdefault.jpg`
  const showDuration = video.duration && video.duration.trim().length > 0

  return (
    <Reveal delay={delay} className="h-full">
      <Link
        hrefPath={`${path}.url`}
        fallback={video.url}
        item={path}
        external
        className="cms-item group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
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
          {showDuration && (
            <T
              p={`${path}.duration`}
              as="span"
              className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 font-mono text-[11px] font-medium text-white"
            />
          )}
        </span>
        <span className="flex flex-1 flex-col gap-1 p-4">
          <T p={`${path}.title`} as="span" className="block text-sm font-semibold leading-snug text-ink" />
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs font-semibold text-brand-700">
            Watch on YouTube
            <ArrowUpRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </span>
      </Link>
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
            <Link
              hrefPath="site.tiktokUrl"
              fallback={cms.c.site.tiktokUrl}
              external
              className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-600"
            >
              <TiktokGlyph className="h-3.5 w-3.5" />
              <T p="site.tiktokLabel" as="span" />
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
              <span className="sr-only">(opens TikTok in a new tab)</span>
            </Link>
          </p>
        </Reveal>

        <div className="mt-12">
          <Reveal>
            <T p="community.videosTitle" as="h3" className="block font-display text-xl font-bold text-ink" />
          </Reveal>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {com.videos.slice(0, 4).map((_v, i) => (
              <VideoCard key={i} path={`community.videos.${i}`} index={i} delay={i * 80} />
            ))}
          </div>
          <AddItemButton
            listPath="community.videos"
            template={{
              title: 'New lesson',
              duration: '0:00',
              url: 'https://www.youtube.com/watch?v=',
              thumb: '',
            }}
            label="Add lesson video"
          />
        </div>
      </div>
    </section>
  )
}
