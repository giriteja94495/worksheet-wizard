import type {
  Difficulty,
  SchoolClass,
  ThemeId,
  WorksheetType,
} from '../types'

export const TYPE_META: Record<
  WorksheetType,
  { label: string; blurb: string; icon: string; sampleTitle: string; subject: string; group: 'academic' | 'practice' | 'early' }
> = {
  maths: {
    label: 'Maths',
    blurb: 'From number bonds to quadratics, sized to the class.',
    icon: '＋',
    sampleTitle: 'Maths Practice',
    subject: 'Mathematics',
    group: 'academic',
  },
  quiz: {
    label: 'Quiz / Practice paper',
    blurb: 'Numbered questions, answer lines, and optional MCQs.',
    icon: '☰',
    sampleTitle: 'Practice Paper',
    subject: 'General',
    group: 'academic',
  },
  grammar: {
    label: 'Grammar / English',
    blurb: 'Nouns and tenses up to voice, speech, and editing.',
    icon: 'Aa',
    sampleTitle: 'English Grammar',
    subject: 'English',
    group: 'academic',
  },
  science: {
    label: 'Science',
    blurb: 'Terms, fill-ins, and match-the-following for Classes 3–10.',
    icon: '⚗',
    sampleTitle: 'Science Practice',
    subject: 'Science',
    group: 'academic',
  },
  custom: {
    label: 'Teacher Studio',
    blurb: 'Paste your own questions, save templates, print a class set.',
    icon: '✎',
    sampleTitle: 'Custom Worksheet',
    subject: 'Custom',
    group: 'academic',
  },
  handwriting: {
    label: 'Handwriting',
    blurb: 'Trace names, alphabets, sight words, and sentences.',
    icon: '✎',
    sampleTitle: 'Handwriting Practice',
    subject: 'English',
    group: 'practice',
  },
  spelling: {
    label: 'Spelling',
    blurb: 'Look-cover-write, missing letters, and scrambles.',
    icon: 'Sp',
    sampleTitle: 'Spelling Practice',
    subject: 'English',
    group: 'practice',
  },
  wordsearch: {
    label: 'Word Search',
    blurb: 'Themed grids that grow from 8×8 to 12×12.',
    icon: '▦',
    sampleTitle: 'Word Search',
    subject: 'English',
    group: 'practice',
  },
  matching: {
    label: 'Matching',
    blurb: 'Pictures, quantities, rhymes, or subject terms.',
    icon: '⟷',
    sampleTitle: 'Matching Practice',
    subject: 'General',
    group: 'practice',
  },
  oddoneout: {
    label: 'Odd One Out',
    blurb: 'Circle the item that does not belong.',
    icon: '○',
    sampleTitle: 'Odd One Out',
    subject: 'General',
    group: 'practice',
  },
  colouring: {
    label: 'Colouring',
    blurb: 'Simple line-art scenes with a name to colour.',
    icon: '❀',
    sampleTitle: 'Colouring Page',
    subject: 'Art',
    group: 'early',
  },
  rewardchart: {
    label: 'Reward Chart',
    blurb: 'A week of habits, stars waiting to be filled.',
    icon: '★',
    sampleTitle: 'Weekly Reward Chart',
    subject: 'Homeroom',
    group: 'early',
  },
}

export const TYPE_ORDER: WorksheetType[] = [
  'maths',
  'quiz',
  'grammar',
  'science',
  'custom',
  'spelling',
  'wordsearch',
  'matching',
  'oddoneout',
  'handwriting',
  'colouring',
  'rewardchart',
]

type Topic = { value: string; label: string }

const MATHS_EARLY: Topic[] = [
  { value: 'numbers', label: 'Numbers & counting' },
  { value: 'addition', label: 'Addition' },
  { value: 'subtraction', label: 'Subtraction' },
  { value: 'missing', label: 'Missing addends' },
]

const MATHS_PRIMARY: Topic[] = [
  { value: 'addition', label: 'Addition' },
  { value: 'subtraction', label: 'Subtraction' },
  { value: 'multiplication', label: 'Multiplication' },
  { value: 'division', label: 'Division' },
  { value: 'fractions', label: 'Fractions' },
  { value: 'word', label: 'Word problems' },
  { value: 'measurement', label: 'Measurement' },
  { value: 'mixed', label: 'Mixed operations' },
]

const MATHS_MIDDLE: Topic[] = [
  { value: 'integers', label: 'Integers' },
  { value: 'decimals', label: 'Decimals' },
  { value: 'percentages', label: 'Percentages' },
  { value: 'algebra', label: 'Simple algebra' },
  { value: 'geometry', label: 'Basic geometry' },
  { value: 'fractions', label: 'Fractions & rationals' },
  { value: 'mixed', label: 'Mixed revision' },
]

