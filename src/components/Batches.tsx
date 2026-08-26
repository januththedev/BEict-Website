import { BATCHES, SITE } from '../data/content'
import type { Batch } from '../data/content'
import { ArrowUpRightIcon, BookOpenIcon, MonitorIcon, RepeatIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'
import { useTilt } from '../hooks/useTilt'

const BATCH_ICONS = {
  'al-theory': BookOpenIcon,
  'repeat-revision': RepeatIcon,
  'online-resources': MonitorIcon,
} as const

function BatchCard({ batch, delay }: { batch: Batch; delay: number }) {
  const Icon = BATCH_ICONS[batch.id as keyof typeof BATCH_ICONS] ?? BookOpenIcon
  const tilt = useTilt<HTMLElement>(5)
  return (
    <Reveal delay={delay} className="h-full">
      <article
        ref={tilt}
        className="group flex h-full flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-7 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
          <Icon className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-ink">{batch.name}</h3>
          <p className="mt-2 text-sm leading-relaxed">{batch.note}</p>
        </div>
        <a
          href={SITE.lmsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 transition-colors hover:text-brand-600"
        >
          Open on the LMS
          <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          <span className="sr-only">(opens lms.beict.lk in a new tab)</span>
        </a>
      </article>
    </Reveal>
  )
}

export function Batches() {
  return (
    <section id="batches" className="bg-ice py-20 sm:py-24" aria-labelledby="batches-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="batches-title"
          index="02"
          eyebrow="Batches"
          align="left"
          title="Find your batch"
          lede="On the learning system, courses are organised by exam year — with a separate revision track for repeaters. Sign in and see where you fit."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BATCHES.map((batch, i) => (
            <BatchCard key={batch.id} batch={batch} delay={i * 90} />
          ))}
        </div>

        <Reveal delay={280}>
          <p className="mt-8 text-center text-xs text-slate-body">
            Batch categories shown here reflect the course categories published on{' '}
            <a href={SITE.lmsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-600">
              lms.beict.lk
            </a>
            . Current availability is confirmed inside the learning system.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
