export interface NavLink {
  label: string;
  href: string;
}

export interface Avenue {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface Stat {
  value: string;
  label: string;
  sub: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image?: string;
  bio?: string;
}

export interface Event {
  id: string;
  /** URL slug — /events/[slug] */
  slug: string;
  title: string;
  date: string;
  /** Short one-liner used on the timeline. */
  description: string;
  /** Full multi-paragraph description shown on the detail page. */
  longDescription?: string[];
  /** Optional venue / mode. */
  location?: string;
  /** Optional time window. */
  time?: string;
  /** Avenue of service this event belongs to. */
  avenue?: string;
  image?: string;
  /** Photo gallery paths — shown on the detail page for past events. */
  gallery?: string[];
  type: 'upcoming' | 'past';
}

export interface Project {
  id: string;
  title: string;
  avenue: string;
  description: string;
  image?: string;
  status: 'ongoing' | 'completed';
}