const MATHS_SECONDARY: Topic[] = [
  { value: 'linear', label: 'Linear equations' },
  { value: 'polynomials', label: 'Polynomials' },
  { value: 'quadratic', label: 'Quadratic intro' },
  { value: 'mensuration', label: 'Surface area & volume' },
  { value: 'trig', label: 'Trigonometric ratios' },
  { value: 'statistics', label: 'Statistics / mean' },
  { value: 'mixed', label: 'Board-style mix' },
]

const GRAMMAR_EARLY: Topic[] = [
  { value: 'nouns', label: 'Nouns' },
  { value: 'verbs', label: 'Verbs' },
  { value: 'articles', label: 'A / an / the' },
  { value: 'capitals', label: 'Capital letters' },
]

const GRAMMAR_PRIMARY: Topic[] = [
  { value: 'tenses', label: 'Simple tenses' },
  { value: 'adjectives', label: 'Adjectives' },
  { value: 'pronouns', label: 'Pronouns' },
  { value: 'punctuation', label: 'Punctuation' },
]

const GRAMMAR_MIDDLE: Topic[] = [
  { value: 'tenses', label: 'Tenses' },
  { value: 'voice', label: 'Active & passive' },
  { value: 'speech', label: 'Reported speech' },
  { value: 'editing', label: 'Editing' },
]

const GRAMMAR_SECONDARY: Topic[] = [
  { value: 'voice', label: 'Voice' },
  { value: 'speech', label: 'Reported speech' },
  { value: 'editing', label: 'Editing & omission' },
  { value: 'reordering', label: 'Sentence reordering' },
]

const SCIENCE_PRIMARY: Topic[] = [
  { value: 'living', label: 'Plants & animals' },
  { value: 'body', label: 'Our body' },
  { value: 'materials', label: 'Materials around us' },
  { value: 'earth', label: 'Air, water, weather' },
]

const SCIENCE_MIDDLE: Topic[] = [
  { value: 'food', label: 'Food & nutrition' },
  { value: 'matter', label: 'Matter & materials' },
  { value: 'force', label: 'Force, friction, motion' },
  { value: 'life', label: 'Life processes' },
]

const SCIENCE_SECONDARY: Topic[] = [
  { value: 'life', label: 'Life processes' },
  { value: 'chemicals', label: 'Acids, bases, atoms' },
  { value: 'physics', label: 'Electricity, light, motion' },
  { value: 'environment', label: 'Our environment' },
]

const QUIZ_TOPICS: Topic[] = [
  { value: 'mixed', label: 'Mixed practice' },
  { value: 'maths', label: 'Maths quiz' },
  { value: 'english', label: 'English quiz' },
  { value: 'evs', label: 'EVS / Science quiz' },
  { value: 'gk', label: 'India GK' },
]

export function topicsFor(type: WorksheetType, classLevel: SchoolClass): Topic[] {
  if (type === 'maths') {
    if (classLevel <= 2) return MATHS_EARLY
    if (classLevel <= 5) return MATHS_PRIMARY
    if (classLevel <= 8) return MATHS_MIDDLE
    return MATHS_SECONDARY
  }
  if (type === 'grammar') {
    if (classLevel <= 2) return GRAMMAR_EARLY
    if (classLevel <= 5) return GRAMMAR_PRIMARY
    if (classLevel <= 8) return GRAMMAR_MIDDLE
    return GRAMMAR_SECONDARY
  }
  if (type === 'science') {
    if (classLevel <= 5) return SCIENCE_PRIMARY
    if (classLevel <= 8) return SCIENCE_MIDDLE
    return SCIENCE_SECONDARY
  }
  if (type === 'quiz') return QUIZ_TOPICS
  if (type === 'custom') return [{ value: 'custom', label: 'Your own questions' }]
  if (type === 'handwriting') {
    const base: Topic[] = [
      { value: 'name', label: "Student's name" },
      { value: 'alphabet', label: 'Alphabet Aa–Zz' },
      { value: 'words', label: 'Sight words' },
    ]
    if (classLevel >= 4) base.push({ value: 'sentences', label: 'Sentences' })
    return base
  }
  if (type === 'spelling' || type === 'wordsearch') {
    return [
      { value: 'animals', label: 'Animals' },
      { value: 'food', label: 'Food' },
      { value: 'school', label: 'School' },
      { value: 'home', label: 'Home' },
      { value: 'nature', label: 'Nature' },
      { value: 'custom', label: 'Custom word list' },
    ]
  }
  if (type === 'matching') {
    const base: Topic[] = [
      { value: 'pictures', label: 'Pictures & words' },
      { value: 'numbers', label: 'Numbers & quantities' },
      { value: 'rhymes', label: 'Rhyming pairs' },
    ]
    if (classLevel >= 4) base.push({ value: 'terms', label: 'Terms & meanings' })
    return base
  }
  if (type === 'oddoneout') return [{ value: 'mixed', label: 'Mixed categories' }]
  if (type === 'colouring') return [{ value: 'scene', label: 'Theme scene' }]
  return [{ value: 'habits', label: 'Daily habits' }]
}

