import { useMemo, useState } from 'react'
import type { Difficulty, PaywallReason, ThemeId, WorksheetType } from '../types'
import { TOPICS, defaultTitle } from '../lib/catalog'
import { generateWorksheet } from '../lib/generators'
import { downloadWorksheet } from '../lib/export'
import {
  FREE_DAILY_LIMIT,
  getDailyDownloads,
  incrementDailyDownloads,
  remainingFreeDownloads,
  saveForm,
} from '../lib/storage'
import { TypePicker } from './TypePicker'
import { DetailsForm } from './DetailsForm'
import { Preview } from './Preview'
import { Logo } from './Logo'

interface Props {
  unlocked: boolean
  onRequestPaywall: (reason: PaywallReason) => void
  onHome: () => void
  initialType?: WorksheetType
  saved?: {
    childName?: string
    age?: number
    difficulty?: Difficulty
    type?: WorksheetType
    topic?: string
    title?: string
    theme?: ThemeId
  }
}

export function Wizard({ unlocked, onRequestPaywall, onHome, initialType, saved }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [type, setType] = useState<WorksheetType>(initialType ?? saved?.type ?? 'maths')
  const [childName, setChildName] = useState(saved?.childName ?? 'Aarav')
  const [age, setAge] = useState(saved?.age ?? 7)
  const [difficulty, setDifficulty] = useState<Difficulty>(saved?.difficulty ?? 'easy')
  const [topic, setTopic] = useState(saved?.topic ?? 'addition')
  const [title, setTitle] = useState(saved?.title ?? '')
  const [theme, setTheme] = useState<ThemeId>(saved?.theme ?? 'sunshine')
  const [seed, setSeed] = useState(() => Date.now())
  const [busy, setBusy] = useState(false)
  const [remaining, setRemaining] = useState(() => remainingFreeDownloads())

  const persist = (patch: {
    childName?: string
    age?: number
    difficulty?: Difficulty
    type?: WorksheetType
    topic?: string
    title?: string
    theme?: ThemeId
  }) => {
    const next = {
      childName: patch.childName ?? childName,
      age: patch.age ?? age,
      difficulty: patch.difficulty ?? difficulty,
      type: patch.type ?? type,
      topic: patch.topic ?? topic,
      title: patch.title ?? title,
      theme: patch.theme ?? theme,
    }
    saveForm(next)
  }

  const onType = (t: WorksheetType) => {
    const first = TOPICS[t][0]?.value ?? 'mixed'
    setType(t)
    setTopic(first)
    persist({ type: t, topic: first })
  }

  const input = {
    type,
    childName,
    age,
    difficulty,
    topic,
    title: title.trim() || defaultTitle(childName, unlocked, type),
    theme: unlocked ? theme : 'sunshine',
    unlocked,
    seed,
  }

  const model = useMemo(() => generateWorksheet(input), [
    type,
    childName,
    age,
    difficulty,
    topic,
    title,
    theme,
    unlocked,
    seed,
  ])

  const goPreview = () => {
    persist({})
    setSeed(Date.now())
    setStep(3)
  }

  const download = async () => {
    if (!unlocked && getDailyDownloads() >= FREE_DAILY_LIMIT) {
      onRequestPaywall('download')
      return
    }
    setBusy(true)
    try {
      await downloadWorksheet(model)
      if (!unlocked) setRemaining(FREE_DAILY_LIMIT - incrementDailyDownloads())
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-20 border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button type="button" onClick={onHome} className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral">
            <Logo compact />
          </button>
          <ol className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink/40">
            {[1, 2, 3].map((n) => (
              <li key={n} className={step === n ? 'text-coral' : ''}>
                {n === 1 ? 'Type' : n === 2 ? 'Details' : 'Print'}
              </li>
            ))}
          </ol>
        </div>
        <div className="h-1 bg-ink/5">
          <div className="h-full bg-coral transition-all" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {step === 1 ? <TypePicker value={type} onChange={onType} /> : null}
        {step === 2 ? (
          <DetailsForm
            type={type}
            childName={childName}
            age={age}
            difficulty={difficulty}
            topic={topic}
            title={title}
            theme={theme}
            unlocked={unlocked}
            onLockTheme={() => onRequestPaywall('theme')}
            onLockName={() => onRequestPaywall('name')}
            onChange={(patch) => {
              if (patch.childName !== undefined) setChildName(patch.childName)
              if (patch.age !== undefined) setAge(patch.age)
              if (patch.difficulty !== undefined) setDifficulty(patch.difficulty)
              if (patch.topic !== undefined) setTopic(patch.topic)
              if (patch.title !== undefined) setTitle(patch.title)
              if (patch.theme !== undefined) setTheme(patch.theme)
              persist(patch)
            }}
          />
        ) : null}
        {step === 3 ? (
          <Preview
            model={model}
            busy={busy}
            remaining={remaining}
            unlocked={unlocked}
            onDownload={() => void download()}
            onPrint={() => window.print()}
            onRegenerate={() => setSeed(Date.now())}
          />
        ) : null}

        {step !== 3 ? (
          <div className="no-print mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => (step === 1 ? onHome() : setStep(1))}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-ink/60 hover:text-ink"
            >
              {step === 1 ? 'Back to home' : 'Back'}
            </button>
            <button
              type="button"
              onClick={() => (step === 1 ? setStep(2) : goPreview())}
              className="rounded-xl bg-ink px-5 py-2.5 text-sm font-extrabold text-cream hover:bg-ink/90"
            >
              {step === 1 ? 'Next: personalise' : 'See preview'}
            </button>
          </div>
        ) : (
          <div className="no-print mt-8">
            <button type="button" onClick={() => setStep(2)} className="text-sm font-bold text-ink/60 hover:text-ink">
              ← Edit details
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
