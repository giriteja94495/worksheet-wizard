import type { Difficulty, SchoolClass, TeacherTemplate, ThemeId, UnlockTier, WorksheetType } from '../types'
import { SAMPLE_TEMPLATES } from './templates'

const UNLOCK_KEY = 'ww.unlocked'
const COUNT_KEY = 'ww.dailyDownloads'
const FORM_KEY = 'ww.lastForm'
const TEMPLATES_KEY = 'ww.templates'

export interface SavedForm {
  childName: string
  age: number
  classLevel: SchoolClass
  section: string
  schoolName: string
  subject: string
  marks: string
  timeAllowed: string
  instructions: string
  includeAnswerKey: boolean
  questionCount: number
  difficulty: Difficulty
  type: WorksheetType
  topic: string
  title: string
  theme: ThemeId
  customWords: string
  customPairs: string
}

interface DailyCount {
  date: string
  count: number
}

function todayStamp(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getUnlockTier(): UnlockTier {
  try {
    const v = localStorage.getItem(UNLOCK_KEY)
    if (v === 'teacher') return 'teacher'
    if (v === 'lifetime') return 'lifetime'
    return 'free'
  } catch {
    return 'free'
  }
}

export function isUnlocked(): boolean {
  const tier = getUnlockTier()
  return tier === 'lifetime' || tier === 'teacher'
}

export function isTeacherPack(): boolean {
  return getUnlockTier() === 'teacher'
}

export function unlockLifetime(): void {
  if (isTeacherPack()) return
  localStorage.setItem(UNLOCK_KEY, 'lifetime')
}

export function unlockTeacherPack(): void {
  localStorage.setItem(UNLOCK_KEY, 'teacher')
}

export function getDailyDownloads(): number {
  try {
    const raw = localStorage.getItem(COUNT_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw) as DailyCount
    if (parsed.date !== todayStamp()) return 0
    return parsed.count
  } catch {
    return 0
  }
}

export function incrementDailyDownloads(): number {
  const next = getDailyDownloads() + 1
  localStorage.setItem(COUNT_KEY, JSON.stringify({ date: todayStamp(), count: next }))
  return next
}

export const FREE_DAILY_LIMIT = 2

export function remainingFreeDownloads(): number {
  return Math.max(0, FREE_DAILY_LIMIT - getDailyDownloads())
}

export function saveForm(form: SavedForm): void {
  localStorage.setItem(FORM_KEY, JSON.stringify(form))
}

export function loadForm(): Partial<SavedForm> {
  try {
    const raw = localStorage.getItem(FORM_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<SavedForm>
  } catch {
    return {}
  }
}

function readUserTemplates(): TeacherTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as TeacherTemplate[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((t) => t && typeof t.id === 'string' && typeof t.questions === 'string')
  } catch {
    return []
  }
}

function writeUserTemplates(list: TeacherTemplate[]): void {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list))
}

export function listTemplates(): TeacherTemplate[] {
  const user = readUserTemplates().sort((a, b) => b.updatedAt - a.updatedAt)
  return [...SAMPLE_TEMPLATES, ...user]
}

export function getTemplate(id: string): TeacherTemplate | undefined {
  return listTemplates().find((t) => t.id === id)
}

export function saveTemplate(template: TeacherTemplate): TeacherTemplate {
  const now = Date.now()
  const next: TeacherTemplate = {
    ...template,
    sample: false,
    updatedAt: now,
    id: template.sample || template.id.startsWith('sample-') ? `t-${now}` : template.id,
  }
  const others = readUserTemplates().filter((t) => t.id !== next.id)
  writeUserTemplates([next, ...others])
  return next
}

export function renameTemplate(id: string, name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  writeUserTemplates(readUserTemplates().map((t) => (t.id === id ? { ...t, name: trimmed, updatedAt: Date.now() } : t)))
}

export function deleteTemplate(id: string): void {
  if (id.startsWith('sample-')) return
  writeUserTemplates(readUserTemplates().filter((t) => t.id !== id))
}

export function newTemplateId(): string {
  return `t-${Date.now()}`
}
