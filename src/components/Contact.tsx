import { useState, type FormEvent } from 'react'
import { CONTACT_CARDS, SITE } from '../data/content'
import { ChatIcon, ClockIcon, MailIcon, PhoneIcon, SendIcon } from './Icons'
import { Reveal, SectionHeading } from './ui'

const CARD_ICONS = {
  call: [PhoneIcon, ChatIcon] as const,
  email: [MailIcon] as const,
  hours: [ClockIcon] as const,
}

interface FormValues {
  name: string
  contact: string
  message: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.contact.trim()) {
    errors.contact = 'Please enter a phone number or email so we can reply.'
  }
  if (!values.message.trim()) errors.message = 'Please write a short message.'
  return errors
}

export function Contact() {
  const [values, setValues] = useState<FormValues>({ name: '', contact: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [sent, setSent] = useState(false)

  const setField = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const subject = encodeURIComponent(`Website inquiry from ${values.name.trim()}`)
    const body = encodeURIComponent(
      `Name: ${values.name.trim()}\nContact: ${values.contact.trim()}\n\n${values.message.trim()}`,
    )
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`
    setSent(true)
  }

  const inputClass = (hasError?: string) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-body/60 focus:outline-none focus:ring-2 ${
      hasError ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-200'
    }`

  return (
    <section id="contact" className="bg-white py-20 sm:py-24" aria-labelledby="contact-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="contact-title"
          eyebrow="Contact"
          title="Get in touch"
          lede={`Questions about classes or the online learning system? Reach out any day between 8.00 AM and 8.00 PM.`}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          {/* Contact channels */}
          <div className="grid content-start gap-4">
            {CONTACT_CARDS.map((card, i) => {
              const icons = CARD_ICONS[card.id as keyof typeof CARD_ICONS]
              return (
                <Reveal key={card.id} delay={i * 80}>
                  <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-ice p-5">
                    <span className="flex gap-1.5">
                      {icons.map((Icon, j) => (
                        <span
                          key={j}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-700 shadow-card"
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                      ))}
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-body">
                        {card.title}
                      </h3>
                      {'href' in card && card.href ? (
                        <a
                          href={card.href}
                          className="mt-1 block font-semibold text-ink transition-colors hover:text-brand-700"
                        >
                          {card.lines.join(' · ')}
                        </a>
                      ) : (
                        <p className="mt-1 font-semibold text-ink">{card.lines.join(' · ')}</p>
                      )}
                      {card.id === 'call' && (
                        <a
                          href={SITE.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-600"
                        >
                          <ChatIcon className="h-3.5 w-3.5" />
                          Chat on WhatsApp
                          <span className="sr-only">(opens WhatsApp in a new tab)</span>
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>

          {/* Inquiry form (opens the visitor's email app addressed to hello@beict.lk) */}
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
                    Your name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={setField('name')}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    className={inputClass(errors.name)}
                    placeholder="e.g. Nimal Perera"
                  />
                  {errors.name && (
                    <p id="contact-name-error" role="alert" className="mt-1.5 text-sm text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-channel" className="mb-1.5 block text-sm font-medium text-ink">
                    Phone or email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-channel"
                    name="contact"
                    type="text"
                    value={values.contact}
                    onChange={setField('contact')}
                    aria-invalid={Boolean(errors.contact)}
                    aria-describedby={errors.contact ? 'contact-channel-error' : undefined}
                    className={inputClass(errors.contact)}
                    placeholder="So we can reply to you"
                  />
                  {errors.contact && (
                    <p id="contact-channel-error" role="alert" className="mt-1.5 text-sm text-red-600">
                      {errors.contact}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">
                    Message <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={values.message}
                    onChange={setField('message')}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    className={`${inputClass(errors.message)} resize-y`}
                    placeholder="Ask about classes, batches or the LMS…"
                  />
                  {errors.message && (
                    <p id="contact-message-error" role="alert" className="mt-1.5 text-sm text-red-600">
                      {errors.message}
                    </p>
                  )}
                </div>

                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift active:translate-y-0">
                  Send Message
                  <SendIcon className="h-4 w-4" />
                </button>

                <p id="contact-form-note" className="text-xs leading-relaxed text-slate-body" role="status">
                  {sent
                    ? 'Your email app should now open with your message ready to send. If nothing happened, email us directly at ' +
                      SITE.email +
                      '.'
                    : `This form opens your email app with the message ready — it goes straight to ${SITE.email}.`}
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
