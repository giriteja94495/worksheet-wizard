import type { User } from 'firebase/auth'
import type { CloudProfile } from './cloud'
import {
  getProfile,
  listCloudClassLists,
  listCloudTemplates,
  upsertCloudClassList,
  upsertCloudTemplate,
  upsertProfile,
} from './cloud'
import {
  applyUnlockTier,
  getCloudBoundUid,
  getUnlockTier,
  readClassLists,
  readUserTemplates,
  setActiveCloudUid,
  setCloudBoundUid,
  writeClassLists,
  writeUserTemplates,
} from './storage'

export async function attachCloudSession(user: User): Promise<CloudProfile> {
  const boundUid = getCloudBoundUid()
  const localTier = getUnlockTier()
  const localTemplates = readUserTemplates()
  const localLists = readClassLists()
  const existing = await getProfile(user.uid)
  const isNew = existing === null
  const boundToSomeoneElse = Boolean(boundUid && boundUid !== user.uid)

  const teacherPack = existing?.teacherPack === true || localTier === 'teacher'
  const unlocked = teacherPack || existing?.unlocked === true || localTier === 'lifetime'

  const profile = await upsertProfile(user, {
    unlocked,
    teacherPack,
    email: user.email ?? existing?.email ?? '',
    displayName: user.displayName ?? existing?.displayName ?? '',
  })

  const cloudTemplates = isNew ? [] : await listCloudTemplates(user.uid)
  const cloudLists = isNew ? [] : await listCloudClassLists(user.uid)
  const emptyCloudLibrary = cloudTemplates.length === 0 && cloudLists.length === 0

  const migrateGuestLibrary = !boundToSomeoneElse && (isNew || emptyCloudLibrary)
  const mergeOfflineEdits = boundUid === user.uid

  if (migrateGuestLibrary || mergeOfflineEdits) {
    const templateIds = new Set(cloudTemplates.map((t) => t.id))
    const listIds = new Set(cloudLists.map((l) => l.id))
    for (const template of localTemplates) {
      if (!templateIds.has(template.id)) {
        await upsertCloudTemplate(user.uid, template)
        templateIds.add(template.id)
      }
    }
    for (const list of localLists) {
      if (!listIds.has(list.id)) {
        await upsertCloudClassList(user.uid, list)
        listIds.add(list.id)
      }
    }
  }

  writeUserTemplates(await listCloudTemplates(user.uid))
  writeClassLists(await listCloudClassLists(user.uid))

  if (profile.teacherPack) applyUnlockTier('teacher')
  else if (profile.unlocked) applyUnlockTier('lifetime')

  setCloudBoundUid(user.uid)
  setActiveCloudUid(user.uid)
  return profile
}

export function detachCloudSession(): void {
  setActiveCloudUid(null)
}
