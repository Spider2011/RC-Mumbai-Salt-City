import type { Event as ClubEvent, EventStatus } from '@/types';

/**
 * Single source of truth for club events.
 *
 * Status (past / ongoing / upcoming) is computed live from `start`/`end`
 * (see getEventStatus) rather than stored — no manual updates needed as time
 * passes. Times are IST (+05:30). All-day events span 00:00–23:59 of the day.
 */
export const EVENTS: ClubEvent[] = [
  {
    id: 'e1',
    slug: 'jeevandaan-blood-donation-drive',
    title: 'JeevanDaan — Blood Donation Drive',
    date: '5th July 2026',
    start: '2026-07-05T09:00:00+05:30',
    end: '2026-07-05T15:00:00+05:30',
    avenue: 'Community Service',
    description:
      'Our flagship community service initiative — a blood donation camp uniting members and citizens in the act of giving life.',
    longDescription: [
      'JeevanDaan — literally, “the gift of life” — was our flagship community service initiative for the year. In partnership with a certified blood bank, we transformed a single afternoon into a lifeline for dozens of patients across the city.',
      'Members, families, and citizens came together to donate, register as future donors, and spread awareness about the constant need for safe blood. Volunteers managed registration, refreshments, and post-donation care, ensuring every donor felt looked after.',
      'By the close of the day, the drive had collected a heartening number of units — each one a quiet promise kept to a stranger in need. It set the tone for a year defined by service above self.',
    ],
    location: 'Medstar Multispeciality Hospital',
    gallery: Array.from(
      { length: 40 },
      (_, i) => `/images/jeevandaan/web/${String(i + 1).padStart(2, '0')}.jpg`
    ),
  },
  {
    id: 'e2',
    slug: 'world-youth-skills-day',
    title: 'World Youth Skills Day',
    date: '15th July 2026',
    start: '2026-07-15T17:00:00+05:30',
    end: '2026-07-15T19:00:00+05:30',
    avenue: 'International Service',
    description:
      'A skill-building celebration bridging international best practices with local impact, open to Rotaractors across districts.',
    longDescription: [
      'On World Youth Skills Day, we celebrated the power of learning by doing. The session brought together Rotaractors across districts to sharpen skills that translate directly into stronger service projects and personal growth.',
      'Speakers shared international best practices and grounded them in real, local examples — from project planning to communication and leadership. Attendees left with frameworks they could apply the very next week.',
      'The day reinforced a simple belief: the more capable each Rotaractor becomes, the greater our collective impact on the community.',
    ],
    location: 'Online — Google Meet',
    gallery: Array.from(
      { length: 14 },
      (_, i) => `/images/world-youth-skills-day/web/${String(i + 1).padStart(2, '0')}.jpg`
    ),
  },
  {
    id: 'e5',
    slug: 'installation-ceremony',
    title: 'Installation Ceremony',
    date: '2nd August 2026',
    start: '2026-08-02T18:00:00+05:30',
    end: '2026-08-02T20:00:00+05:30',
    avenue: 'Vice President',
    image: '/images/events/installation/invitation.jpg',
    description:
      'Beyond the Horizon — the 12th Installation Ceremony of the Rotaract Club of Mumbai Salt City.',
    longDescription: [
      'Greetings from the Rotaract Club of Mumbai Salt City! ✨',
      'Click the link for a surprise 😉: https://ar-code.com/x7b3Z67MB',
      'It is with great pleasure that we invite you to join us as we celebrate a significant milestone, Beyond the Horizon — the 12th Installation Ceremony of The Rotaract Club of Mumbai Salt City.',
      '📅 Date: 2nd August',
      '🕕 Time: 6:00 PM – 8:00 PM',
      '📍 Venue: Mewad Kesari Bhavan, Bhandup West',
      '👔 Dress Code: Smart Formals',
      'As we embark on a new Rotaract year, Beyond the Horizon symbolizes our commitment to embracing new possibilities, stronger collaborations, and impactful service beyond the limits of today. We would be honored to have your presence as we officially install our incoming team and begin this exciting new chapter. 🤍',
      'We look forward to welcoming you and your club for an evening of fellowship, inspiration, and celebration.',
      'RSVP:',
      'Rtr. Kashvi Kothari · Club Secretary 2026-27 · +919769075554',
      'Rtr. Romil Lodaya · Vice President 2026-27 · +918169774974',
      'Rtr. Hriday Kataria · Vice President 2026-27 · +918928916435',
      'Warm Regards, Rotaract Club of Mumbai Salt City 💙🌅',
    ],
    location: 'Mewad Kesari Bhavan, Bhandup West',
    time: '6:00 PM – 8:00 PM',
    galleryVariant: 'circular',
    gallery: Array.from(
      { length: 32 },
      (_, i) => `/images/events/installation/gallery/${String(i + 1).padStart(2, '0')}.jpg`
    ),
  },
  {
    id: 'e6',
    slug: 'oh-my-friend-ganesha',
    title: 'Oh My Friend Ganesha',
    date: '14th September 2026',
    start: '2026-09-14T00:00:00+05:30',
    end: '2026-09-14T23:59:59+05:30',
    avenue: 'Club Service',
    description:
      'A festive club service initiative celebrating the spirit of Ganesh Chaturthi with the community.',
    longDescription: [
      'Oh My Friend Ganesha is our festive club service initiative celebrating the spirit of Ganesh Chaturthi. It blends devotion, community, and eco-conscious celebration into one joyful gathering.',
      'Expect cultural performances, community outreach, and an emphasis on sustainable, respectful festivity. It is a chance to serve and celebrate side by side.',
      'Register below to be part of the celebration.',
    ],
    location: 'TBA',
  },
  {
    id: 'e7',
    slug: 'garba-gala',
    title: 'Garba Gala',
    date: '27th September 2026',
    start: '2026-09-27T18:00:00+05:30',
    end: '2026-09-27T23:00:00+05:30',
    avenue: 'Club Service',
    image: '/images/events/garba-gala/poster.jpg',
    description:
      'A night of garba, music, and festivity — dress up, twirl, and celebrate the season with the club.',
    longDescription: [
      'Garba Gala is our celebration of the festive season — an evening of garba, dandiya, music, and community. Bring your energy and your best traditional attire!',
      'Whether you are a seasoned dancer or just there for the vibe and the food, there is a place for you on the floor.',
      'Register below to reserve your spot — and add a photo with your sign-up if you like.',
    ],
    location: 'Grand Celebration Hall, Above Croma',
    time: 'Evening',
    collectImage: true,
  },
];

export function getEventBySlug(slug: string): ClubEvent | undefined {
  return EVENTS.find((event) => event.slug === slug);
}

/**
 * Live status of an event relative to `now` (defaults to the current time).
 * Pure and safe on server or client — pass an explicit `now` for stable
 * server renders, omit it for the real current time on the client.
 */
export function getEventStatus(event: ClubEvent, now: Date = new Date()): EventStatus {
  const start = new Date(event.start).getTime();
  const end = event.end ? new Date(event.end).getTime() : start;
  const t = now.getTime();
  if (t < start) return 'upcoming';
  if (t > end) return 'past';
  return 'ongoing';
}

/** Label + accent colours for a status badge. */
export function statusMeta(
  status: EventStatus,
  pastLabel = 'Past'
): { label: string; color: string; border: string } {
  if (status === 'ongoing') return { label: 'Ongoing', color: '#4ade80', border: 'rgba(74,222,128,0.55)' };
  if (status === 'past') return { label: pastLabel, color: 'var(--text-muted)', border: 'rgba(245,245,247,0.2)' };
  return { label: 'Upcoming', color: 'var(--accent-gold)', border: 'rgba(212,175,55,0.5)' };
}
