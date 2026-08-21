import { useState, type FormEvent } from 'react'
import { useAuth } from '../lib/auth'
import { explainAuthError } from '../lib/auth-errors'
import { Logo } from './Logo'

export function AuthModal() {
  const { authOpen, closeAuth, signInWithGoogle, signInWithEmail, createAccount } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!authOpen) return null

  const reset = () => {
    setError('')
    setBusy(false)
  }

  const onGoogle = async () => {
    setBusy(true)
    setError('')
    try {
      await signInWithGoogle()
      reset()
    } catch (err) {
      setError(explainAuthError(err))
      setBusy(false)
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'signup') await createAccount(email, password, name)
      else await signInWithEmail(email, password)
      reset()
    } catch (err) {
      setError(explainAuthError(err))
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-3 sm:items-center" role="dialog" aria-modal aria-labelledby="auth-title">
      <button className="absolute inset-0 cursor-default" aria-label="Close sign in" onClick={closeAuth} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-ink px-5 py-4 text-cream">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sunflower">Optional · Cloud library</p>
          <h2 id="auth-title" className="mt-1 font-display text-2xl leading-tight">
            {mode === 'signin' ? 'Sign in to Worksheet Wizard' : 'Create your teacher account'}
          </h2>
          <p className="mt-2 text-sm text-cream/75">
            Guests still work in this browser. An account keeps templates, class lists and demo unlocks with you.
          </p>
        </div>
        <div className="px-5 py-5">
          <div className="mb-4 flex justify-center">
            <Logo compact />
          </div>
          <button
            type="button"
            onClick={() => void onGoogle()}
            disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-ink/10 bg-white py-3 text-sm font-extrabold hover:bg-cream disabled:opacity-60"
          >
            <GoogleMark />
            Continue with Google
          </button>
          <div className="my-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-ink/35">
            <span className="h-px flex-1 bg-ink/10" />
            or email
            <span className="h-px flex-1 bg-ink/10" />
          </div>
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-3">
            {mode === 'signup' ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Ms. Sharma"
                  className="w-full rounded-xl border border-ink/15 bg-cream/60 px-3 py-2.5 outline-none ring-coral/40 focus:bg-white focus:ring-2"
                />
              </label>
            ) : null}
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@school.com"
                className="w-full rounded-xl border border-ink/15 bg-cream/60 px-3 py-2.5 outline-none ring-coral/40 focus:bg-white focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                className="w-full rounded-xl border border-ink/15 bg-cream/60 px-3 py-2.5 outline-none ring-coral/40 focus:bg-white focus:ring-2"
              />
            </label>
            {error ? (
              <p className="rounded-xl bg-coral/10 px-3 py-2 text-sm font-semibold leading-relaxed text-coral-dark">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-coral py-3.5 text-[15px] font-extrabold text-white shadow-[0_8px_0_#C45344] transition hover:translate-y-px disabled:opacity-60"
            >
              {busy ? 'One moment…' : mode === 'signin' ? 'Sign in with email' : 'Create account'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            {mode === 'signin' ? (
              <button type="button" className="font-bold text-ink/70 hover:text-ink" onClick={() => { setMode('signup'); setError('') }}>
                New here? Create an account
              </button>
            ) : (
              <button type="button" className="font-bold text-ink/70 hover:text-ink" onClick={() => { setMode('signin'); setError('') }}>
                Already have an account? Sign in
              </button>
            )}
          </p>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-ink/45">
            Sign-in is optional. Google on GitHub Pages needs giriteja94495.github.io in Firebase authorised domains.
          </p>
          <button type="button" onClick={closeAuth} className="mt-2 w-full py-2 text-sm font-semibold text-ink/55 hover:text-ink">
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.69 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  )
}
