/**
 * CMS content model — the single source of truth for what is editable.
 *
 * The whole site renders from a CmsContent object. Defaults come from
 * `src/data/content.ts` (the verified-facts module). Saved overrides live in
 * Vercel Blob (`cms/content.json`) and are validated against THIS schema on
 * every write — unknown fields are rejected, so the page structure can never
 * be changed by CMS input (Wix-style editing within a locked layout).
 */
import {
  SITE,
  NAV_LINKS,
  BATCHES,
  PROMOS,
  LESSON_VIDEOS,
} from '../data/content.js'

// ---------- types ----------

export interface CmsLink {
  label: string
  href: string
}

export interface CmsFact {
  icon: string
  label: string
  value: string
}

export interface CmsBatchCard {
  icon: string
  name: string
  note: string
}

export interface CmsPoint {
  title: string
  body: string
}

export interface CmsPromo {
  image: string
  alt: string
  title: string
  desc: string
  href: string
  linkLabel: string
}

export interface CmsStat {
  brand: 'youtube' | 'facebook'
  label: string
  value: number
  suffix: string
  sub: string
  href: string
}

export interface CmsVideo {
  title: string
  duration: string
  url: string
  thumb: string
}

export interface CmsContactCall {
  icon: string
  title: string
  phoneDisplay: string
  phoneHref: string
  whatsappLabel: string
  whatsappHref: string
}

export interface CmsContactEmail {
  icon: string
  title: string
  email: string
}

export interface CmsContactHours {
  icon: string
  title: string
  days: string
  hours: string
}

export type SectionId =
  | 'hero'
  | 'about'
  | 'batches'
  | 'lms'
  | 'promos'
  | 'community'
  | 'contact'

export interface CmsContent {
  version: 2
  sections: Record<SectionId, { visible: boolean }>
  site: {
    name: string
    ownerLine: string
    phoneDisplay: string
    phoneHref: string
    whatsappHref: string
    email: string
    hours: string
    lmsUrl: string
    lmsLabel: string
    facebookUrl: string
    youtubeUrl: string
    tiktokUrl: string
    tiktokLabel: string
    developerName: string
    developerUrl: string
    /** When true, the /api/youtube-sync cron will refresh the Latest lessons
     * from YouTube. Defaults true so a fresh deployment "just works". */
    ytAutoSync: boolean
    /** ISO timestamp of the last successful sync run. */
    ytLastSyncAt: string | null
    /** SEO & brand identity (editable in the admin SEO & Brand section). */
    seoTitle: string
    seoDescription: string
    seoFaviconUrl: string
    seoOgImageUrl: string
  }
  nav: { links: CmsLink[] }
  hero: {
    badge: string
    subject: string
    titlePre: string
    titleName: string
    ledePre: string
    ledeLinkLabel: string
    ledeLinkHref: string
    ledePost: string
    primaryCta: CmsLink
    secondaryCtaLabel: string
    sinhala: string
  }
  about: {
    title: string
    lede: string
    cardTitle: string
    cardP1: string
    cardP2: string
    facts: CmsFact[]
    factAlevelLabel: string
    factAlevelValue: string
  }
  batches: {
    title: string
    lede: string
    cards: CmsBatchCard[]
    cardLinkLabel: string
    captionPre: string
    captionLinkLabel: string
  }
  lms: {
    eyebrow: string
    title: string
    lede: string
    sinhala: string
    ctaLabel: string
    points: CmsPoint[]
  }
  promos: {
    title: string
    lede: string
    items: CmsPromo[]
  }
  community: {
    title: string
    lede: string
    tiktokPre: string
    videosTitle: string
    stats: CmsStat[]
    videos: CmsVideo[]
  }
  contact: {
    title: string
    lede: string
    call: CmsContactCall
    email: CmsContactEmail
    hours: CmsContactHours
    formName: string
    formNamePh: string
    formChannel: string
    formChannelPh: string
    formMessage: string
    formMessagePh: string
    submitLabel: string
    statusText: string
    sentText: string
  }
  footer: {
    blurb: string
    copyright: string
    onlineLabel: string
    creditPre: string
    creditName: string
    creditUrl: string
  }
}

// ---------- limits (structure guardrails) ----------

