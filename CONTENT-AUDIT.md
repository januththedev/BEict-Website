# CONTENT-AUDIT — BEICT website

Every fact published on the site, mapped to its public source. Checked **2026-08-26**.

**Rule:** anything not in this table must not appear on the site. Update this file whenever
content changes.

| Fact on the site | Value | Source |
|---|---|---|
| Site identity | BEICT — Bhanuka Ekanayaka ICT | Wayback capture of beict.lk homepage, 2024-09-17 (`web.archive.org/web/20240917153104/https://beict.lk/`) |
| Subject | Information & Communication Technology | Same homepage capture (hero: "Information & Communication Technology") |
| Level | G.C.E. Advanced Level (A/L) | Wayback capture of lms.beict.lk, 2024-08-30 (`web.archive.org/web/20240830095002/https://lms.beict.lk/`) — course categories "2024 A/L", "2025 A/L", "2026 A/L", "2024 A/L Repeat Revision" |
| Medium | Sinhala Medium | beict.lk homepage capture ("About Beict": "Information and Communication Technology / Sinhala Medium") |
| LMS address | https://lms.beict.lk/ | beict.lk homepage capture — "ACTIVITY PORTAL" and hero "Click here" both link there; LMS is Moodle (login/forgot_password.php, course/index.php URLs in capture) |
| Sinhala LMS invite | "BEICT අන්තර්ජාල ඉගෙනුම් පද්ධතිය වෙත මෙතනින් පිවිසෙන්න." | beict.lk homepage capture (hero CTA area, verbatim) |
| Hero CTA wording | "Get Started Learning Now" | beict.lk homepage capture (verbatim) |
| Phone | 071 103 9004 (`tel:+94711039004`) | beict.lk homepage capture (footer "Phone: 0711039004", top bar "INQUIRIES? CALL 0711039004") |
| WhatsApp | https://wa.me/94711039004 | beict.lk homepage capture lists a WhatsApp social link (same number) |
| Email | hello@beict.lk | beict.lk homepage capture — address behind Cloudflare email-protection; decode resolves to hello@beict.lk |
| Working hours | Mon – Sun · 8.00 AM – 8.00 PM | beict.lk homepage capture (footer, verbatim) |
| Facebook | https://www.facebook.com/bhanukaekanyaka/ | beict.lk homepage capture (social links) |
| YouTube | https://www.youtube.com/channel/UC2vJHPJnfJNwr8DpdRMNE6g | beict.lk homepage capture (social links) |
| Batch framing on site | "A/L Theory Batches", "Repeat & Revision", "Lessons & Resources" cards, captioned as reflecting categories published on lms.beict.lk | Derived from the Moodle category list above; the site explicitly says current availability is confirmed inside the LMS |

## Deliberately NOT published (could not be verified)

- Follower/subscriber counts, student numbers, years of experience, results, ranks, awards.
- Physical class venues/centres (no public source verified during this build).
- Testimonials.
- Current (2026) batch list — the LMS capture is from Aug 2024; the site therefore says
  availability is confirmed inside the learning system rather than asserting current batches.

## Notes

- Live `beict.lk` returned HTTP 522 (origin down) then 403 (bot block) on 2026-08-26, so
  Wayback Machine captures were used as the source of truth. Re-verify against the live
  site once hosting is restored, and update this table if anything changed.
- The original site's footer credit ("Developed by Yashitha Nadiranga") applies to the old
  2022 WordPress site and is not carried over.
