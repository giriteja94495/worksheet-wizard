import { generateWorksheet, renderPreview } from '../lib/generators'
import { WorksheetPaper } from './WorksheetPaper'
import { Pricing } from './Pricing'
import { Logo } from './Logo'
import { AccountMenu } from './AccountMenu'
import { TYPE_META, TYPE_ORDER } from '../lib/catalog'
import { wizardInput } from '../lib/sheet'
import type { UnlockTier, WorksheetType } from '../types'

interface Props {
  unlocked: boolean
  teacherPack: boolean
  signedIn?: boolean
  onCreate: () => void
  onStudio: () => void
  onSample: () => void
  onUnlock: (tier: UnlockTier) => void
}

const SAMPLES: {
  type: WorksheetType
  rotate: string
  z: string
  name: string
  topic: string
  title: string
  theme: 'sunshine' | 'ocean' | 'jungle'
  classLevel: 3 | 6 | 10
}[] = [
  {
    type: 'maths',
    rotate: '-rotate-6',
    z: 'z-20',
    name: 'Aarav',
    topic: 'addition',
    title: "Aarav's Class 3 Maths Practice",
    theme: 'sunshine',
    classLevel: 3,
  },
  {
    type: 'grammar',
    rotate: 'rotate-2',
    z: 'z-30',
    name: 'Rohan',
    topic: 'tenses',
    title: "Rohan's Class 6 English Grammar",
    theme: 'ocean',
    classLevel: 6,
  },
  {
    type: 'quiz',
    rotate: 'rotate-6',
    z: 'z-10',
    name: 'Isha',
    topic: 'maths',
    title: "Isha's Class 10 Practice Paper",
    theme: 'jungle',
    classLevel: 10,
  },
]

export function Landing({ unlocked, teacherPack, signedIn, onCreate, onStudio, onSample, onUnlock }: Props) {
  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Logo compact />
          <nav className="hidden items-center gap-6 text-sm font-bold sm:flex">
            <a href="#features" className="hover:text-coral">
              Features
            </a>
            <a href="#pricing" className="hover:text-coral">
              Pricing
            </a>
            <button type="button" onClick={onStudio} className="hover:text-coral">
              Teacher Studio
            </button>
            <AccountMenu />
            <button type="button" onClick={onCreate} className="rounded-full bg-ink px-4 py-2 text-cream">
              Create
            </button>
          </nav>
          <div className="flex items-center gap-2 sm:hidden">
            <AccountMenu />
            <button type="button" onClick={onCreate} className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-cream">
              Create
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16">
        <div>
          <p className="inline-flex rounded-full bg-sunflower/50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink">
            Class 1–10 · For Indian parents & teachers
          </p>
          <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] sm:text-5xl">
            Worksheets that feel like they were made just for them.
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink-soft">
            From Class 1 number bonds to Class 10 linear equations. Generate a sheet in 30 seconds, or paste your own
            questions in Teacher Studio.
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
              onClick={onStudio}
              className="rounded-xl border-2 border-ink/15 bg-white px-5 py-3 text-sm font-bold hover:bg-cream"
            >
              Teacher Studio
            </button>
            <button type="button" onClick={onSample} className="rounded-xl px-3 py-3 text-sm font-bold text-ink/60 hover:text-ink">
              Sample PDF
            </button>
          </div>
          <p className="mt-4 text-sm text-ink/50">No signup needed. Sign in only if you want your teacher library in the cloud.</p>
        </div>
        <div className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[26rem]">
          {SAMPLES.map((s, i) => {
            const model = generateWorksheet(
              wizardInput({
                type: s.type,
                childName: s.name,
                classLevel: s.classLevel,
                topic: s.topic,
                title: s.title,
                theme: s.theme,
                unlocked: true,
                seed: 1200 + i * 77,
                schoolName: 'Sunrise Public School',
                section: 'A',
                subject: TYPE_META[s.type].subject,
              }),
            )
            return (
              <div
                key={s.type}
                className={`absolute left-1/2 top-4 w-[58%] origin-bottom -translate-x-1/2 ${s.rotate} ${s.z}`}
                style={{ marginLeft: `${(i - 1) * 18}%` }}
              >
                <WorksheetPaper model={model}>{renderPreview(model)}</WorksheetPaper>
              </div>
            )
          })}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white/60 px-4 py-14">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {[
            { n: '01', t: 'Pick class & type', d: 'Class 1–10 first. Maths, grammar, science, quizzes, or the early-years puzzles you already know.' },
            { n: '02', t: 'Personalise — or paste', d: 'School name, section, marks, time, and a note. Teachers can add their own questions in Teacher Studio.' },
            { n: '03', t: 'Print on A4', d: 'Download a real PDF. Teacher Pack prints a named copy for every student on the class list.' },
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
          <h2 className="mt-2 text-center font-display text-3xl sm:text-4xl">Generators plus your own questions</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TYPE_ORDER.map((id) => {
              const m = TYPE_META[id]
              return (
                <button
                  key={id}
                  type="button"
                  onClick={id === 'custom' ? onStudio : onCreate}
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

      <Pricing unlocked={unlocked} teacherPack={teacherPack} signedIn={signedIn} onUnlock={onUnlock} />

      <footer className="border-t border-ink/10 px-4 py-10 text-center text-sm text-ink/55">
        <p>Made for Indian parents & teachers · Class 1–10 · Works in your browser · Sign-in optional</p>
        <p className="mt-2 font-display text-ink">Worksheet Wizard · worksheetwizard.app</p>
      </footer>
    </div>
  )
}
