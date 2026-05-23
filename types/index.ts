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
  title: string;
  date: string;
  description: string;
  image?: string;
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
