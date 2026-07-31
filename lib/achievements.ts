import type { AchievementYear } from '@/types';

/**
 * Club achievements, grouped by Rotaract year.
 *
 * ACERs and Crowns are awards WON at district level; the rest are nominations.
 * Add a new object to the array to record another year.
 */
export const ACHIEVEMENT_YEARS: AchievementYear[] = [
  {
    year: '2023–24',
    leader: 'Rtr. Pranati Chheda',
    leaderRole: 'President 2023–24',
    groups: [
      {
        id: 'acers',
        title: 'ACERs',
        subtitle: 'District awards won',
        icon: 'trophy',
        kind: 'won',
        labelIsCategory: true,
        items: [
          { label: 'Best Flagship Project (Community Based)', winner: 'Oh My Friend Ganesha 7.0' },
          { label: 'Best Social Media Project', winner: '30 Days 30 Campaigns' },
          { label: 'Outstanding Social Media Campaign', winner: 'Mental Health Awareness Month' },
          { label: 'Outstanding Editor', winner: 'Rtr. Riya Thakkar' },
        ],
      },
      {
        id: 'crowns',
        title: 'Crowns',
        subtitle: 'Best projects of the quarter',
        icon: 'crown',
        kind: 'won',
        items: [
          { label: 'Mini Library', badge: 'Q4' },
          { label: 'Verse Karwaan', badge: 'Q2' },
          { label: 'Salt City Literary Fest', badge: 'Q3' },
          { label: '30 Days 30 Campaigns', badge: 'Q4' },
        ],
      },
      {
        id: 'nom-projects',
        title: 'Nominations — Projects',
        subtitle: 'Recognised at district level',
        icon: 'star',
        kind: 'nomination',
        items: [
          { label: 'Joy of Giving 8.0' },
          { label: 'Asante' },
          { label: 'MSC Premier League' },
          { label: 'Ittar' },
          { label: 'Master Avenues 5.0' },
          { label: 'Onam Celebration' },
          { label: 'Peek-a-Bombay' },
          { label: 'Off the Record 3.0' },
        ],
      },
      {
        id: 'nom-directors',
        title: 'Nominations — Directors',
        subtitle: 'Individual excellence',
        icon: 'users',
        kind: 'nomination',
        labelIsCategory: true,
        items: [
          { label: 'Outstanding President', winner: 'Rtr. Pranati Chheda' },
          { label: 'Outstanding Secretary', winner: 'Rtr. Ariha Sheth' },
          { label: 'Outstanding Pres–Sec Relations', winner: 'Rtr. Ariha Sheth & Rtr. Pranati Chheda' },
          { label: 'Outstanding Club Service Director', winner: 'Rtr. Moksha Shah' },
          { label: 'Outstanding Community Service Director', winner: 'Rtr. Smit Shah' },
          { label: 'Outstanding Digital Communications Director', winner: 'Rtr. Mokshita Shah' },
          { label: 'Outstanding Social Media Director', winner: 'Rtr. Hitansh Khona' },
          { label: 'Outstanding New Comer', winner: 'Rtr. Jiya' },
        ],
      },
    ],
  },
];
