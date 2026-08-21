import type { Difficulty, SavedClassList, SchoolClass, TeacherTemplate, ThemeId, UnlockTier, WorksheetType } from '../types'
import { SAMPLE_TEMPLATES } from './templates'
import {
  deleteCloudClassList,
  deleteCloudTemplate,
  saveUnlockToCloud,
  upsertCloudClassList,
  upsertCloudTemplate,
} from './cloud'

const UNLOCK_KEY = 'ww.unlocked'
const COUNT_KEY = 'ww.dailyDownloads'
const FORM_KEY = 'ww.lastForm'
const TEMPLATES_KEY = 'ww.templates'
const CLASS_LISTS_KEY = 'ww.classLists'
const CLASS_LIST_DRAFT_KEY = 'ww.classListDraft'
const CLOUD_BOUND_KEY = 'ww.cloudBoundUid'

export const DEFAULT_CLASS_LIST = 'Aarav\nAnaya\nKabir\nIsha\nRohan'

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

let activeCloudUid: string | null = null

export function setActiveCloudUid(uid: string | null): void {
  activeCloudUid = uid
}

export function getCloudBoundUid(): string | null {
  try {
    return localStorage.getItem(CLOUD_BOUND_KEY)
  } catch {
    return null
  }
}

export function setCloudBoundUid(uid: string | null): void {
  try {
    if (uid) localStorage.setItem(CLOUD_BOUND_KEY, uid)
    else localStorage.removeItem(CLOUD_BOUND_KEY)
  } catch {
    /* ignore quota / private mode */
  }
}

function cloudWrite(task: (uid: string) => Promise<void>): void {
  const uid = activeCloudUid
  if (!uid) return
  void task(uid).catch((err) => {
    console.warn('Worksheet Wizard cloud sync failed', err)
  })
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

function persistUnlock(tier: UnlockTier): void {
  localStorage.setItem(UNLOCK_KEY, tier)
  cloudWrite((uid) => saveUnlockToCloud(uid, tier === 'teacher'))
}

export function unlockLifetime(): void {
  if (isTeacherPack()) return
  persistUnlock('lifetime')
}

export function unlockTeacherPack(): void {
  persistUnlock('teacher')
}

export function applyUnlockTier(tier: UnlockTier): void {
  if (tier === 'free') return
  localStorage.setItem(UNLOCK_KEY, tier)
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

export function readUserTemplates(): TeacherTemplate[] {
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

export function writeUserTemplates(list: TeacherTemplate[]): void {
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
  cloudWrite((uid) => upsertCloudTemplate(uid, next))
  return next
}

export function renameTemplate(id: string, name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  const next = readUserTemplates().map((t) => (t.id === id ? { ...t, name: trimmed, updatedAt: Date.now() } : t))
  writeUserTemplates(next)
  const saved = next.find((t) => t.id === id)
  if (saved) cloudWrite((uid) => upsertCloudTemplate(uid, saved))
}

export function deleteTemplate(id: string): void {
  if (id.startsWith('sample-')) return
  writeUserTemplates(readUserTemplates().filter((t) => t.id !== id))
  cloudWrite((uid) => deleteCloudTemplate(uid, id))
}

export function newTemplateId(): string {
  return `t-${Date.now()}`
}

export function readClassLists(): SavedClassList[] {
  try {
    const raw = localStorage.getItem(CLASS_LISTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedClassList[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((l) => l && typeof l.id === 'string' && Array.isArray(l.names))
  } catch {
    return []
  }
}

export function writeClassLists(list: SavedClassList[]): void {
  localStorage.setItem(CLASS_LISTS_KEY, JSON.stringify(list))
}

export function listClassLists(): SavedClassList[] {
  return readClassLists().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function saveClassList(list: SavedClassList): SavedClassList {
  const now = Date.now()
  const next: SavedClassList = {
    id: list.id || `cl-${now}`,
    name: list.name.trim() || 'My class',
    names: list.names.slice(0, 30),
    updatedAt: now,
  }
  const others = readClassLists().filter((l) => l.id !== next.id)
  writeClassLists([next, ...others])
  cloudWrite((uid) => upsertCloudClassList(uid, next))
  return next
}

export function deleteClassList(id: string): void {
  writeClassLists(readClassLists().filter((l) => l.id !== id))
  cloudWrite((uid) => deleteCloudClassList(uid, id))
}

export function loadClassListDraft(): string {
  try {
    const raw = localStorage.getItem(CLASS_LIST_DRAFT_KEY)
    if (typeof raw === 'string' && raw.length) return raw
  } catch {
    /* ignore */
  }
  return DEFAULT_CLASS_LIST
}

export function saveClassListDraft(text: string): void {
  localStorage.setItem(CLASS_LIST_DRAFT_KEY, text)
}
