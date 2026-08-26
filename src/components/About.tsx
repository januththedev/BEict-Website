import { useCms } from '../cms/CmsProvider'
import { AddItemButton, EditableIcon, ItemControls, T } from '../cms/edit'
import { BookOpenIcon, MonitorIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'

export function About() {
  const cms = useCms()
  const a = cms.c.about

  return (
    <section id="about" className="bg-white py-20 sm:py-24" aria-labelledby="about-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="about-title"
          eyebrow="About BEICT"
          titleKey="about.title"
          ledeKey="about.lede"
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <Reveal className="flex flex-col justify-center gap-4 rounded-2xl border border-slate-100 bg-ice p-8">
            <T p="about.cardTitle" as="h3" className="font-display text-xl font-bold text-ink" />
            <T p="about.cardP1" as="p" multiline className="leading-relaxed" />
            <T p="about.cardP2" as="p" multiline className="leading-relaxed" />
          </Reveal>

          <Reveal delay={120}>
            <dl className="grid h-full grid-cols-1 gap-4">
              {a.facts.map((fact, i) => (
                <div
                  key={i}
                  className="cms-item relative flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card"
                >
                  <ItemControls path={`about.facts.${i}`} removable={a.facts.length > 2} />
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <EditableIcon path={`about.facts.${i}.icon`} name={fact.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <T p={`about.facts.${i}.label`} as="dt" className="text-xs font-semibold uppercase tracking-wider text-slate-body" />
                    <T p={`about.facts.${i}.value`} as="dd" className="mt-0.5 block font-semibold text-ink" />
                  </div>
                </div>
              ))}
              <AddItemButton
                listPath="about.facts"
                template={{ icon: 'star', label: 'New label', value: 'New value' }}
                label="Add fact"
              />

              <div className="flex items-start gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-card">
                  <span className="flex items-center gap-1">
                    <BookOpenIcon className="h-4 w-4" />
                    <MonitorIcon className="h-4 w-4" />
                  </span>
                </span>
                <div>
                  <T p="about.factAlevelLabel" as="dt" className="text-xs font-semibold uppercase tracking-wider text-brand-700" />
                  <T p="about.factAlevelValue" as="dd" className="mt-0.5 block font-semibold text-ink" />
                </div>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
