// ─── Site Constants ──────────────────────────────────────────────────────────

export const SITE = {
  name: 'Rotaract Club of Mumbai Salt City',
  shortName: 'RCMSC',
  district: 'RID 3141',
  year: '2026–27',
  president: 'Tanish Momaya',
  theme: 'Aant Asti Prarambh',
  themeDevanagari: 'अन्त अस्ति प्रारम्भ',
  themeTranslation: 'The End Is The Beginning',
  tagline: 'Service Above Self',
  email: 'rtr.tanish.momaya@gmail.com',
  phone: '9136240120',
  phoneDisplay: '+91 91362 40120',
  instagram: 'https://instagram.com/rcmumbaIsaltcity',
  linkedin: 'https://linkedin.com/company/rcmumbaIsaltcity',
  facebook: 'https://facebook.com/rcmumbaIsaltcity',
  twitter: 'https://twitter.com/rcmumbaIsaltcity',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/team' },
  { label: 'Avenues', href: '/projects' },
  { label: 'Events', href: '/events' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Join', href: '/join' },
] as const;

export const AVENUES = [
  {
    id: 1,
    title: 'Club Service',
    description: 'Strengthening our community from within through fellowship.',
    icon: 'users',
    color: '#D4AF37',
  },
  {
    id: 2,
    title: 'Community Service',
    description: 'Grassroots impact through local action and sustainable development.',
    icon: 'heart',
    color: '#FF6B6B',
  },
  {
    id: 3,
    title: 'Professional Development',
    description: 'Building tomorrow\'s leaders through mentorship and skill-building.',
    icon: 'briefcase',
    color: '#FFA94D',
  },
  {
    id: 4,
    title: 'International Service',
    description: 'Connecting across borders for a more peaceful world.',
    icon: 'globe',
    color: '#845EC2',
  },
  {
    id: 5,
    title: 'PR and Marketing',
    description: 'Amplifying our story and shaping how the world sees our service.',
    icon: 'megaphone',
    color: '#2C73D2',
  },
  {
    id: 6,
    title: 'Digital Communication',
    description: 'Keeping our members and community connected, clearly and often.',
    icon: 'messageSquare',
    color: '#4FC3F7',
  },
  {
    id: 7,
    title: 'Entrepreneurship Development',
    description: 'Nurturing bold ideas and the founders who bring them to life.',
    icon: 'rocket',
    color: '#FFA94D',
  },
  {
    id: 8,
    title: 'Editor',
    description: 'Documenting our journey — words and design that outlast the moment.',
    icon: 'penTool',
    color: '#D4AF37',
  },
  {
    id: 9,
    title: 'Partners-In-Service',
    description: 'Collaborating with organizations to amplify our collective reach.',
    icon: 'handshake',
    color: '#E91E63',
  },
  {
    id: 10,
    title: 'Sports',
    description: 'Building camaraderie and spirit through play and friendly competition.',
    icon: 'trophy',
    color: '#845EC2',
  },
  {
    id: 11,
    title: 'Social Media',
    description: 'Telling our story where our generation lives — one post at a time.',
    icon: 'share2',
    color: '#FF6B6B',
  },
] as const;

export const STATS = [
  { value: '11', label: 'Avenues', sub: 'of Service' },
  { value: '1.4M+', label: 'Rotaractors', sub: 'Worldwide' },
  { value: '1', label: 'Vision', sub: 'Service Above Self' },
] as const;

export const THEME_PILLARS = [
  {
    title: 'LEGACY',
    sub: 'Honouring what came before',
  },
  {
    title: 'PRESENCE',
    sub: 'Serving in this moment',
  },
  {
    title: 'EMERGENCE',
    sub: 'Building what comes next',
  },
] as const;

export const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
] as const;

export const SHLOKA = {
  devanagari: 'ॐ पूर्णमदः पूर्णमिदम् पूर्णात् पूर्णमुदच्यते।\nपूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते॥',
  transliteration: 'Oṃ pūrṇam adaḥ pūrṇam idaṃ pūrṇāt pūrṇam udacyate\nPūrṇasya pūrṇam ādāya pūrṇam evāvaśiṣyate',
  translation: 'That is whole. This is whole.\nFrom wholeness, wholeness comes.\nTake wholeness from wholeness —\nwholeness alone remains.',
  source: '— Īśopaniṣad, Invocation',
} as const;
