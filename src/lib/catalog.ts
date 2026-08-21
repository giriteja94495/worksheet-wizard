import type { Difficulty, ThemeId, WorksheetType } from '../types'

export const TYPE_META: Record<
  WorksheetType,
  { label: string; blurb: string; icon: string; sampleTitle: string }
> = {
  maths: {
    label: 'Maths',
    blurb: 'Addition to long division, sized to the child.',
    icon: '＋',
    sampleTitle: 'Maths Practice',
  },
  handwriting: {
    label: 'Handwriting',
    blurb: 'Trace names, alphabets, and sight words on lined paper.',
    icon: '✎',
    sampleTitle: 'Handwriting Practice',
  },
  spelling: {
    label: 'Spelling',
    blurb: 'Look-cover-write, missing letters, and scrambles.',
    icon: 'Aa',
    sampleTitle: 'Spelling Practice',
  },
  wordsearch: {
    label: 'Word Search',
    blurb: 'Themed grids that grow from 8×8 to 12×12.',
    icon: '▦',
    sampleTitle: 'Word Search',
  },
  matching: {
    label: 'Matching',
    blurb: 'Pictures, quantities, and rhymes to join up.',
    icon: '⟷',
    sampleTitle: 'Matching Practice',
  },
  oddoneout: {
    label: 'Odd One Out',
    blurb: 'Circle the item that does not belong.',
    icon: '○',
    sampleTitle: 'Odd One Out',
  },
  colouring: {
    label: 'Colouring',
    blurb: 'Simple line-art scenes with a name to colour.',
    icon: '❀',
    sampleTitle: 'Colouring Page',
  },
  rewardchart: {
    label: 'Reward Chart',
    blurb: 'A week of habits, stars waiting to be filled.',
    icon: '★',
    sampleTitle: 'Weekly Reward Chart',
  },
}

export const TOPICS: Record<WorksheetType, { value: string; label: string }[]> = {
  maths: [
    { value: 'addition', label: 'Addition' },
    { value: 'subtraction', label: 'Subtraction' },
    { value: 'multiplication', label: 'Multiplication' },
    { value: 'division', label: 'Division' },
    { value: 'mixed', label: 'Mixed operations' },
  ],
  handwriting: [
    { value: 'name', label: "Child's name" },
    { value: 'alphabet', label: 'Alphabet Aa–Zz' },
    { value: 'words', label: 'Sight words' },
  ],
  spelling: [
    { value: 'animals', label: 'Animals' },
    { value: 'food', label: 'Food' },
    { value: 'school', label: 'School' },
    { value: 'home', label: 'Home' },
    { value: 'nature', label: 'Nature' },
  ],
  wordsearch: [
    { value: 'animals', label: 'Animals' },
    { value: 'food', label: 'Food' },
    { value: 'school', label: 'School' },
    { value: 'home', label: 'Home' },
    { value: 'nature', label: 'Nature' },
  ],
  matching: [
    { value: 'pictures', label: 'Pictures & words' },
    { value: 'numbers', label: 'Numbers & quantities' },
    { value: 'rhymes', label: 'Rhyming pairs' },
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
): string {
  const label = TYPE_META[type].sampleTitle
  const n = childName.trim()
  if (unlocked && n) return `${possessive(n)} ${label}`
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
