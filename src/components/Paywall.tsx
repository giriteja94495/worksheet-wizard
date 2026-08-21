import type { PaywallReason, UnlockTier } from '../types'

const COPY: Record<PaywallReason, { kicker: string; title: string; body: string }> = {
  download: {
    kicker: 'Daily free limit',
    title: 'That’s both free PDFs for today',
    body: 'Unlock lifetime for ₹49 and download as many sheets as Aarav, Anaya or the whole class needs — no watermark, no waiting until tomorrow.',
  },
  theme: {
    kicker: 'Premium theme',
    title: 'Ocean, Jungle and Space are in the lifetime pack',
    body: 'Sunshine is free. The other three palettes print with richer borders and matching colouring scenes.',
  },
  name: {
    kicker: 'Personalisation',
    title: 'Print their actual name on every sheet',
    body: 'Free sheets leave the name line blank. Lifetime prints “Isha” or “Kabir” in the header — the detail students notice.',
  },
  preview: {
    kicker: 'Worksheet Wizard Lifetime',
    title: 'Keep making sheets, skip the limits',
    body: 'Unlimited PDFs, every theme, name on the page, school header, no watermark. Demo unlock — no charge. Sign in so it follows your account.',
  },
  customise: {
    kicker: 'Full customisation',
    title: 'School header, marks, notes and question count',
    body: 'Lifetime unlocks the A4 chrome teachers actually use: school name, class-section, subject, marks, time, and a note to students.',
  },
  studio: {
    kicker: 'Teacher Pack',
    title: 'Save your library and print a class set',
    body: 'Teacher Studio can already preview your questions. The ₹149 pack (demo) keeps templates with you and downloads one named PDF copy per student.',
  },
}

interface Props {
  reason: PaywallReason
  unlocked: boolean
  teacherPack: boolean
  signedIn?: boolean
  onClose: () => void
  onUnlock: (tier: UnlockTier) => void
}

export function Paywall({ reason, unlocked, teacherPack, signedIn, onClose, onUnlock }: Props) {
  const copy = COPY[reason]
  const showTeacherFirst = reason === 'studio'
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-3 sm:items-center" role="dialog" aria-modal>
      <button className="absolute inset-0 cursor-default" aria-label="Close paywall" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-ink px-5 py-4 text-cream">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sunflower">{copy.kicker}</p>
          <h2 className="mt-1 font-display text-2xl leading-tight">{copy.title}</h2>
        </div>
        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed text-ink-soft">{copy.body}</p>

          {!showTeacherFirst && !unlocked ? (
            <div className="mt-4 rounded-2xl border border-ink/10 bg-cream/80 p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg">Lifetime</span>
                <span className="font-display text-3xl tracking-tight">
                  ₹49 <span className="text-base text-ink/45">one time</span>
                </span>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {['Unlimited PDF downloads', 'Name + school header', 'Ocean, Jungle & Space themes', 'No “Free” watermark'].map(
                  (item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-teal">✓</span>
                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
              <button
                type="button"
                onClick={() => onUnlock('lifetime')}
                className="mt-4 w-full rounded-xl bg-[#0D6E4F] py-3.5 text-[15px] font-extrabold text-white shadow-[0_8px_0_#0A543C] transition hover:translate-y-px"
              >
                Unlock lifetime for ₹49 — demo
              </button>
            </div>
          ) : null}

          {!teacherPack ? (
            <div className={`mt-3 rounded-2xl border p-4 ${showTeacherFirst ? 'border-coral bg-coral/5' : 'border-ink/10'}`}>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg">Teacher Pack</span>
                <span className="font-display text-3xl tracking-tight">
                  ₹149 <span className="text-base text-ink/45">one time</span>
                </span>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {['Everything in Lifetime', 'Save / load Teacher Studio templates', 'Class list of up to 30 names', 'Named multi-page class PDF'].map(
                  (item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-teal">✓</span>
                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
              <button
                type="button"
                onClick={() => onUnlock('teacher')}
                className="mt-4 w-full rounded-xl bg-ink py-3.5 text-[15px] font-extrabold text-cream shadow-[0_8px_0_#12182A] transition hover:translate-y-px"
              >
                Unlock Teacher Pack for ₹149 — demo
              </button>
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-teal/10 px-3 py-2 text-center text-sm font-bold text-teal-dark">
              {signedIn ? 'Teacher Pack is on your account.' : 'Teacher Pack is already on this device.'}
            </p>
          )}

          <p className="mt-3 text-center text-[11px] text-ink/45">
            Demo checkout — no UPI, card or wallet is charged.
            {signedIn ? ' This unlock is saved to your account.' : ' Sign in if you want it to follow you across devices.'}
          </p>
          <button type="button" onClick={onClose} className="mt-3 w-full py-2 text-sm font-semibold text-ink/55 hover:text-ink">
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
