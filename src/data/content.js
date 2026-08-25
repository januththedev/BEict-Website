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
  { label: 'Home', href: '#chapter-hero' },
  { label: 'About', href: '#chapter-identity' },
  { label: 'Syllabus', href: '#chapter-vault' },
  { label: 'Centres', href: '#chapter-map' },
  { label: 'Community', href: '#chapter-community' },
  { label: 'Contact', href: '#contact' },
]

/**
 * The full-site Z-scroll. The 3D track is one tall page; each chapter owns
 * a [start, end] slice of the total scroll progress. The camera, scene
 * colours and overlay panels are all driven from these spans.
 */
export const CHAPTERS = [
  { id: 'hero', start: 0.0, end: 0.1 },
  { id: 'identity', start: 0.1, end: 0.22 },
  { id: 'track', start: 0.22, end: 0.32 },
  { id: 'core', start: 0.32, end: 0.48 },
  { id: 'vault', start: 0.48, end: 0.64 },
  { id: 'map', start: 0.64, end: 0.76 },
  { id: 'community', start: 0.76, end: 0.84 },
  { id: 'gallery', start: 0.84, end: 0.94 },
]
export const TRACK_VH = 1500 // height of the 3D scroll track, in vh

/** Verified physical class hubs — coordinates from Google Maps place lookups
 * (checked 2026-08-25). `query` is used for the official Maps deep-link. */
export const VENUES = [
  {
    name: 'Zeon Opera',
    town: 'Horana',
    lat: 6.7178,
    lng: 80.0679,
    query: 'Zeon Opera, Horana',
  },
  {
    name: 'Rotary',
    town: 'Nugegoda',
    lat: 6.871,
    lng: 79.8906,
    query: 'Rotary Hall, Nugegoda',
  },
  {
    name: 'New Montana',
    town: 'Gampaha',
    lat: 7.0931,
    lng: 79.989,
    query: 'New Montana Class, Gampaha',
  },
  {
    name: 'Pencil Opera',
    town: 'Kurunegala',
    lat: 7.4843,
    lng: 80.3684,
    query: 'Pencil Opera, Kurunegala',
  },
  {
    name: 'Sisulka',
    town: 'Rathnapura',
    lat: 6.686,
    lng: 80.3974,
    query: 'Sisulka Higher Educational Institute, Rathnapura',
  },
  {
    name: 'Gurumandala',
    town: 'Kalutara',
    lat: 6.5802,
    lng: 79.9635,
    query: 'Gurumandala, Kalutara',
  },
]

export const mapsUrlFor = (venue) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.query)}`
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
