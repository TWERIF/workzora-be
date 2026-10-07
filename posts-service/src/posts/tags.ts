export const POST_TAGS = ['freelance', 'marketing', 'ai', 'telegram', 'case-studies'] as const;

export type PostTag = (typeof POST_TAGS)[number];

const LEGACY_TAGS: Record<string, PostTag> = {
  freelance: 'freelance',
  'фриланс': 'freelance',
  'фріланс': 'freelance',
  marketing: 'marketing',
  'маркетинг': 'marketing',
  ai: 'ai',
  'шi': 'ai',
  'ші': 'ai',
  telegram: 'telegram',
  'телеграм': 'telegram',
  'case studies': 'case-studies',
  'case-studies': 'case-studies',
  'кейси': 'case-studies',
};

export const normalizeTag = (value: string): PostTag => LEGACY_TAGS[value.trim().toLowerCase()] ?? 'freelance';
