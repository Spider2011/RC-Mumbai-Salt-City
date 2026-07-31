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
