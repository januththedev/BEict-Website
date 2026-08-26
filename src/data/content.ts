/**
 * Single source of truth for all site content.
 *
 * VERIFICATION POLICY
 * Every fact below comes from a public, checkable source:
 *  - Wayback Machine captures of beict.lk (homepage, Sep 2024)
 *  - Wayback Machine capture of lms.beict.lk (Moodle front page, Aug 2024)
 * See CONTENT-AUDIT.md for the fact-by-fact source list.
 *
 * Do NOT add statistics, ranks, results, venue names or claims that are not
 * present in those sources. If it cannot be verified, it does not ship.
 */

export const SITE = {
  name: 'BEICT',
  longName: 'Bhanuka Ekanayaka ICT',
  owner: 'Bhanuka Ekanayaka',
  subject: 'Information & Communication Technology',
  level: 'G.C.E. Advanced Level (A/L)',
  medium: 'Sinhala Medium',
  /** Verbatim Sinhala invite from the original beict.lk hero (Sep 2024 capture). */
  sinhalaLmsInvite: 'BEICT අන්තර්ජාල ඉගෙනුම් පද්ධතිය වෙත මෙතනින් පිවිසෙන්න.',
  lmsUrl: 'https://lms.beict.lk/',
  phoneDisplay: '071 103 9004',
  phoneTel: 'tel:+94711039004',
  whatsappUrl: 'https://wa.me/94711039004',
  email: 'hello@beict.lk',
  hours: 'Mon – Sun · 8.00 AM – 8.00 PM',
  facebookUrl: 'https://www.facebook.com/bhanukaekanyaka/',
  youtubeUrl: 'https://www.youtube.com/channel/UC2vJHPJnfJNwr8DpdRMNE6g',
  /** Site developer credit — provided directly by the site owner (2026-08-26). */
  developerName: 'Januth Nimnal',
  developerUrl: 'https://januth.dev',
  /**
   * Social presence — verified live 2026-08-26 (see CONTENT-AUDIT.md):
   *  - YouTube channel page: @BhanukaEkanayaka, 80K subscribers, 332 videos
   *  - Facebook page (public, no login): 152K followers, "Leading ICT Teacher in
   *    Sri Lanka…", Horana, 100% recommend (9 reviews), intro lists the
   *    bhanuka_sir_official + BhanukaEkanayaka handles and lms.beict.lk
   *  - TikTok: handle confirmed via the Facebook intro; stats behind a captcha,
   *    so link only — no numbers published.
   */
  youtubeHandle: '@BhanukaEkanayaka',
  youtubeSubscribers: '80K',
  youtubeVideoCount: '332',
  facebookFollowers: '152K',
  facebookRecommend: '100% recommend (9 reviews)',
  tiktokUrl: 'https://www.tiktok.com/@bhanuka_sir_official',
  tiktokHandle: '@bhanuka_sir_official',
} as const

/** Latest public lessons on the YouTube channel (titles verbatim, checked
 * 2026-08-26). `id` is the YouTube video id — thumbnails come from i.ytimg.com. */
export interface LessonVideo {
  id: string
  title: string
  duration: string
  url: string
}

export const LESSON_VIDEOS: LessonVideo[] = [
  {
    id: 'eYi-Jm-SdMw',
    title: '2026 AL ICT | Logic Gate - Part 02',
    duration: '1:46:14',
    url: 'https://www.youtube.com/watch?v=eYi-Jm-SdMw',
  },
  {
    id: 'ucSt6qmxejY',
    title: '2026 AL ICT | Logic Gate - Part 01',
    duration: '1:49:57',
    url: 'https://www.youtube.com/watch?v=ucSt6qmxejY',
  },
  {
    id: 'FL_xJNMIbwM',
    title: 'AL ICT 2025 Theory | Operating System',
    duration: '0:39',
    url: 'https://www.youtube.com/watch?v=FL_xJNMIbwM',
  },
  {
    id: '2DVJFOgnN4k',
    title: 'AVENZA 2026 | BHANUKA EKANAYAKA',
    duration: '2:27',
    url: 'https://www.youtube.com/watch?v=2DVJFOgnN4k',
  },
]

export interface NavLink {
  label: string
  href: string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Batches', href: '#batches' },
  { label: 'Online Learning', href: '#lms' },
  { label: 'Community', href: '#community' },
  { label: 'Contact', href: '#contact' },
]

/** Course categories observed on the lms.beict.lk Moodle front page
 * (Wayback capture, Aug 2024). Each card links to the live LMS. */
export interface Batch {
  id: string
  name: string
  note: string
}

export const BATCHES: Batch[] = [
  {
    id: 'al-theory',
    name: 'A/L Theory Batches',
    note: 'Batch-wise courses for upcoming G.C.E. A/L years, following the national ICT syllabus in Sinhala medium.',
  },
  {
    id: 'repeat-revision',
    name: 'Repeat & Revision',
    note: 'A dedicated revision track for repeat examination candidates on the learning system.',
  },
  {
    id: 'online-resources',
    name: 'Lessons & Resources',
    note: 'Course materials and updates are published inside the BEICT online learning system.',
  },
]

export const CONTACT_CARDS = [
  {
    id: 'call',
    title: 'Call or WhatsApp',
    lines: [SITE.phoneDisplay],
    href: SITE.phoneTel,
    linkLabel: `Call ${SITE.phoneDisplay}`,
  },
  {
    id: 'email',
    title: 'Email',
    lines: [SITE.email],
    href: `mailto:${SITE.email}`,
    linkLabel: `Email ${SITE.email}`,
  },
  {
    id: 'hours',
    title: 'Working Hours',
    lines: ['Mon – Sun', '8.00 AM – 8.00 PM'],
  },
] as const

export interface Promo {
  id: string
  image: string
  alt: string
  title: string
  desc: string
  href: string
  linkLabel: string
}

export const PROMOS: Promo[] = [
  {
    id: 'facebook',
    image: '/images/banners/banner-facebook.webp',
    alt: 'BEICT banner: seminars and announcements are posted on Facebook first',
    title: 'Latest seminars & events',
    desc: 'Class announcements and seminar news are posted on the BEICT Facebook page first.',
    href: SITE.facebookUrl,
    linkLabel: 'Follow BEICT on Facebook',
  },
  {
    id: 'lms',
    image: '/images/banners/banner-lms.webp',
    alt: 'BEICT banner: learn anytime on the online learning system at lms.beict.lk',
    title: 'Learn anytime, online',
    desc: 'Lessons, resources and updates live in the BEICT online learning system.',
    href: SITE.lmsUrl,
    linkLabel: 'Open the learning system',
  },
  {
    id: 'whatsapp',
    image: '/images/banners/banner-whatsapp.webp',
    alt: 'BEICT banner: ask about new batches on WhatsApp, 071 103 9004',
    title: 'Joining a new batch?',
    desc: `Message us on WhatsApp at ${SITE.phoneDisplay} to ask about upcoming A/L ICT batches.`,
    href: SITE.whatsappUrl,
    linkLabel: 'Message on WhatsApp',
  },
]