/** @deprecated Prefer topicsFor(type, classLevel) */
export const TOPICS: Record<WorksheetType, Topic[]> = {
  maths: MATHS_PRIMARY,
  quiz: QUIZ_TOPICS,
  grammar: GRAMMAR_PRIMARY,
  science: SCIENCE_PRIMARY,
  custom: [{ value: 'custom', label: 'Your own questions' }],
  handwriting: [
    { value: 'name', label: "Student's name" },
    { value: 'alphabet', label: 'Alphabet Aa–Zz' },
    { value: 'words', label: 'Sight words' },
    { value: 'sentences', label: 'Sentences' },
  ],
  spelling: [
    { value: 'animals', label: 'Animals' },
    { value: 'food', label: 'Food' },
    { value: 'school', label: 'School' },
    { value: 'home', label: 'Home' },
    { value: 'nature', label: 'Nature' },
    { value: 'custom', label: 'Custom word list' },
  ],
  wordsearch: [
    { value: 'animals', label: 'Animals' },
    { value: 'food', label: 'Food' },
    { value: 'school', label: 'School' },
    { value: 'home', label: 'Home' },
    { value: 'nature', label: 'Nature' },
    { value: 'custom', label: 'Custom word list' },
  ],
  matching: [
    { value: 'pictures', label: 'Pictures & words' },
    { value: 'numbers', label: 'Numbers & quantities' },
    { value: 'rhymes', label: 'Rhyming pairs' },
    { value: 'terms', label: 'Terms & meanings' },
  ],
  oddoneout: [{ value: 'mixed', label: 'Mixed categories' }],
  colouring: [{ value: 'scene', label: 'Theme scene' }],
  rewardchart: [{ value: 'habits', label: 'Daily habits' }],
}

export const THEMES: {
  id: ThemeId
  label: string
  premium: boolean
  swatch: string
  ink: string
}[] = [
  { id: 'sunshine', label: 'Sunshine', premium: false, swatch: '#E9C46A', ink: '#9A6B12' },
  { id: 'ocean', label: 'Ocean', premium: true, swatch: '#2A9D8F', ink: '#1F7A70' },
  { id: 'jungle', label: 'Jungle', premium: true, swatch: '#6A994E', ink: '#386641' },
  { id: 'space', label: 'Space', premium: true, swatch: '#1F2A44', ink: '#1F2A44' },
]

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export function defaultSubject(type: WorksheetType): string {
  return TYPE_META[type].subject
}

export function possessive(name: string): string {
  const n = name.trim()
  if (!n) return 'My'
  return n.endsWith('s') || n.endsWith('S') ? `${n}'` : `${n}'s`
}

export function displayName(childName: string, unlocked: boolean): string {
  const n = childName.trim()
  if (unlocked && n) return n
  return 'My Worksheet'
}

export function madeForLine(childName: string, unlocked: boolean): string | null {
  const n = childName.trim()
  if (unlocked && n) return `Made for ${n}`
  return null
}

export function defaultTitle(
  childName: string,
  unlocked: boolean,
  type: WorksheetType,
  classLevel?: SchoolClass,
): string {
  const label = TYPE_META[type].sampleTitle
  const n = childName.trim()
  const cls = classLevel ? `Class ${classLevel} ` : ''
  if (unlocked && n) return `${possessive(n)} ${cls}${label}`.replace(/\s+/g, ' ').trim()
  if (classLevel) return `Class ${classLevel} ${label}`
  return `My ${label}`
}

export function slugName(childName: string, unlocked: boolean): string {
  const n = unlocked ? childName.trim() : ''
  const base = n || 'Worksheet'
  return base.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'Worksheet'
}

export function fileLabel(type: WorksheetType): string {
  return TYPE_META[type].label.replace(/\s+/g, '')
}
