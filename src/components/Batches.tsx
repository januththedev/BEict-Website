import { useCms } from '../cms/CmsProvider'
import { AddItemButton, EditableIcon, ItemControls, Link, T } from '../cms/edit'
import { ArrowUpRightIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'
import { useTilt } from '../hooks/useTilt'

function BatchCard({ path, index }: { path: string; index: number }) {
  const cms = useCms()
  const card = cms.c.batches.cards[index]
  const tilt = useTilt<HTMLElement>(5)

  return (
    <Reveal delay={index * 90} className="h-full">
      <article
        ref={tilt}
        className="cms-item group flex h-full flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-7 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
      >
        <ItemControls path={path} removable={cms.c.batches.cards.length > 1} />
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
          <EditableIcon path={`${path}.icon`} name={card.icon} className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <T p={`${path}.name`} as="h3" className="font-display text-lg font-bold text-ink" />
          <T p={`${path}.note`} as="p" multiline className="mt-2 block text-sm leading-relaxed" />
        </div>
        <Link
          hrefPath="site.lmsUrl"
          fallback={cms.c.site.lmsUrl}
          external
          className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 transition-colors hover:text-brand-600"
        >
          {cms.c.batches.cardLinkLabel}
          <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          <span className="sr-only">(opens lms.beict.lk in a new tab)</span>
        </Link>
      </article>
    </Reveal>
  )
}

export function Batches() {
  const cms = useCms()
  const b = cms.c.batches

  return (
    <section id="batches" className="bg-ice py-20 sm:py-24" aria-labelledby="batches-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="batches-title"
          eyebrow="Batches"
          titleKey="batches.title"
          ledeKey="batches.lede"
          variant="slide-x"
          from="left"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {b.cards.map((_, i) => (
            <BatchCard key={i} path={`batches.cards.${i}`} index={i} />
          ))}
        </div>
        <AddItemButton
          listPath="batches.cards"
          template={{ icon: 'graduation', name: 'New batch', note: 'Describe this batch for students.' }}
          label="Add batch card"
        />

        <Reveal delay={280}>
          <p className="mt-8 text-center text-xs text-slate-body">
            <T p="batches.captionPre" />{' '}
            <Link
              hrefPath="site.lmsUrl"
              fallback={cms.c.site.lmsUrl}
              external
              className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-600"
            >
              <T p="batches.captionLinkLabel" />
            </Link>
            . Current availability is confirmed inside the learning system.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
