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

/** Live status derived from the event's start/end vs the current time. */
export type EventStatus = 'past' | 'ongoing' | 'upcoming';

export interface Event {
  id: string;
  /** URL slug — /events/[slug] */
  slug: string;
  title: string;
  /** Human-readable date shown in the UI, e.g. "2nd August 2026". */
  date: string;
  /** Machine start (ISO 8601 with offset) — drives the live status. */
  start: string;
  /** Machine end (ISO 8601 with offset). Defaults to `start` when omitted. */
  end?: string;
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
  /** How the gallery renders: horizontal scroll strip (default) or a 3D circular gallery. */
  galleryVariant?: 'scroll' | 'circular';
}

export interface Project {
  id: string;
  title: string;
  avenue: string;
  description: string;
  image?: string;
  status: 'ongoing' | 'completed';
}

export type AchievementIcon = 'trophy' | 'crown' | 'star' | 'users';
export type AchievementGroupKind = 'won' | 'nomination';

export interface AchievementItem {
  /** Primary label — an award/role category, or a project name. */
  label: string;
  /** Recipient / winning project, when `label` is a category. */
  winner?: string;
  /** Small badge, e.g. a quarter "Q4". */
  badge?: string;
}

export interface AchievementGroup {
  id: string;
  title: string;
  subtitle?: string;
  icon: AchievementIcon;
  kind: AchievementGroupKind;
  /** When true, each item's `label` is a category and `winner` holds the result. */
  labelIsCategory?: boolean;
  items: AchievementItem[];
}

export interface AchievementYear {
  year: string;
  leader: string;
  leaderRole?: string;
  groups: AchievementGroup[];
}
