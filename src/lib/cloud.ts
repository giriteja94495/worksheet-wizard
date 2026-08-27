import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'
import type { SavedClassList, TeacherTemplate, ThemeId } from '../types'
import { db } from './firebase'
import { clampClass } from './sheet'

export interface CloudProfile {
  email: string
  displayName: string
  unlocked: boolean
  teacherPack: boolean
}

function firestore(): Firestore {
  if (!db) throw new Error('Firebase is not configured')
  return db
}

function userDoc(uid: string) {
  return doc(firestore(), 'users', uid)
}

function templateDoc(uid: string, id: string) {
  return doc(firestore(), 'users', uid, 'templates', id)
}

function classListDoc(uid: string, id: string) {
  return doc(firestore(), 'users', uid, 'classLists', id)
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function asInt(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
}

function millis(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value && typeof value === 'object' && 'toMillis' in value) {
    const ts = value as { toMillis: () => number }
    if (typeof ts.toMillis === 'function') return ts.toMillis()
  }
  return Date.now()
}

function isTheme(value: unknown): value is ThemeId {
  return value === 'sunshine' || value === 'ocean' || value === 'jungle' || value === 'space'
}

export async function getProfile(uid: string): Promise<CloudProfile | null> {
  const snap = await getDoc(userDoc(uid))
  if (!snap.exists()) return null
  const data = snap.data()
  const teacherPack = asBool(data.teacherPack)
  return {
    email: asString(data.email),
    displayName: asString(data.displayName),
    unlocked: teacherPack || asBool(data.unlocked),
    teacherPack,
  }
}

export async function upsertProfile(user: User, patch: Partial<CloudProfile> = {}): Promise<CloudProfile> {
  const existing = await getProfile(user.uid)
  const teacherPack = patch.teacherPack ?? existing?.teacherPack ?? false
  const profile: CloudProfile = {
    email: (patch.email ?? existing?.email ?? user.email ?? '').slice(0, 320),
    displayName: (patch.displayName ?? existing?.displayName ?? user.displayName ?? '').slice(0, 120),
    teacherPack,
    unlocked: teacherPack || (patch.unlocked ?? existing?.unlocked ?? false),
  }
  await setDoc(userDoc(user.uid), {
    ...profile,
    updatedAt: serverTimestamp(),
  })
  return profile
}

export async function saveUnlockToCloud(uid: string, teacherPack: boolean): Promise<void> {
  const existing = await getProfile(uid)
  await setDoc(userDoc(uid), {
    email: existing?.email ?? '',
    displayName: existing?.displayName ?? '',
    unlocked: true,
    teacherPack,
    updatedAt: serverTimestamp(),
  })
}

export function templateToCloud(template: TeacherTemplate) {
  return {
    name: template.name.slice(0, 200),
    classNum: template.classLevel,
    subject: template.subject.slice(0, 120),
    questions: template.questions.slice(0, 100000),
    wordList: template.customWords.slice(0, 20000),
    pairs: template.customPairs.slice(0, 20000),
    topic: template.topic.slice(0, 80),
    title: template.title.slice(0, 200),
    schoolName: template.schoolName.slice(0, 200),
    section: template.section.slice(0, 40),
    marks: template.marks.slice(0, 40),
    timeAllowed: template.timeAllowed.slice(0, 40),
    instructions: template.instructions.slice(0, 4000),
    includeAnswerKey: template.includeAnswerKey,
    questionCount: Math.max(0, Math.min(500, Math.round(template.questionCount || 0))),
    theme: template.theme,
    updatedAt: serverTimestamp(),
  }
}

export function cloudToTemplate(id: string, data: Record<string, unknown>): TeacherTemplate {
  const classNum = asInt(data.classNum, asInt(data.classLevel, 3))
  return {
    id,
    name: asString(data.name, 'Untitled worksheet'),
    classLevel: clampClass(classNum),
    subject: asString(data.subject, 'Mathematics'),
    topic: asString(data.topic, 'custom'),
    title: asString(data.title),
    schoolName: asString(data.schoolName),
    section: asString(data.section),
    marks: asString(data.marks, '20'),
    timeAllowed: asString(data.timeAllowed, '30 min'),
    instructions: asString(data.instructions),
    includeAnswerKey: data.includeAnswerKey !== false,
    questionCount: asInt(data.questionCount, 0),
    questions: asString(data.questions),
    customWords: asString(data.wordList, asString(data.customWords)),
    customPairs: asString(data.pairs, asString(data.customPairs)),
    theme: isTheme(data.theme) ? data.theme : 'sunshine',
    sample: false,
    updatedAt: millis(data.updatedAt),
  }
}

export async function listCloudTemplates(uid: string): Promise<TeacherTemplate[]> {
  const snap = await getDocs(collection(firestore(), 'users', uid, 'templates'))
  return snap.docs
    .map((d) => cloudToTemplate(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function upsertCloudTemplate(uid: string, template: TeacherTemplate): Promise<void> {
  if (!template.id || template.sample || template.id.startsWith('sample-')) return
  await setDoc(templateDoc(uid, template.id), templateToCloud(template))
}

export async function deleteCloudTemplate(uid: string, id: string): Promise<void> {
  if (!id || id.startsWith('sample-')) return
  await deleteDoc(templateDoc(uid, id))
}

function asNameList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((n): n is string => typeof n === 'string')
      .map((n) => n.trim().replace(/\s+/g, ' '))
      .filter(Boolean)
      .slice(0, 30)
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,;]+/)
      .map((n) => n.trim().replace(/\s+/g, ' '))
      .filter(Boolean)
      .slice(0, 30)
  }
  return []
}

export function classListToCloud(list: SavedClassList) {
  return {
    name: list.name.slice(0, 200),
    names: list.names.slice(0, 30).map((n) => n.slice(0, 80)),
    updatedAt: serverTimestamp(),
  }
}

export function cloudToClassList(id: string, data: Record<string, unknown>): SavedClassList {
  return {
    id,
    name: asString(data.name, 'My class'),
    names: asNameList(data.names),
    updatedAt: millis(data.updatedAt),
  }
}

export async function listCloudClassLists(uid: string): Promise<SavedClassList[]> {
  const snap = await getDocs(collection(firestore(), 'users', uid, 'classLists'))
  return snap.docs
    .map((d) => cloudToClassList(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function upsertCloudClassList(uid: string, list: SavedClassList): Promise<void> {
  if (!list.id) return
  await setDoc(classListDoc(uid, list.id), classListToCloud(list))
}

export async function deleteCloudClassList(uid: string, id: string): Promise<void> {
  if (!id) return
  await deleteDoc(classListDoc(uid, id))
}
