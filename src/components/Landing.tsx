import { generateWorksheet } from '../lib/generators'
import { renderPreview } from '../lib/generators'
import { WorksheetPaper } from './WorksheetPaper'
import { Pricing } from './Pricing'
import { Logo } from './Logo'
import { TYPE_META } from '../lib/catalog'
import type { WorksheetType } from '../types'

interface Props {
  unlocked: boolean
  onCreate: () => void
  onSample: () => void
  onUnlock: () => void
}

const SAMPLES: { type: WorksheetType; rotate: string; z: string; name: string; topic: string; title: string; theme: 'sunshine' | 'ocean' | 'jungle' }[] = [
  {
    type: 'maths',
    rotate: '-rotate-6',
    z: 'z-20',
    name: 'Aarav',
    topic: 'addition',
    title: "Aarav's Maths Practice",
    theme: 'sunshine',
  },
  {
    type: 'handwriting',
    rotate: 'rotate-2',
    z: 'z-30',
    name: 'Anaya',
    topic: 'name',
    title: "Anaya's Handwriting Practice",
    theme: 'ocean',
  },
  {
    type: 'wordsearch',
    rotate: 'rotate-6',
    z: 'z-10',
    name: 'Kabir',
    topic: 'animals',
    title: "Kabir's Word Search",
    theme: 'jungle',
  },
]

export function Landing({ unlocked, onCreate, onSample, onUnlock }: Props) {
  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Logo compact />
          <nav className="hidden items-center gap-6 text-sm font-bold sm:flex">
            <a href="#features" className="hover:text-coral">Features</a>
            <a href="#pricing" className="hover:text-coral">Pricing</a>
            <button type="button" onClick={onCreate} className="rounded-full bg-ink px-4 py-2 text-cream">
              Create
            </button>
          </nav>
          <button type="button" onClick={onCreate} className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-cream sm:hidden">
            Create
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16">
        <div>
          <p className="inline-flex rounded-full bg-sunflower/50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink">
            For Indian parents & teachers
          </p>
          <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] sm:text-5xl">
            Worksheets that feel like they were made just for them.
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink-soft">
            Create a custom maths, spelling, handwriting, or puzzle worksheet in 30 seconds.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onCreate}
              className="rounded-xl bg-coral px-5 py-3 text-sm font-extrabold text-white shadow-[0_6px_0_#C45344] hover:translate-y-px"
            >
              Create a worksheet
            </button>
            <button
              type="button"
              onClick={onSample}
              className="rounded-xl border-2 border-ink/15 bg-white px-5 py-3 text-sm font-bold hover:bg-cream"
            >
              See a sample PDF
            </button>
          </div>
          <p className="mt-4 text-sm text-ink/50">No signup. Runs in the browser. Prints on A4.</p>
        </div>
        <div className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[26rem]">
          {SAMPLES.map((s, i) => {
            const model = generateWorksheet({
              type: s.type,
              childName: s.name,
              age: 7,
              difficulty: 'easy',
              topic: s.topic,
              title: s.title,
              theme: s.theme,
              unlocked: true,
              seed: 1200 + i * 77,
            })
            return (
              <div
                key={s.type}
                className={`absolute left-1/2 top-4 w-[58%] origin-bottom -translate-x-1/2 ${s.rotate} ${s.z}`}
                style={{ marginLeft: `${(i - 1) * 18}%` }}
              >
                <WorksheetPaper title={model.title} madeFor={model.madeFor} theme={model.theme}>
                  {renderPreview(model)}
                </WorksheetPaper>
              </div>
            )
          })}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white/60 px-4 py-14">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {[
            { n: '01', t: 'Pick a type', d: 'Maths, handwriting, spelling, puzzles, colouring, or a weekly star chart.' },
            { n: '02', t: 'Personalise', d: 'Name, age 4–12, easy / medium / hard, and a topic that matches the child.' },
            { n: '03', t: 'Print', d: 'Download a real A4 PDF or hit Print. Watermark only on the free plan.' },
          ].map((s) => (
            <div key={s.n} className="rounded-3xl bg-cream p-6">
              <p className="font-display text-3xl text-coral">{s.n}</p>
              <h3 className="mt-2 font-display text-xl">{s.t}</h3>
              <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="scroll-mt-24 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-[12px] font-bold uppercase tracking-[0.2em] text-teal">On the menu</p>
          <h2 className="mt-2 text-center font-display text-3xl sm:text-4xl">Eight sheets, one sitting</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(TYPE_META) as WorksheetType[]).map((id) => {
              const m = TYPE_META[id]
              return (
                <button
                  key={id}
                  type="button"
                  onClick={onCreate}
                  className="rounded-2xl border border-ink/10 bg-white p-4 text-left hover:border-coral/50"
                >
                  <span className="font-display text-2xl">{m.icon}</span>
                  <h3 className="mt-2 font-bold">{m.label}</h3>
                  <p className="mt-1 text-[13px] text-ink/55">{m.blurb}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <Pricing unlocked={unlocked} onUnlock={onUnlock} />

      <footer className="border-t border-ink/10 px-4 py-10 text-center text-sm text-ink/55">
        <p>Made for Indian parents & teachers · Works fully in your browser · No signup</p>
        <p className="mt-2 font-display text-ink">Worksheet Wizard · worksheetwizard.app</p>
      </footer>
    </div>
  )
}