export const LIMITS = {
  navLinks: { min: 4, max: 8 },
  facts: { min: 2, max: 4 },
  batchCards: { min: 1, max: 12 },
  points: { min: 1, max: 8 },
  promos: { min: 1, max: 6 },
  stats: { min: 1, max: 4 },
  videos: { min: 1, max: 12 },
  stringMax: 2000,
} as const

// ---------- defaults (from the verified-facts content module) ----------

export const defaultContent: CmsContent = {
  version: 2,
  sections: {
    hero: { visible: true },
    about: { visible: true },
    batches: { visible: true },
    lms: { visible: true },
    promos: { visible: true },
    community: { visible: true },
    contact: { visible: true },
  },
  site: {
    name: SITE.name,
    ownerLine: 'Bhanuka Ekanayaka ICT',
    phoneDisplay: SITE.phoneDisplay,
    phoneHref: SITE.phoneTel,
    whatsappHref: SITE.whatsappUrl,
    email: SITE.email,
    hours: SITE.hours,
    lmsUrl: SITE.lmsUrl,
    lmsLabel: 'LMS Login',
    facebookUrl: SITE.facebookUrl,
    youtubeUrl: SITE.youtubeUrl,
    tiktokUrl: SITE.tiktokUrl,
    tiktokLabel: SITE.tiktokHandle,
    developerName: SITE.developerName,
    developerUrl: SITE.developerUrl,
    ytAutoSync: true,
    ytLastSyncAt: null,
    seoTitle: `${SITE.name} — ${SITE.level} ${SITE.subject} in Sinhala medium`,
    seoDescription:
      'BEICT — Bhanuka Ekanayaka ICT. G.C.E. Advanced Level ICT classes in Sinhala medium, plus the BEICT online learning system at lms.beict.lk.',
    seoFaviconUrl: '/favicon.svg',
    seoOgImageUrl: '/og-image.svg',
  },
  nav: { links: NAV_LINKS.map((l) => ({ ...l })) },
  hero: {
    badge: `${SITE.level} · ${SITE.medium}`,
    subject: SITE.subject,
    titlePre: 'Learn ICT with',
    titleName: 'Bhanuka Ekanayaka',
    ledePre: 'BEICT prepares G.C.E. Advanced Level students in Sinhala medium — with classes and a complete online learning system at',
    ledeLinkLabel: 'lms.beict.lk',
    ledeLinkHref: SITE.lmsUrl,
    ledePost: '',
    primaryCta: { label: 'Get Started Learning Now', href: SITE.lmsUrl },
    secondaryCtaLabel: 'Contact Us',
    sinhala: SITE.sinhalaLmsInvite,
  },
  about: {
    title: 'ICT tuition, built around the A/L syllabus',
    lede: 'BEICT — Bhanuka Ekanayaka ICT — prepares G.C.E. Advanced Level students for Information & Communication Technology, taught in Sinhala medium, alongside a dedicated online learning system.',
    cardTitle: 'One teacher, one subject, done properly',
    cardP1:
      'Every class and every online course focuses on a single goal: the G.C.E. Advanced Level Information & Communication Technology examination. Lessons follow the national syllabus in Sinhala medium, so what you learn in class is exactly what you write in the exam hall.',
    cardP2:
      'Between physical classes, the BEICT learning system keeps lessons, resources and updates available online — so revision never has to wait for the next session.',
    facts: [
      { icon: 'book', label: 'Subject', value: SITE.subject },
      { icon: 'monitor', label: 'Online learning system', value: 'lms.beict.lk' },
    ],
    factAlevelLabel: 'Level & medium',
    factAlevelValue: `${SITE.level} · ${SITE.medium}`,
  },
  batches: {
    title: 'Find your place on the learning system',
    lede: 'Courses are organised by examination batch inside the BEICT online learning system. Sign in to see the batches currently open for enrolment.',
    cards: BATCHES.map((b) => ({ icon: 'book', name: b.name, note: b.note })),
    cardLinkLabel: 'Open on the LMS',
    captionPre: 'Batch categories shown here reflect the course categories published on',
    captionLinkLabel: 'lms.beict.lk',
  },
  lms: {
    eyebrow: 'BICT Online',
    title: 'The BEICT Online Learning System',
    lede: "The classroom doesn't close when the lesson ends. lms.beict.lk is where BEICT students find their courses, materials and updates — from anywhere.",
    sinhala: SITE.sinhalaLmsInvite,
    ctaLabel: 'Open the Learning System',
    points: [
      {
        title: 'Courses organised by exam batch',
        body: 'A/L ICT courses are arranged by examination year and a dedicated repeat-revision track.',
      },
      {
        title: 'Calendar & announcements',
        body: 'Class dates and updates are published inside the learning system calendar.',
      },
      {
        title: 'Your student account',
        body: 'Sign in with your BEICT student account to reach your lessons and resources.',
      },
    ],
  },
  promos: {
    title: 'Never miss an update',
    lede: 'Announcements, online lessons and new-batch news — three places to keep up with BEICT.',
    items: PROMOS.map((p) => ({
      image: p.image,
      alt: p.alt,
      title: p.title,
      desc: p.desc,
      href: p.href,
      linkLabel: p.linkLabel,
    })),
  },
  community: {
    title: 'The classroom never stops',
    lede: 'Full lessons, seminar recaps and student stories — published publicly for every A/L ICT student. Numbers below are live from the platforms.',
    tiktokPre: 'Also on TikTok:',
    videosTitle: 'Latest lessons',
    stats: [
      {
        brand: 'youtube',
        label: 'YouTube subscribers',
        value: 80,
        suffix: 'K',
        sub: `${SITE.youtubeVideoCount} videos · ${SITE.youtubeHandle}`,
        href: SITE.youtubeUrl,
      },
      {
        brand: 'facebook',
        label: 'Facebook followers',
        value: 152,
        suffix: 'K',
        sub: 'Tutor/Teacher · Horana, Sri Lanka',
        href: SITE.facebookUrl,
      },
      {
        brand: 'facebook',
        label: 'Recommend on Facebook',
        value: 100,
        suffix: '%',
        sub: SITE.facebookRecommend,
        href: SITE.facebookUrl,
      },
    ],
    videos: LESSON_VIDEOS.map((v) => ({
      title: v.title,
      duration: v.duration,
      url: v.url,
      thumb: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
    })),
  },
  contact: {
    title: 'Get in touch',
    lede: 'Questions about classes or the online learning system? Reach out any day between 8.00 AM and 8.00 PM.',
    call: {
      icon: 'phone',
      title: 'Call or WhatsApp',
      phoneDisplay: SITE.phoneDisplay,
      phoneHref: SITE.phoneTel,
      whatsappLabel: 'Chat on WhatsApp',
      whatsappHref: SITE.whatsappUrl,
    },
    email: { icon: 'mail', title: 'Email', email: SITE.email },
    hours: { icon: 'clock', title: 'Working Hours', days: 'Mon – Sun', hours: '8.00 AM – 8.00 PM' },
    formName: 'Your name',
    formNamePh: 'e.g. Nimal Perera',
    formChannel: 'Phone or email',
    formChannelPh: 'So we can reply to you',
    formMessage: 'Message',
    formMessagePh: 'Ask about classes, batches or the LMS…',
    submitLabel: 'Send Message',
    statusText: `This form opens your email app with the message ready — it goes straight to ${SITE.email}.`,
    sentText: `Your email app should now open with your message ready to send. If nothing happened, email us directly at ${SITE.email}.`,
  },
  footer: {
    blurb: `${SITE.subject} for the ${SITE.level} — in Sinhala medium. Classes plus a complete online learning system.`,
    copyright: `© ${new Date().getFullYear()} ${SITE.name} — Bhanuka Ekanayaka ICT. All rights reserved.`,
    onlineLabel: 'Online learning:',
    creditPre: 'Developed by',
    creditName: SITE.developerName,
    creditUrl: SITE.developerUrl,
  },
}

