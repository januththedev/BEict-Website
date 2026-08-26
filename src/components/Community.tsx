import { LESSON_VIDEOS, SITE } from '../data/content'
import { ArrowUpRightIcon, FacebookIcon, TiktokGlyph, YoutubeIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'
import { useCountUp, useInView } from '../hooks/useCountUp'
import { useTilt } from '../hooks/useTilt'

/** Verified 2026-08-26 — see CONTENT-AUDIT.md before changing these. */
const STATS = [
  {
    id: 'youtube',
    label: 'YouTube subscribers',
    value: 80,
    suffix: 'K',
    href: SITE.youtubeUrl,
    icon: 'youtube' as const,
    sub: `${SITE.youtubeVideoCount} videos · ${SITE.youtubeHandle}`,
  },
  {
    id: 'facebook',
    label: 'Facebook followers',
    value: 152,
    suffix: 'K',
    href: SITE.facebookUrl,
    icon: 'facebook' as const,
    sub: 'Tutor/Teacher · Horana, Sri Lanka',
  },
  {
    id: 'recommend',
    label: 'Recommend on Facebook',
    value: 100,
    suffix: '%',
    href: SITE.facebookUrl,
    icon: 'facebook' as const,
    sub: SITE.facebookRecommend,
  },
]

function StatCard({ stat, delay }: { stat: (typeof STATS)[number]; delay: number }) {
  const { ref: inViewRef, inView } = useInView<HTMLAnchorElement>()
  const tilt = useTilt<HTMLAnchorElement>(4)
  const count = useCountUp(stat.value, inView)
  const Icon = stat.icon === 'youtube' ? YoutubeIcon : FacebookIcon

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
        className="flex h-full flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition-all duration-200 hover:border-brand-200 hover:shadow-lift"
        aria-label={`${stat.label}: ${stat.value}${stat.suffix} (opens in a new tab)`}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-body">{stat.label}</span>
        <span className="font-display text-5xl font-extrabold tracking-tight text-ink tabular-nums">
          {count}
          <span className="text-brand-600">{stat.suffix}</span>
        </span>
        <span className="mt-auto flex items-center gap-1.5 pt-2 text-sm text-slate-body">
          <Icon className="h-3.5 w-3.5 text-brand-600" />
          {stat.sub}
        </span>
      </a>
    </Reveal>
  )
}

function VideoCard({ video, delay }: { video: (typeof LESSON_VIDEOS)[number]; delay: number }) {
  const tilt = useTilt<HTMLAnchorElement>(5)
  return (
    <Reveal delay={delay} className="h-full">
      <a
        ref={tilt}
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-200 hover:border-brand-200 hover:shadow-lift"
        aria-label={`Watch "${video.title}" on YouTube (opens in a new tab)`}
      >
        <span className="relative block aspect-video overflow-hidden bg-navy-900">
          <img
            src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
            alt=""
            width={480}
            height={360}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 font-mono text-[11px] font-medium text-white">
            {video.duration}
          </span>
        </span>
        <span className="flex flex-1 flex-col gap-1 p-4">
          <span className="text-sm font-semibold leading-snug text-ink">{video.title}</span>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs font-semibold text-brand-700">
            Watch on YouTube
            <ArrowUpRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </span>
      </a>
    </Reveal>
  )
}

export function Community() {
  return (
    <section id="community" className="bg-ice py-20 sm:py-24" aria-labelledby="community-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="community-title"
          index="04"
          eyebrow="Community"
          title={
            <>
              Where the class lives{' '}
              <span className="font-accent font-normal text-brand-600">online</span>
            </>
          }
          lede="Full lessons go up on YouTube, free — theory, revision, seminars and student stories. The numbers below are live from the platforms."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <StatCard key={stat.id} stat={stat} delay={i * 100} />
          ))}
        </div>

        <Reveal delay={200}>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-body">
            Also on TikTok:
            <a
              href={SITE.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-600"
            >
              <TiktokGlyph className="h-3.5 w-3.5" />
              {SITE.tiktokHandle}
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
              <span className="sr-only">(opens TikTok in a new tab)</span>
            </a>
          </p>
        </Reveal>

        <div className="mt-12">
          <Reveal>
            <h3 className="font-display text-xl font-bold text-ink">Latest lessons</h3>
          </Reveal>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LESSON_VIDEOS.map((video, i) => (
              <VideoCard key={video.id} video={video} delay={i * 80} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
