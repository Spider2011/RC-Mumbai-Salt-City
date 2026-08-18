import { SITE } from '@/lib/constants';
import { EVENTS, getEventStatus } from '@/lib/events';

/**
 * Scripted assistant content. Fixed inputs (the visitor taps a preset
 * question) and fixed outputs (a canned answer), but answers are computed
 * live from SITE + EVENTS so contact details and event status stay current.
 */
export interface ChatLink {
  label: string;
  href: string;
}

export interface ChatAnswer {
  lines: string[];
  links?: ChatLink[];
}

export interface ChatTopic {
  id: string;
  /** Chip label + the "user" message shown when tapped. */
  question: string;
  answer: () => ChatAnswer;
}

export const GREETING =
  "Namaste! I'm the RCMSC assistant. Tap a question below and I'll help you out. 🌅";

export const CHAT_TOPICS: ChatTopic[] = [
  {
    id: 'about',
    question: 'What is RCMSC?',
    answer: () => ({
      lines: [
        `We're the ${SITE.name} (${SITE.district}) — a fellowship of young leaders living this year's theme, ${SITE.theme} ("${SITE.themeTranslation}").`,
        `Our creed is simple: ${SITE.tagline}.`,
      ],
      links: [{ label: 'Read our story', href: '/about' }],
    }),
  },
  {
    id: 'join',
    question: 'How do I join?',
    answer: () => ({
      lines: [
        'We would love to have you! Fill out the short interest form and our team will reach out to you.',
      ],
      links: [{ label: 'Join the club', href: '/join' }],
    }),
  },
  {
    id: 'events',
    question: 'What are the upcoming events?',
    answer: () => {
      const now = new Date();
      const live = EVENTS.map((e) => ({ e, status: getEventStatus(e, now) })).filter(
        ({ status }) => status === 'upcoming' || status === 'ongoing'
      );
      if (live.length === 0) {
        return {
          lines: ["No upcoming events right now — but take a look at what we've been up to."],
          links: [{ label: 'See all events', href: '/events' }],
        };
      }
      const lines = ['Here is what is coming up:'];
      for (const { e, status } of live) {
        lines.push(`• ${e.title} — ${e.date}${status === 'ongoing' ? ' (happening now!)' : ''}`);
      }
      return {
        lines,
        links: [
          ...live.map(({ e }) => ({ label: e.title, href: `/events/${e.slug}` })),
          { label: 'All events', href: '/events' },
        ],
      };
    },
  },
  {
    id: 'avenues',
    question: 'What do you work on?',
    answer: () => ({
      lines: [
        'Our service flows through several avenues — Club Service, Community Service, Professional Development, International Service, Sports, and more.',
      ],
      links: [{ label: 'Explore the avenues', href: '/projects' }],
    }),
  },
  {
    id: 'contact',
    question: 'How can I contact you?',
    answer: () => ({
      lines: ['Reach us anytime — we usually reply quickly:'],
      links: [
        { label: `Email: ${SITE.email}`, href: `mailto:${SITE.email}` },
        { label: `Call: ${SITE.phoneDisplay}`, href: `tel:+91${SITE.phone}` },
        { label: 'Instagram', href: SITE.instagram },
      ],
    }),
  },
  {
    id: 'team',
    question: 'Who runs the club?',
    answer: () => ({
      lines: [
        `The ${SITE.year} core team is led by our President, ${SITE.president}, along with a passionate board.`,
      ],
      links: [{ label: 'Meet the team', href: '/team' }],
    }),
  },
  {
    id: 'location',
    question: 'Where are you based?',
    answer: () => ({
      lines: [
        'We are part of Rotary International District 3141, that covers Mumbai. Whereas our club is situated in Mulund Region.',
      ],
    }),
  },
];
