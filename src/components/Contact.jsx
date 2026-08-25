import { useState } from 'react'
import { SITE } from '../data/content.js'
import { Button, Reveal, SectionHeading } from './ui.jsx'

const CHANNELS = [
  {
    label: 'Call',
    value: SITE.phoneDisplay,
    href: SITE.phoneTel,
    icon: (
      <path d="M5 4h4l1.7 4.2-2 1.6a13 13 0 0 0 5.5 5.5l1.6-2L20 15v4a1.8 1.8 0 0 1-2 1.8A16.8 16.8 0 0 1 3.2 6 1.8 1.8 0 0 1 5 4Z" />
    ),
  },
  {
    label: 'WhatsApp',
    value: 'Message on WhatsApp',
    href: SITE.whatsappUrl,
    icon: (
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Zm-3 5.5c.3 0 .7 0 1 .7l.7 1.6c.1.3 0 .6-.2.8l-.5.6c.5 1.1 1.4 2 2.6 2.5l.6-.5c.2-.2.5-.3.8-.2l1.6.7c.6.2.7.6.7 1a2 2 0 0 1-2 2A8 8 0 0 1 9 8.5a2 2 0 0 1 0-2Z" />
    ),
  },
  {
    label: 'Telegram',
    value: 'Join t.me/bealict',
    href: SITE.telegramUrl,
    icon: (
      <path d="M21.9 4.6 18.8 19c-.2 1-.9 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-1 .5l.4-4.7 8.4-7.6c.4-.3-.1-.5-.6-.2L7.2 12.6l-4.5-1.4c-1-.3-1-1 .2-1.4l17.6-6.8c.8-.3 1.5.2 1.4 1.6Z" />
    ),
  },
  {
    label: 'Email',
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    icon: (
      <path d="M3.5 6.5h17v11h-17v-11Zm.5.5 8 6 8-6" />
    ),
  },
]

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy-800">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-red-600">
          <svg viewBox="0 0 16 16" fill="currentColor" className="size-4 shrink-0" aria-hidden>
            <path d="M8 1.5 15 14H1L8 1.5ZM8 6v4M8 11.8v.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

const inputCls = (invalid) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 ${
    invalid ? 'border-red-400' : 'border-slate-200 hover:border-brand-300'
  }`

export default function Contact() {
  const [values, setValues] = useState({ name: '', contact: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sent

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: undefined }))
  }

  function validate() {
    const next = {}
    if (!values.name.trim()) next.name = 'Please enter your name.'
    if (!values.contact.trim()) {
      next.contact = 'Add your email or phone number so Bhanuka Sir can reply.'
    }
    if (values.message.trim().length < 10) {
      next.message = 'Please write a little more (at least 10 characters).'
    }
    return next
  }

  function onSubmit(e) {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    // No backend is available for this static site — compose the message in
    // the visitor's own email app instead.
    const subject = encodeURIComponent(`BEICT enquiry from ${values.name.trim()}`)
    const body = encodeURIComponent(
      `Name: ${values.name.trim()}\nReply via: ${values.contact.trim()}\n\n${values.message.trim()}`,
    )
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`
    setStatus('sent')
  }

  return (
    <section
      id="contact"
      className="relative scroll-mt-20 overflow-hidden bg-ice py-20 sm:py-24"
      aria-labelledby="contact-title"
    >
      <div className="glow-orb bottom-[-100px] left-[-80px] size-[320px] bg-brand-300/30" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Contact"
            title={<span id="contact-title">Get in touch</span>}
            lead="Have a question about classes or the BEICT learning system? Reach out — phone, WhatsApp or email all work."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-14">
          {/* Channels */}
          <Reveal className="space-y-4 lg:col-span-2">
            {CHANNELS.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-brand text-ink shadow-md shadow-brand-600/25" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6">
                    {channel.icon}
                  </svg>
                </span>
                <span>
                  <span className="block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    {channel.label}
                  </span>
                  <span className="block font-display font-semibold text-ink group-hover:text-cyan-300">
                    {channel.value}
                  </span>
                </span>
              </a>
            ))}
            <p className="pt-2 text-sm leading-relaxed text-slate-500">
              Prefer the online system? Sign in at{' '}
              <a href={SITE.lmsUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-500">
                lms.beict.lk
              </a>{' '}
              any time.
            </p>
          </Reveal>

          {/* Form */}
          <Reveal delay={120} className="lg:col-span-3">
            <form
              onSubmit={onSubmit}
              noValidate
              className="rounded-2xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-900/5 sm:p-8"
            >
              {status === 'sent' ? (
                <div role="status" className="flex flex-col items-center gap-4 py-10 text-center">
                  <span className="grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-8">
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                  <h3 className="font-display text-xl font-bold text-navy-800">Your email app should be opening…</h3>
                  <p className="max-w-md text-sm leading-relaxed text-slate-600">
                    Your message is ready to send to{' '}
                    <strong className="text-navy-800">{SITE.email}</strong>. If nothing opened, you
                    can also call {SITE.phoneDisplay} or use WhatsApp instead.
                  </p>
                  <Button variant="secondary" as="button" type="button" onClick={() => setStatus('idle')}>
                    Write another message
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="name" label="Your name" error={errors.name}>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="e.g. Nimesh Perera"
                        value={values.name}
                        onChange={set('name')}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className={inputCls(Boolean(errors.name))}
                      />
                    </Field>
                    <Field id="reply-contact" label="Email or phone number" error={errors.contact}>
                      <input
                        id="reply-contact"
                        name="contact"
                        type="text"
                        autoComplete="email"
                        placeholder="so we can reply to you"
                        value={values.contact}
                        onChange={set('contact')}
                        aria-invalid={Boolean(errors.contact)}
                        aria-describedby={errors.contact ? 'reply-contact-error' : undefined}
                        className={inputCls(Boolean(errors.contact))}
                      />
                    </Field>
                  </div>
                  <Field id="message" label="Message" error={errors.message}>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Ask about classes, the syllabus or the BEICT LMS…"
                      value={values.message}
                      onChange={set('message')}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      className={`${inputCls(Boolean(errors.message))} resize-y`}
                    />
                  </Field>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs leading-relaxed text-slate-500 sm:max-w-[60%]">
                      This opens your own email app with the message prepared — no details are
                      stored on this website.
                    </p>
                    <Button as="button" type="submit" variant="primary" className="px-8 py-3.5">
                      Send Message
                      <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden>
                        <path d="M18 2 9 11M18 2l-5.5 16L9 11 2 7.5 18 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
