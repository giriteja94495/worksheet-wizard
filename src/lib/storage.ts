import type { Difficulty, ThemeId, WorksheetType } from '../types'

const UNLOCK_KEY = 'ww.unlocked'
const COUNT_KEY = 'ww.dailyDownloads'
const FORM_KEY = 'ww.lastForm'

export interface SavedForm {
  childName: string
  age: number
  difficulty: Difficulty
  type: WorksheetType
  topic: string
  title: string
  theme: ThemeId
}

interface DailyCount {
  date: string
  count: number
}

function todayStamp(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function isUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCK_KEY) === 'lifetime'
  } catch {
    return false
  }
}

export function unlockLifetime(): void {
  localStorage.setItem(UNLOCK_KEY, 'lifetime')
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
