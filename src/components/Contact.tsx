import { useState, type FormEvent } from 'react'
import { useCms } from '../cms/CmsProvider'
import { EditableIcon, T } from '../cms/edit'
import { ChatIcon, SendIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'

interface FormValues {
  name: string
  contact: string
  message: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

export function Contact() {
  const cms = useCms()
  const ct = cms.c.contact
  const [values, setValues] = useState<FormValues>({ name: '', contact: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [sent, setSent] = useState(false)

  const setField = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const nextErrors: FormErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Please enter your name.'
    if (!values.contact.trim()) nextErrors.contact = 'Please enter a phone number or email so we can reply.'
    if (!values.message.trim()) nextErrors.message = 'Please write a short message.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const subject = encodeURIComponent(`Website inquiry from ${values.name.trim()}`)
    const body = encodeURIComponent(
      `Name: ${values.name.trim()}\nContact: ${values.contact.trim()}\n\n${values.message.trim()}`,
    )
    window.location.href = `mailto:${ct.email.email}?subject=${subject}&body=${body}`
    setSent(true)
  }

  const inputClass = (hasError?: string) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-body/60 focus:outline-none focus:ring-2 ${
      hasError ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-200'
    }`

  return (
    <section id="contact" className="bg-white py-20 sm:py-24" aria-labelledby="contact-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="contact-title" eyebrow="Contact" titleKey="contact.title" ledeKey="contact.lede" variant="slide-x" from="right" />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          {/* Contact channels */}
          <div className="grid content-start gap-4">
            <Reveal>
              <div className="cms-item relative flex items-start gap-4 rounded-2xl border border-slate-100 bg-ice p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-700 shadow-card">
                  <EditableIcon path="contact.call.icon" name={ct.call.icon} className="h-5 w-5" />
                </span>
                <div>
                  <T p="contact.call.title" as="h3" className="block text-xs font-semibold uppercase tracking-wider text-slate-body" />
                  <a href={ct.call.phoneHref} className="mt-1 block font-semibold text-ink transition-colors hover:text-brand-700">
                    <T p="contact.call.phoneDisplay" />
                  </a>
                  <a
                    href={ct.call.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-600"
                  >
                    <ChatIcon className="h-3.5 w-3.5" />
                    <T p="contact.call.whatsappLabel" />
                    <span className="sr-only">(opens WhatsApp in a new tab)</span>
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="cms-item relative flex items-start gap-4 rounded-2xl border border-slate-100 bg-ice p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-700 shadow-card">
                  <EditableIcon path="contact.email.icon" name={ct.email.icon} className="h-5 w-5" />
                </span>
                <div>
                  <T p="contact.email.title" as="h3" className="block text-xs font-semibold uppercase tracking-wider text-slate-body" />
                  <a href={`mailto:${ct.email.email}`} className="mt-1 block font-semibold text-ink transition-colors hover:text-brand-700">
                    <T p="contact.email.email" />
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="cms-item relative flex items-start gap-4 rounded-2xl border border-slate-100 bg-ice p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-700 shadow-card">
                  <EditableIcon path="contact.hours.icon" name={ct.hours.icon} className="h-5 w-5" />
                </span>
                <div>
                  <T p="contact.hours.title" as="h3" className="block text-xs font-semibold uppercase tracking-wider text-slate-body" />
                  <p className="mt-1 font-semibold text-ink">
                    <T p="contact.hours.days" /> · <T p="contact.hours.hours" />
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Inquiry form */}
          <Reveal delay={120}>
            <form
              onSubmit={onSubmit}
              noValidate
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card sm:p-8"
              aria-describedby="contact-form-note"
            >
              <div className="grid gap-5">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-ink">
                    <T p="contact.formName" /> <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder={ct.formNamePh}
                    value={values.name}
                    onChange={setField('name')}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    className={inputClass(errors.name)}
                  />
                  {errors.name && (
                    <p id="contact-name-error" role="alert" className="mt-1.5 text-sm text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-channel" className="mb-1.5 block text-sm font-medium text-ink">
                    <T p="contact.formChannel" /> <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-channel"
                    name="contact"
                    type="text"
                    placeholder={ct.formChannelPh}
                    value={values.contact}
                    onChange={setField('contact')}
                    aria-invalid={Boolean(errors.contact)}
                    aria-describedby={errors.contact ? 'contact-channel-error' : undefined}
                    className={inputClass(errors.contact)}
                  />
                  {errors.contact && (
                    <p id="contact-channel-error" role="alert" className="mt-1.5 text-sm text-red-600">
                      {errors.contact}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">
                    <T p="contact.formMessage" /> <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    placeholder={ct.formMessagePh}
                    value={values.message}
                    onChange={setField('message')}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    className={`${inputClass(errors.message)} resize-y`}
                  />
                  {errors.message && (
                    <p id="contact-message-error" role="alert" className="mt-1.5 text-sm text-red-600">
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift active:translate-y-0"
                >
                  <T p="contact.submitLabel" />
                  <SendIcon className="h-4 w-4" />
                </button>

                <p id="contact-form-note" className="text-xs leading-relaxed text-slate-body" role="status">
                  {sent ? <T p="contact.sentText" /> : <T p="contact.statusText" />}
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
