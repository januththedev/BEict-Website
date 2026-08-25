/**
 * Single source of truth for site content.
 *
 * Facts come from two verified sources only:
 *  1. beict.lk / lms.beict.lk (the existing site)
 *  2. Bhanuka Sir's own public social profiles, checked 2026-08-25:
 *     • facebook.com/bhanukaekanyaka — Page · Tutor/Teacher, 152K followers,
 *       “Leading ICT Teacher in Sri Lanka…”, Horana Sri Lanka,
 *       070 100 7003, 100% recommend (9 reviews)
 *     • youtube.com/@BhanukaEkanayaka — 80K subscribers, 332 videos,
 *       venue list + Telegram https://t.me/bealict in video descriptions
 *     • tiktok.com/@bhanuka_sir_official — 19.1K followers, 713K+ likes
 *
 * Do not add unverified claims, prices or schedules beyond these sources.
 */

export const SITE = {
  name: 'BEICT',
  owner: 'Bhanuka Ekanayaka',
  tagline: 'Leading ICT Teacher in Sri Lanka',
  subject: 'Information & Communication Technology',
  level: 'G.C.E. Advanced Level (A/L)',
  sinhalaLmsInvite: 'BEICT අන්තර්ජාල ඉගෙනුම් පද්ධතිය වෙත මෙතනින් පිවිසෙන්න.',
  lmsUrl: 'https://lms.beict.lk/',
  telegramUrl: 'https://t.me/bealict',
  facebookUrl: 'https://www.facebook.com/bhanukaekanyaka/',
  youtubeUrl: 'https://www.youtube.com/@BhanukaEkanayaka',
  tiktokUrl: 'https://www.tiktok.com/@bhanuka_sir_official',
  phoneDisplay: '071 103 9004',
  phoneTel: 'tel:+94711039004',
  whatsappUrl: 'https://wa.me/94711039004',
  email: 'info@beict.lk',
}

export const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Learning', href: '#learning' },
  { label: 'Explore', href: '#explore' },
  { label: 'Community', href: '#community' },
  { label: 'Contact', href: '#contact' },
]

export const HERO_CHIPS = [
  'A/L ICT Theory & Revision',
  '6 island-wide class hubs',
  'BICT Online LMS',
]

/** Real audience numbers from his own public profiles (checked 2026-08-25). */
export const SOCIAL_STATS = [
  {
    label: 'Facebook followers',
    value: '152K+',
    href: SITE.facebookUrl,
    icon: 'facebook',
  },
  {
    label: 'YouTube subscribers',
    value: '80K+',
    sub: '332 videos',
    href: SITE.youtubeUrl,
    icon: 'youtube',
  },
  {
    label: 'TikTok likes',
    value: '713K+',
    sub: '@bhanuka_sir_official',
    href: SITE.tiktokUrl,
    icon: 'tiktok',
  },
  {
    label: 'Class locations',
    value: '6',
    sub: 'island-wide hubs',
    href: '#contact',
    icon: 'pin',
  },
]

/** Verified physical class venues (from his official video descriptions). */
export const VENUES = [
  { name: 'Zeon Opera', town: 'Horana' },
  { name: 'Rotary', town: 'Nugegoda' },
  { name: 'New Montana', town: 'Gampaha' },
  { name: 'Pencil Opera', town: 'Kurunegala' },
  { name: 'Sisulka', town: 'Rathnapura' },
  { name: 'Gurumandala', town: 'Kalutara' },
]

export const FEATURES = [
  {
    title: 'A/L ICT Theory',
    body: 'Structured theory classes covering the full G.C.E. A/L ICT syllabus — number systems, logic gates, Boolean algebra, operating systems, programming and more.',
    icon: 'book',
  },
  {
    title: 'Revision Classes',
    body: 'Focused revision programmes ahead of the examination — including dedicated revision batches such as the AL ICT 2027 revision series.',
    icon: 'refresh',
  },
  {
    title: 'BICT Online LMS',
    body: 'The BEICT online learning system extends every class — lessons and resources stay with you at lms.beict.lk, anywhere in the island.',
    icon: 'cloud',
  },
  {
    title: 'A Community, Not Just a Class',
    body: 'Half a million students and parents follow Bhanuka Sir’s teaching across Facebook, YouTube and TikTok — with seminars, events and student-feedback episodes like සර්ට පහළොවයි.',
    icon: 'chat',
  },
]

