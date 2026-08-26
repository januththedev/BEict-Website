import { useCms } from '../cms/CmsProvider'
import { AddItemButton, EditableImage, ItemControls, T } from '../cms/edit'
import { ArrowUpRightIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'
import { useTilt } from '../hooks/useTilt'

function PromoCard({ path, index }: { path: string; index: number }) {
  const cms = useCms()
  const promo = cms.c.promos.items[index]
  const tilt = useTilt<HTMLAnchorElement>(5)

  return (
    <Reveal delay={index * 90} className="h-full">
      <a
        ref={tilt}
        href={promo.href}
        target="_blank"
        rel="noopener noreferrer"
        className="cms-item group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-200 hover:border-brand-200 hover:shadow-lift"
        aria-label={`${promo.linkLabel} (opens in a new tab)`}
      >
        <ItemControls path={path} removable={cms.c.promos.items.length > 1} />
        <EditableImage
          p={`${path}.image`}
          src={promo.image}
          alt={promo.alt}
          className="aspect-[3/1] w-full object-cover"
        />
        <span className="flex flex-1 flex-col gap-2 p-6">
          <T p={`${path}.title`} as="span" className="block font-display text-base font-bold text-ink" />
          <T p={`${path}.desc`} as="span" multiline className="block text-sm leading-relaxed" />
          <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-brand-700">
            <T p={`${path}.linkLabel`} />
            <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </span>
      </a>
    </Reveal>
  )
}

export function PromoBanners() {
  const cms = useCms()
  const p = cms.c.promos

  return (
    <section className="bg-white py-20 sm:py-24" aria-labelledby="promos-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="promos-title" eyebrow="Stay connected" titleKey="promos.title" ledeKey="promos.lede" />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {p.items.map((_, i) => (
            <PromoCard key={i} path={`promos.items.${i}`} index={i} />
          ))}
        </div>
        <AddItemButton
          listPath="promos.items"
          template={{
            image: '/images/banners/banner-facebook.webp',
            alt: 'New promotional banner',
            title: 'New banner',
            desc: 'Describe this banner for visitors.',
            href: 'https://www.facebook.com/bhanukaekanyaka/',
            linkLabel: 'Learn more',
          }}
          label="Add banner"
        />
      </div>
    </section>
  )
}
