import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth, firebaseConfigured, googleProvider } from './firebase'
import { attachCloudSession, detachCloudSession } from './session'
import type { CloudProfile } from './cloud'
import { isTeacherPack, isUnlocked } from './storage'

interface AuthContextValue {
  user: User | null
  profile: CloudProfile | null
  ready: boolean
  syncing: boolean
  dataEpoch: number
  cloudAvailable: boolean
  authOpen: boolean
  openAuth: () => void
  closeAuth: () => void
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  createAccount: (email: string, password: string, displayName: string) => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<CloudProfile | null>(null)
  const [ready, setReady] = useState(() => !auth)
  const [syncing, setSyncing] = useState(false)
  const [dataEpoch, setDataEpoch] = useState(0)
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    if (!auth) return
    let generation = 0
    const unsub = onAuthStateChanged(auth, (next) => {
      const my = ++generation
      setUser(next)
      if (!next) {
        detachCloudSession()
        setProfile(null)
        setSyncing(false)
        setReady(true)
        setDataEpoch((n) => n + 1)
        return
      }
      setSyncing(true)
      void attachCloudSession(next)
        .then((cloud) => {
          if (my !== generation) return
          setProfile(cloud)
          setDataEpoch((n) => n + 1)
        })
        .catch((err) => {
          console.warn('Worksheet Wizard could not load cloud library', err)
          if (my !== generation) return
          setProfile({
            email: next.email ?? '',
            displayName: next.displayName ?? '',
            unlocked: isUnlocked(),
            teacherPack: isTeacherPack(),
          })
          setDataEpoch((n) => n + 1)
        })
        .finally(() => {
          if (my !== generation) return
          setSyncing(false)
          setReady(true)
        })
    })
    return () => {
      generation += 1
      unsub()
    }
  }, [])

  const openAuth = useCallback(() => setAuthOpen(true), [])
  const closeAuth = useCallback(() => setAuthOpen(false), [])

  const afterSignIn = useCallback(() => {
    setAuthOpen(false)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw Object.assign(new Error('Cloud sign-in isn’t configured.'), { code: 'auth/configuration-not-found' })
    await signInWithPopup(auth, googleProvider)
    afterSignIn()
  }, [afterSignIn])

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!auth) throw Object.assign(new Error('Cloud sign-in isn’t configured.'), { code: 'auth/configuration-not-found' })
      await signInWithEmailAndPassword(auth, email.trim(), password)
      afterSignIn()
    },
    [afterSignIn],
  )

  const createAccount = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (!auth) throw Object.assign(new Error('Cloud sign-in isn’t configured.'), { code: 'auth/configuration-not-found' })
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      const name = displayName.trim()
      if (name) await updateProfile(cred.user, { displayName: name })
      afterSignIn()
    },
    [afterSignIn],
  )

  const signOutUser = useCallback(async () => {
    if (!auth) return
    await signOut(auth)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      ready,
      syncing,
      dataEpoch,
      cloudAvailable: firebaseConfigured,
      authOpen,
      openAuth,
      closeAuth,
      signInWithGoogle,
      signInWithEmail,
      createAccount,
      signOutUser,
    }),
    [
      user,
      profile,
      ready,
      syncing,
      dataEpoch,
      authOpen,
      openAuth,
      closeAuth,
      signInWithGoogle,
      signInWithEmail,
      createAccount,
      signOutUser,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