// ---------- validation ----------

const ALLOWED_URL = /^(https:\/\/|http:\/\/localhost|tel:|mailto:|#|\/)/i
const ICON_KEYS = new Set([
  'book', 'monitor', 'repeat', 'phone', 'mail', 'clock', 'chat', 'send',
  'star', 'users', 'calendar', 'globe', 'code', 'award', 'zap', 'graduation',
])

export function sanitizeUrl(u: unknown, fallback = '#'): string {
  if (typeof u !== 'string' || u.trim() === '') return fallback
  return ALLOWED_URL.test(u.trim()) ? u.trim() : fallback
}

function str(v: unknown, fallback: string, max: number = LIMITS.stringMax): string {
  if (typeof v !== 'string') return fallback
  const clean = v.replace(/\u0000/g, '').slice(0, max)
  return clean
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? Math.max(0, Math.min(1_000_000, Math.round(n))) : fallback
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback
}

function icon(v: unknown, fallback: string): string {
  return typeof v === 'string' && ICON_KEYS.has(v) ? v : fallback
}

function arr<T>(v: unknown, map: (item: unknown, i: number) => T | null, max: number, fallback: T[]): T[] {
  if (!Array.isArray(v)) return fallback
  return v.slice(0, max).map(map).filter((x): x is T => x !== null)
}

function link(v: unknown, fallback: CmsLink): CmsLink {
  const o = (v ?? {}) as Record<string, unknown>
  return { label: str(o.label, fallback.label, 120), href: sanitizeUrl(o.href, fallback.href) }
}

/**
 * Validates + sanitizes an untrusted JSON payload against the schema.
 * Returns a fully-typed CmsContent, or null if the payload is unusable.
 * Unknown properties are ignored — the page structure cannot be altered.
 */
export function validateContent(input: unknown): CmsContent | null {
  if (typeof input !== 'object' || input === null) return null
  const d = defaultContent
  const o = input as Record<string, any>

  const out: CmsContent = {
    version: 2,
    sections: { ...d.sections },
    site: {
      name: str(o.site?.name, d.site.name, 40),
      ownerLine: str(o.site?.ownerLine, d.site.ownerLine, 80),
      phoneDisplay: str(o.site?.phoneDisplay, d.site.phoneDisplay, 30),
      phoneHref: sanitizeUrl(o.site?.phoneHref, d.site.phoneHref),
      whatsappHref: sanitizeUrl(o.site?.whatsappHref, d.site.whatsappHref),
      email: str(o.site?.email, d.site.email, 120),
      hours: str(o.site?.hours, d.site.hours, 80),
      lmsUrl: sanitizeUrl(o.site?.lmsUrl, d.site.lmsUrl),
      lmsLabel: str(o.site?.lmsLabel, d.site.lmsLabel, 60),
      facebookUrl: sanitizeUrl(o.site?.facebookUrl, d.site.facebookUrl),
      youtubeUrl: sanitizeUrl(o.site?.youtubeUrl, d.site.youtubeUrl),
      tiktokUrl: sanitizeUrl(o.site?.tiktokUrl, d.site.tiktokUrl),
      tiktokLabel: str(o.site?.tiktokLabel, d.site.tiktokLabel, 60),
      developerName: str(o.site?.developerName, d.site.developerName, 80),
      developerUrl: sanitizeUrl(o.site?.developerUrl, d.site.developerUrl),
      ytAutoSync: bool(o.site?.ytAutoSync, d.site.ytAutoSync),
      ytLastSyncAt:
        typeof o.site?.ytLastSyncAt === 'string' && o.site.ytLastSyncAt.length > 0
          ? o.site.ytLastSyncAt
          : d.site.ytLastSyncAt,
      seoTitle: str(o.site?.seoTitle, d.site.seoTitle, 200),
      seoDescription: str(o.site?.seoDescription, d.site.seoDescription, 500),
      seoFaviconUrl: sanitizeUrl(o.site?.seoFaviconUrl, d.site.seoFaviconUrl),
      seoOgImageUrl: sanitizeUrl(o.site?.seoOgImageUrl, d.site.seoOgImageUrl),
    },
    nav: {
      links: arr(
        o.nav?.links,
        (item, i) => {
          const l = item as Record<string, unknown>
          const fb = d.nav.links[Math.min(i, d.nav.links.length - 1)]
          return { label: str(l?.label, fb.label, 40), href: str(l?.href, fb.href, 60).startsWith('#') || str(l?.href, fb.href, 60).startsWith('/') ? str(l?.href, fb.href, 60) : fb.href }
        },
        LIMITS.navLinks.max,
        d.nav.links,
      ),
    },
    hero: {
      badge: str(o.hero?.badge, d.hero.badge, 120),
      subject: str(o.hero?.subject, d.hero.subject, 120),
      titlePre: str(o.hero?.titlePre, d.hero.titlePre, 120),
      titleName: str(o.hero?.titleName, d.hero.titleName, 80),
      ledePre: str(o.hero?.ledePre, d.hero.ledePre, 400),
      ledeLinkLabel: str(o.hero?.ledeLinkLabel, d.hero.ledeLinkLabel, 60),
      ledeLinkHref: sanitizeUrl(o.hero?.ledeLinkHref, d.hero.ledeLinkHref),
      ledePost: str(o.hero?.ledePost, d.hero.ledePost, 200),
      primaryCta: link(o.hero?.primaryCta, d.hero.primaryCta),
      secondaryCtaLabel: str(o.hero?.secondaryCtaLabel, d.hero.secondaryCtaLabel, 60),
      sinhala: str(o.hero?.sinhala, d.hero.sinhala, 300),
    },
    about: {
      title: str(o.about?.title, d.about.title, 160),
      lede: str(o.about?.lede, d.about.lede, 500),
      cardTitle: str(o.about?.cardTitle, d.about.cardTitle, 160),
      cardP1: str(o.about?.cardP1, d.about.cardP1, LIMITS.stringMax),
      cardP2: str(o.about?.cardP2, d.about.cardP2, LIMITS.stringMax),
      facts: arr(
        o.about?.facts,
        (item, i) => {
          const f = item as Record<string, unknown>
          const fb = d.about.facts[Math.min(i, d.about.facts.length - 1)]
          return { icon: icon(f?.icon, fb.icon), label: str(f?.label, fb.label, 80), value: str(f?.value, fb.value, 160) }
        },
        LIMITS.facts.max,
        d.about.facts,
      ),
      factAlevelLabel: str(o.about?.factAlevelLabel, d.about.factAlevelLabel, 80),
      factAlevelValue: str(o.about?.factAlevelValue, d.about.factAlevelValue, 160),
    },
    batches: {
      title: str(o.batches?.title, d.batches.title, 160),
      lede: str(o.batches?.lede, d.batches.lede, 500),
      cards: arr(
        o.batches?.cards,
        (item, i) => {
          const c = item as Record<string, unknown>
          const fb = d.batches.cards[Math.min(i, d.batches.cards.length - 1)]
          return { icon: icon(c?.icon, fb.icon), name: str(c?.name, fb.name, 120), note: str(c?.note, fb.note, 400) }
        },
        LIMITS.batchCards.max,
        d.batches.cards,
      ),
      cardLinkLabel: str(o.batches?.cardLinkLabel, d.batches.cardLinkLabel, 60),
      captionPre: str(o.batches?.captionPre, d.batches.captionPre, 200),
      captionLinkLabel: str(o.batches?.captionLinkLabel, d.batches.captionLinkLabel, 60),
    },
    lms: {
      eyebrow: str(o.lms?.eyebrow, d.lms.eyebrow, 60),
      title: str(o.lms?.title, d.lms.title, 160),
      lede: str(o.lms?.lede, d.lms.lede, 500),
      sinhala: str(o.lms?.sinhala, d.lms.sinhala, 300),
      ctaLabel: str(o.lms?.ctaLabel, d.lms.ctaLabel, 80),
      points: arr(
        o.lms?.points,
        (item, i) => {
          const p = item as Record<string, unknown>
          const fb = d.lms.points[Math.min(i, d.lms.points.length - 1)]
          return { title: str(p?.title, fb.title, 120), body: str(p?.body, fb.body, 400) }
        },
        LIMITS.points.max,
        d.lms.points,
      ),
    },
    promos: {
      title: str(o.promos?.title, d.promos.title, 160),
      lede: str(o.promos?.lede, d.promos.lede, 500),
      items: arr(
        o.promos?.items,
        (item, i) => {
          const p = item as Record<string, unknown>
          const fb = d.promos.items[Math.min(i, d.promos.items.length - 1)]
          const img = typeof p?.image === 'string' && (p.image.startsWith('/') || p.image.startsWith('https://')) ? p.image : fb.image
          return {
            image: img,
            alt: str(p?.alt, fb.alt, 200),
            title: str(p?.title, fb.title, 120),
            desc: str(p?.desc, fb.desc, 400),
            href: sanitizeUrl(p?.href, fb.href),
            linkLabel: str(p?.linkLabel, fb.linkLabel, 80),
          }
        },
        LIMITS.promos.max,
        d.promos.items,
      ),
    },
    community: {
      title: str(o.community?.title, d.community.title, 160),
      lede: str(o.community?.lede, d.community.lede, 500),
      tiktokPre: str(o.community?.tiktokPre, d.community.tiktokPre, 80),
      videosTitle: str(o.community?.videosTitle, d.community.videosTitle, 80),
      stats: arr(
        o.community?.stats,
        (item, i) => {
          const s = item as Record<string, unknown>
          const fb = d.community.stats[Math.min(i, d.community.stats.length - 1)]
          return {
            brand: s?.brand === 'youtube' ? 'youtube' : 'facebook',
            label: str(s?.label, fb.label, 80),
            value: num(s?.value, fb.value),
            suffix: str(s?.suffix, fb.suffix, 4),
            sub: str(s?.sub, fb.sub, 120),
            href: sanitizeUrl(s?.href, fb.href),
          }
        },
        LIMITS.stats.max,
        d.community.stats,
      ),
      videos: arr(
        o.community?.videos,
        (item, i) => {
          const v = item as Record<string, unknown>
          const fb = d.community.videos[Math.min(i, d.community.videos.length - 1)]
          const url = sanitizeUrl(v?.url, fb.url)
          if (!url.startsWith('https://')) return null
          const thumb =
            typeof v?.thumb === 'string' && v.thumb.startsWith('https://')
              ? v.thumb
              : `https://i.ytimg.com/vi/${extractYouTubeId(url) ?? extractYouTubeId(fb.url) ?? ''}/hqdefault.jpg`
          return {
            title: str(v?.title, fb.title, 160),
            duration: str(v?.duration, fb.duration, 12),
            url,
            thumb,
          }
        },
        LIMITS.videos.max,
        d.community.videos,
      ),
    },
    contact: {
      title: str(o.contact?.title, d.contact.title, 160),
      lede: str(o.contact?.lede, d.contact.lede, 500),
      call: {
        icon: icon(o.contact?.call?.icon, d.contact.call.icon),
        title: str(o.contact?.call?.title, d.contact.call.title, 80),
        phoneDisplay: str(o.contact?.call?.phoneDisplay, d.contact.call.phoneDisplay, 30),
        phoneHref: sanitizeUrl(o.contact?.call?.phoneHref, d.contact.call.phoneHref),
        whatsappLabel: str(o.contact?.call?.whatsappLabel, d.contact.call.whatsappLabel, 60),
        whatsappHref: sanitizeUrl(o.contact?.call?.whatsappHref, d.contact.call.whatsappHref),
      },
      email: {
        icon: icon(o.contact?.email?.icon, d.contact.email.icon),
        title: str(o.contact?.email?.title, d.contact.email.title, 80),
        email: str(o.contact?.email?.email, d.contact.email.email, 120),
      },
      hours: {
        icon: icon(o.contact?.hours?.icon, d.contact.hours.icon),
        title: str(o.contact?.hours?.title, d.contact.hours.title, 80),
        days: str(o.contact?.hours?.days, d.contact.hours.days, 40),
        hours: str(o.contact?.hours?.hours, d.contact.hours.hours, 40),
      },
      formName: str(o.contact?.formName, d.contact.formName, 80),
      formNamePh: str(o.contact?.formNamePh, d.contact.formNamePh, 80),
      formChannel: str(o.contact?.formChannel, d.contact.formChannel, 80),
      formChannelPh: str(o.contact?.formChannelPh, d.contact.formChannelPh, 80),
      formMessage: str(o.contact?.formMessage, d.contact.formMessage, 80),
      formMessagePh: str(o.contact?.formMessagePh, d.contact.formMessagePh, 120),
      submitLabel: str(o.contact?.submitLabel, d.contact.submitLabel, 60),
      statusText: str(o.contact?.statusText, d.contact.statusText, 300),
      sentText: str(o.contact?.sentText, d.contact.sentText, 300),
    },
    footer: {
      blurb: str(o.footer?.blurb, d.footer.blurb, 300),
      copyright: str(o.footer?.copyright, d.footer.copyright, 200),
      onlineLabel: str(o.footer?.onlineLabel, d.footer.onlineLabel, 60),
      creditPre: str(o.footer?.creditPre, d.footer.creditPre, 40),
      creditName: str(o.footer?.creditName, d.footer.creditName, 80),
      creditUrl: sanitizeUrl(o.footer?.creditUrl, d.footer.creditUrl),
    },
  }

  for (const id of Object.keys(d.sections) as SectionId[]) {
    out.sections[id] = { visible: bool(o.sections?.[id]?.visible, d.sections[id].visible) }
  }

  return out
}

export function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/)
  return m ? m[1] : null
}
