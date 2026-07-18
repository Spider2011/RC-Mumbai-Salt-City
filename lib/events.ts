import type { Event as ClubEvent } from '@/types';

/**
 * Single source of truth for club events. Consumed by the events list page,
 * the timeline, and the /events/[slug] detail pages.
 *
 * Classification (past / upcoming) is relative to the club's working date.
 * Past events carry a `gallery`; upcoming events open a registration form.
 */
export const EVENTS: ClubEvent[] = [
  {
    id: 'e1',
    slug: 'jeevandaan-blood-donation-drive',
    title: 'JeevanDaan — Blood Donation Drive',
    date: '5th July 2026',
    avenue: 'Community Service',
    description:
      'Our flagship community service initiative — a blood donation camp uniting members and citizens in the act of giving life.',
    longDescription: [
      'JeevanDaan — literally, “the gift of life” — was our flagship community service initiative for the year. In partnership with a certified blood bank, we transformed a single afternoon into a lifeline for dozens of patients across the city.',
      'Members, families, and citizens came together to donate, register as future donors, and spread awareness about the constant need for safe blood. Volunteers managed registration, refreshments, and post-donation care, ensuring every donor felt looked after.',
      'By the close of the day, the drive had collected a heartening number of units — each one a quiet promise kept to a stranger in need. It set the tone for a year defined by service above self.',
    ],
    location: 'Community Hall, Mumbai Salt City',
    gallery: Array.from(
      { length: 40 },
      (_, i) => `/images/jeevandaan/web/${String(i + 1).padStart(2, '0')}.jpg`
    ),
    type: 'past',
  },
  {
    id: 'e2',
    slug: 'world-youth-skills-day',
    title: 'World Youth Skills Day',
    date: '15th July 2026',
    avenue: 'International Service',
    description:
      'A skill-building celebration bridging international best practices with local impact, open to Rotaractors across districts.',
    longDescription: [
      'On World Youth Skills Day, we celebrated the power of learning by doing. The session brought together Rotaractors across districts to sharpen skills that translate directly into stronger service projects and personal growth.',
      'Speakers shared international best practices and grounded them in real, local examples — from project planning to communication and leadership. Attendees left with frameworks they could apply the very next week.',
      'The day reinforced a simple belief: the more capable each Rotaractor becomes, the greater our collective impact on the community.',
    ],
    location: 'Mumbai Salt City',
    gallery: Array.from(
      { length: 14 },
      (_, i) => `/images/world-youth-skills-day/web/${String(i + 1).padStart(2, '0')}.jpg`
    ),
    type: 'past',
  },
  {
    id: 'e3',
    slug: 'world-chess-day',
    title: 'World Chess Day',
    date: '20th July 2026',
    avenue: 'International Service',
    description:
      'Celebrating the global game — an international collaboration promoting strategic thinking and cross-cultural fellowship.',
    longDescription: [
      'On World Chess Day, we celebrate the game that unites minds across borders. Our event promotes strategic thinking, patience, and cross-cultural fellowship through the universal language of chess.',
      'Whether you are a grandmaster in the making or picking up your first pawn, there is a place for you at the board. Expect friendly matches, quick tactics, and plenty of good company.',
      'Register below to reserve your seat — spaces are limited to keep the tournament well-paced.',
    ],
    location: 'To be announced',
    time: 'Evening',
    type: 'upcoming',
  },
  {
    id: 'e4',
    slug: 'pickleball-tournament',
    title: 'PickleBall Tournament',
    date: '25th July 2026',
    avenue: 'Sports',
    description:
      'Building camaraderie on the court — an inter-club sports event fostering teamwork, wellness, and friendly competition.',
    longDescription: [
      'Our PickleBall Tournament brings the fastest-growing sport in the world to the club. It is an inter-club event built around teamwork, wellness, and friendly competition.',
      'Players of every level are welcome — we will group teams to keep matches fun and fair. Come for the rallies, stay for the camaraderie.',
      'Register below to claim your spot on the court.',
    ],
    location: 'To be announced',
    type: 'upcoming',
  },
  {
    id: 'e5',
    slug: 'installation-ceremony',
    title: 'Installation Ceremony',
    date: '2nd August 2026',
    avenue: 'Club Service',
    description:
      'The formal beginning of our year — the moment one chapter closes and the next begins.',
    longDescription: [
      'The Installation Ceremony marks the formal beginning of our Rotaract year. It is the moment when one chapter closes and the next begins — the living embodiment of our theme, Aant Asti Prarambh.',
      'The evening honours the outgoing board, installs the new team, and sets our intentions for the year of service ahead. Family, friends, and fellow Rotaractors are warmly invited to witness the handover.',
      'Register below to join us for this milestone occasion.',
    ],
    location: 'To be announced',
    time: 'Evening',
    type: 'upcoming',
  },
  {
    id: 'e6',
    slug: 'oh-my-friend-ganesha',
    title: 'Oh My Friend Ganesha',
    date: '14th September 2026',
    avenue: 'Club Service',
    description:
      'A festive club service initiative celebrating the spirit of Ganesh Chaturthi with the community.',
    longDescription: [
      'Oh My Friend Ganesha is our festive club service initiative celebrating the spirit of Ganesh Chaturthi. It blends devotion, community, and eco-conscious celebration into one joyful gathering.',
      'Expect cultural performances, community outreach, and an emphasis on sustainable, respectful festivity. It is a chance to serve and celebrate side by side.',
      'Register below to be part of the celebration.',
    ],
    location: 'To be announced',
    type: 'upcoming',
  },
];

export function getEventBySlug(slug: string): ClubEvent | undefined {
  return EVENTS.find((event) => event.slug === slug);
}
