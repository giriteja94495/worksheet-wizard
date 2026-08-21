import type { UnlockTier } from '../types'

interface Props {
  unlocked: boolean
  teacherPack: boolean
  onUnlock: (tier: UnlockTier) => void
}

export function Pricing({ unlocked, teacherPack, onUnlock }: Props) {
  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-[12px] font-bold uppercase tracking-[0.2em] text-coral">Pricing</p>
        <h2 className="mt-2 text-center font-display text-3xl sm:text-4xl">One tea, a lifetime of sheets</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-ink-soft">
          Built for a Sunday afternoon at the dining table — and for the teacher who needs thirty named copies by first period.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-ink/10 bg-white p-6">
            <p className="text-[12px] font-bold uppercase tracking-widest text-ink/45">Free</p>
            <p className="mt-2 font-display text-4xl">₹0</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              <li>2 PDF downloads a day</li>
              <li>Sunshine theme</li>
              <li>Watermark on the page</li>
              <li>Name and school header locked</li>
            </ul>
          </article>
          <article className="relative rounded-3xl border-2 border-coral bg-white p-6 shadow-[0_16px_40px_-24px_#E06C5C]">
            <span className="absolute -top-3 left-6 rounded-full bg-coral px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white">
              Most loved
            </span>
            <p className="text-[12px] font-bold uppercase tracking-widest text-coral">Lifetime</p>
            <p className="mt-2 font-display text-4xl">
              ₹49 <span className="text-lg text-ink/40">once</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Unlimited downloads, no watermark</li>
              <li>All four themes</li>
              <li>Name, school, marks, time, notes</li>
              <li>Full customisation of generated sheets</li>
            </ul>
            {unlocked ? (
              <p className="mt-5 rounded-xl bg-teal/10 px-3 py-2 text-center text-sm font-bold text-teal-dark">
                Unlocked on this device
              </p>
            ) : (
              <button
                type="button"
                onClick={() => onUnlock('lifetime')}
                className="mt-5 w-full rounded-xl bg-[#0D6E4F] py-3 text-sm font-extrabold text-white shadow-[0_6px_0_#0A543C] hover:translate-y-px"
              >
                Unlock lifetime for ₹49 — demo
              </button>
            )}
          </article>
          <article className="relative rounded-3xl border-2 border-ink bg-white p-6">
            <span className="absolute -top-3 right-6 rounded-full bg-ink px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-cream">
              For teachers
            </span>
            <p className="text-[12px] font-bold uppercase tracking-widest text-ink/45">Teacher Pack</p>
            <p className="mt-2 font-display text-4xl">
              ₹149 <span className="text-lg text-ink/40">once</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Everything in Lifetime</li>
              <li>Teacher Studio library (save / load)</li>
              <li>Class list of up to 30 names</li>
              <li>One multi-page PDF, named copies</li>
            </ul>
            {teacherPack ? (
              <p className="mt-5 rounded-xl bg-teal/10 px-3 py-2 text-center text-sm font-bold text-teal-dark">
                Teacher Pack unlocked
              </p>
            ) : (
              <button
                type="button"
                onClick={() => onUnlock('teacher')}
                className="mt-5 w-full rounded-xl bg-ink py-3 text-sm font-extrabold text-cream shadow-[0_6px_0_#12182A] hover:translate-y-px"
              >
                Unlock Teacher Pack for ₹149 — demo
              </button>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
