/** Tracker types and option lists shared by the browser and the server (no seed data here). */

export interface TrackerProject {
  id: string;
  title: string;
  avenue: string;
  kind: string;
  date: string;
  time: string;
  when: string;
  venue: string;
  lead: string;
  team: string;
  status: string;
  summary: string;
  money: string;
  upfront: string;
}

export interface TrackerTask {
  id: string;
  project: string;
  n: number;
  text: string;
  due: string;
  done: boolean;
  doneOn: string;
}

export const TRACKER_STATUSES = ['Planning', 'Confirmed', 'Done', 'Postponed'];
export const TRACKER_AVENUES = [
  'Club Service', 'Community Service', 'Professional Development', 'International Service', 'PROMO',
  'Digital Communications', 'Entrepreneurship Development', 'Editor', 'Partners-in-Service', 'Sports',
  'Social Media Officer', 'Jt. HRD',
];
