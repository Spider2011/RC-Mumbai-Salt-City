import type { Achievement, AchievementStat } from '@/types';

/**
 * Club achievements — awards, recognitions, milestones and impact.
 *
 * TODO: replace these placeholder entries with the club's real achievements
 * (titles, awarding bodies, years). Grouped by `category` on the page.
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    title: '12th Installation Ceremony',
    org: 'RC Mumbai Salt City',
    date: '2026',
    category: 'Milestone',
    description:
      'Marked twelve years of continuous service with "Beyond the Horizon", installing the 2026–27 board.',
  },
  {
    id: 'a2',
    title: 'Flagship Blood Donation Drive',
    org: 'Community Service',
    date: '2026',
    category: 'Impact',
    description:
      'JeevanDaan united members and citizens to collect life-saving blood units in a single day.',
  },
  {
    id: 'a3',
    title: 'World Youth Skills Day Session',
    org: 'International Service',
    date: '2026',
    category: 'Recognition',
    description:
      'Hosted a cross-district skill-building session bridging international best practices with local impact.',
  },
  {
    id: 'a4',
    title: 'Chartered under RID 3141',
    org: 'Rotary International',
    date: '2015',
    category: 'Milestone',
    description:
      'Officially chartered as a Rotaract club under Rotary International District 3141.',
  },
  {
    id: 'a5',
    title: 'Best Club Initiative — District Nomination',
    org: 'RID 3141',
    date: '2026',
    category: 'Award',
    description:
      'Recognised at district level for an outstanding community service initiative. (Placeholder — update with the exact award.)',
  },
  {
    id: 'a6',
    title: 'Seven Avenues of Service, Active',
    org: 'RC Mumbai Salt City',
    date: '2026',
    category: 'Impact',
    description:
      'Ran projects spanning community, professional, international and sports avenues within a single year.',
  },
];

/** TODO: replace with verified numbers. */
export const ACHIEVEMENT_STATS: AchievementStat[] = [
  { value: '12', label: 'Years of service' },
  { value: '6+', label: 'Signature projects' },
  { value: '40+', label: 'Active members' },
  { value: '7', label: 'Avenues of service' },
];
