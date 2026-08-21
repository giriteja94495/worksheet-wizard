import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../lib/auth'

export function AccountMenu() {
  const { user, profile, syncing, openAuth, signOutUser } = useAuth()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) {
    return (
      <button
        type="button"
        onClick={openAuth}
        className="rounded-full border-2 border-ink/10 bg-white px-3 py-1.5 text-sm font-extrabold hover:border-coral/40"
      >
        Sign in
      </button>
    )
  }

  const name = profile?.displayName || user.displayName || user.email || 'Teacher'
  const email = user.email ?? profile?.email ?? ''
  const initial = name.trim().charAt(0).toUpperCase() || 'W'
  const photo = user.photoURL

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[11rem] items-center gap-2 rounded-full border-2 border-ink/10 bg-white py-0.5 pl-0.5 pr-2.5 hover:border-coral/40 sm:max-w-[14rem]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {photo ? (
          <img src={photo} alt="" className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-display text-sm text-cream">
            {initial}
          </span>
        )}
        <span className="min-w-0 text-left">
          <span className="block truncate text-[13px] font-extrabold leading-tight">{name}</span>
          <span className="block truncate text-[10px] font-bold uppercase tracking-wide text-teal-dark">
            {syncing ? 'Saving…' : 'Cloud library'}
          </span>
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-ink/10 bg-white p-3 shadow-[0_18px_40px_-18px_rgb(31_42_68_/_0.35)]"
        >
          <p className="truncate font-display text-lg leading-tight">{name}</p>
          {email ? <p className="truncate text-[12px] text-ink/50">{email}</p> : null}
          <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-[12px] leading-relaxed text-ink/60">
            Templates and class lists save to your account. Demo unlocks travel with you too — still no real payment.
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              void signOutUser()
            }}
            className="mt-3 w-full rounded-xl bg-ink py-2.5 text-sm font-extrabold text-cream"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
