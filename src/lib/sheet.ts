import type {
  ClassBand,
  Difficulty,
  SchoolClass,
  WizardInput,
  WorksheetBase,
  WorksheetType,
} from '../types'
import { defaultSubject, defaultTitle, displayName, madeForLine } from './catalog'

export const CLASSES: SchoolClass[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function isSchoolClass(n: number): n is SchoolClass {
  return Number.isInteger(n) && n >= 1 && n <= 10
}

export function clampClass(n: number): SchoolClass {
  const v = Math.min(10, Math.max(1, Math.round(n)))
  return (isSchoolClass(v) ? v : 3) as SchoolClass
}

export function ageFromClass(classLevel: SchoolClass): number {
  return classLevel + 5
}

export function classFromAge(age: number): SchoolClass {
  return clampClass(age - 5)
}

export function classBand(classLevel: SchoolClass): ClassBand {
  if (classLevel <= 2) return 'early'
  if (classLevel <= 5) return 'primary'
  if (classLevel <= 8) return 'middle'
  return 'secondary'
}

export function classLabel(classLevel: SchoolClass, section = ''): string {
  const sec = section.trim()
  return sec ? `Class ${classLevel}-${sec}` : `Class ${classLevel}`
}

export function typicalAgeHint(classLevel: SchoolClass): string {
  const age = ageFromClass(classLevel)
  return `Typical age about ${age}`
}

export function sampleStudentName(classLevel: SchoolClass): string {
  if (classLevel >= 9) return 'Isha'
  if (classLevel >= 6) return 'Rohan'
  if (classLevel >= 3) return 'Anaya'
  return 'Aarav'
}

export function parseNameList(raw: string): string[] {
  const seen = new Set<string>()
  const names: string[] = []
  for (const part of raw.split(/[\n,;]+/)) {
    const name = part.trim().replace(/\s+/g, ' ')
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    names.push(name)
    if (names.length >= 30) break
  }
  return names
}

export function parseWordList(raw: string): string[] {
  const seen = new Set<string>()
  const words: string[] = []
  for (const part of raw.split(/[\n,;]+/)) {
    const word = part.trim()
    if (!word) continue
    const key = word.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    words.push(word)
  }
  return words
}

export function parsePairLines(raw: string): { left: string; right: string }[] {
  const pairs: { left: string; right: string }[] = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const idx = trimmed.indexOf('|')
    if (idx < 0) continue
    const left = trimmed.slice(0, idx).trim()
    const right = trimmed.slice(idx + 1).trim()
    if (left && right) pairs.push({ left, right })
  }
  return pairs
}

export function typeAvailable(type: WorksheetType, classLevel: SchoolClass): boolean {
  if (type === 'science') return classLevel >= 3
  return true
}

export function defaultQuestionCount(
  type: WorksheetType,
  classLevel: SchoolClass,
  difficulty: Difficulty,
): number {
  if (type === 'colouring' || type === 'rewardchart') return 1
  if (type === 'handwriting') return classLevel <= 2 ? 8 : 6
  if (type === 'matching' || type === 'oddoneout') {
    return difficulty === 'hard' ? 8 : difficulty === 'easy' ? 6 : 7
  }
  const base = difficulty === 'hard' ? 12 : difficulty === 'medium' ? 10 : 8
  if (classLevel >= 9) return Math.min(base, 10)
  if (classLevel <= 2) return difficulty === 'easy' ? 10 : 12
  return base
}

export function effectiveCount(input: WizardInput, fallback: number): number {
  const n = input.questionCount
  if (input.unlocked && n >= 4) return Math.min(25, Math.round(n))
  return fallback
}

export function gatedText(value: string, unlocked: boolean): string {
  return unlocked ? value.trim() : ''
}

export function baseFields<K extends WorksheetType>(
  input: WizardInput,
  kind: K,
): Omit<WorksheetBase, 'kind'> & { kind: K } {
  const unlocked = input.unlocked
  return {
    kind,
    seed: input.seed,
    title: (unlocked ? input.title.trim() : '') || defaultTitle(input.childName, unlocked, kind, input.classLevel),
    displayName: displayName(input.childName, unlocked),
    madeFor: madeForLine(input.childName, unlocked),
    theme: input.theme,
    unlocked,
    teacherPack: input.teacherPack,
    age: input.age || ageFromClass(input.classLevel),
    classLevel: input.classLevel,
    section: gatedText(input.section, unlocked),
    schoolName: gatedText(input.schoolName, unlocked),
    subject: gatedText(input.subject, unlocked) || (unlocked ? defaultSubject(kind) : ''),
    marks: gatedText(input.marks, unlocked),
    timeAllowed: gatedText(input.timeAllowed, unlocked),
    instructions: gatedText(input.instructions, unlocked),
    includeAnswerKey: unlocked ? input.includeAnswerKey : true,
    difficulty: input.difficulty,
    topic: input.topic,
  }
}

export function wizardInput(partial: Partial<WizardInput> & Pick<WizardInput, 'type'>): WizardInput {
  return applyInputDefaults({
    childName: 'Aarav',
    age: 8,
    classLevel: 3,
    section: '',
    schoolName: '',
    subject: '',
    marks: '',
    timeAllowed: '',
    instructions: '',
    includeAnswerKey: true,
    questionCount: 0,
    difficulty: 'easy',
    topic: 'addition',
    title: '',
    theme: 'sunshine',
    unlocked: false,
    teacherPack: false,
    seed: 1,
    customWords: '',
    customPairs: '',
    customQuestions: '',
    ...partial,
  })
}

export function applyInputDefaults(input: WizardInput): WizardInput {
  const classLevel = input.classLevel || classFromAge(input.age || 8)
  return {
    ...input,
    classLevel,
    age: input.age || ageFromClass(classLevel),
    section: input.section ?? '',
    schoolName: input.schoolName ?? '',
    subject: input.subject ?? '',
    marks: input.marks ?? '',
    timeAllowed: input.timeAllowed ?? '',
    instructions: input.instructions ?? '',
    includeAnswerKey: input.includeAnswerKey ?? true,
    questionCount: input.questionCount ?? 0,
    customWords: input.customWords ?? '',
    customPairs: input.customPairs ?? '',
    customQuestions: input.customQuestions ?? '',
    teacherPack: input.teacherPack ?? false,
  }
}

export function namedCopy<T extends WorksheetBase>(model: T, studentName: string): T {
  const name = studentName.trim()
  return {
    ...model,
    displayName: name,
    madeFor: `Made for ${name}`,
  }
}