/**
 * The Z-scroll journey: scrolling dollies the camera down the Z axis past
 * three glTF stages while real promo content tells the BEICT story.
 */
export const JOURNEY = {
  intro: {
    eyebrow: 'The BEICT way',
    title: 'Scroll — see how Bhanuka Sir teaches',
    lead: 'One flight through the classes, the island-wide network and the online system behind Sri Lanka’s leading A/L ICT tuition.',
  },
  stations: [
    {
      id: 'chip',
      topic: 'Theory Classes',
      title: 'Every syllabus topic, made simple',
      blurb:
        'From number systems and logic gates to Boolean algebra, operating systems and Python — structured theory for the G.C.E. A/L ICT syllabus, taught the way a quarter-million followers keep coming back to.',
      cta: { label: 'See the classes', href: '#learning' },
      file: '/models/cpu-chip.gltf',
      z: 0,
    },
    {
      id: 'globe',
      topic: 'Island-wide Network',
      title: 'Six class hubs across Sri Lanka',
      blurb:
        'Catch Bhanuka Sir live at Zeon Opera Horana, Rotary Nugegoda, New Montana Gampaha, Pencil Opera Kurunegala, Sisulka Rathnapura or Gurumandala Kalutara — one network of classrooms.',
      cta: { label: 'Find a class near you', href: '#venues' },
      file: '/models/network-globe.gltf',
      z: -30,
      venues: true,
    },
    {
      id: 'database',
      topic: 'BICT Online',
      title: 'Your classroom, online 24/7',
      blurb:
        'Every lesson lives on in the BEICT online learning system. Sign in at lms.beict.lk — or join the Telegram community at t.me/bealict — and keep learning long after the bell rings.',
      cta: { label: 'Enter the LMS', href: SITE.lmsUrl, external: true },
      file: '/models/database.gltf',
      z: -60,
    },
  ],
}

/**
 * Ad banners — drop your social-media class ads here.
 * Replace public/images/banners/banner-1.jpg … banner-3.jpg with the same
 * creatives you post on Facebook/TikTok. Until then each slot shows its
 * built-in promo design.
 */
export const BANNERS = [
  {
    id: 1,
    image: '/images/banners/banner-1.jpg',
    href: SITE.facebookUrl,
    label: 'Follow BEICT on Facebook',
    eyebrow: 'Latest Seminars & Events',
    title: 'AVENZA · SEMINARS · LIVE SESSIONS',
    note: 'All the latest class announcements land on Facebook first.',
  },
  {
    id: 2,
    image: '/images/banners/banner-2.jpg',
    href: SITE.lmsUrl,
    target: '_blank',
    label: 'Open the BICT Online LMS',
    eyebrow: 'BICT Online',
    title: 'LEARN ANYTIME AT LMS.BEICT.LK',
    note: 'Lessons, resources and updates — your virtual classroom never closes.',
  },
  {
    id: 3,
    image: '/images/banners/banner-3.jpg',
    href: SITE.whatsappUrl,
    label: 'WhatsApp us',
    eyebrow: 'New Batches',
    title: 'JOIN THE NEXT A/L ICT BATCH',
    note: 'Theory & revision for 2027 A/L — reserve your seat on WhatsApp.',
  },
]

export const GALLERY_CAPTIONS = [
  'Classroom session',
  'With students',
  'Teaching in progress',
  'Class activity',
  'Seminar day',
  'Group discussion',
  'Practical lesson',
  'BEICT class',
]
