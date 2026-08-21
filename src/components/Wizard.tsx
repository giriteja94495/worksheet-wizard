import { useMemo, useState } from 'react'
import type { Difficulty, PaywallReason, SchoolClass, ThemeId, WorksheetType } from '../types'
import { defaultSubject, defaultTitle, topicsFor } from '../lib/catalog'
import { generateWorksheet } from '../lib/generators'
import { downloadWorksheet } from '../lib/export'
import {
  FREE_DAILY_LIMIT,
  getDailyDownloads,
  incrementDailyDownloads,
  remainingFreeDownloads,
  saveForm,
  type SavedForm,
} from '../lib/storage'
import { ageFromClass, typeAvailable } from '../lib/sheet'
import { TypePicker } from './TypePicker'
import { DetailsForm } from './DetailsForm'
import { Preview } from './Preview'
import { Logo } from './Logo'
import { AccountMenu } from './AccountMenu'

interface Props {
  unlocked: boolean
  teacherPack: boolean
  onRequestPaywall: (reason: PaywallReason) => void
  onHome: () => void
  onStudio: () => void
  saved?: Partial<SavedForm>
}

export function Wizard({ unlocked, teacherPack, onRequestPaywall, onHome, onStudio, saved }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const initialClass: SchoolClass = saved?.classLevel ?? 3
  const [type, setType] = useState<WorksheetType>(() => {
    const t = saved?.type
    if (!t || t === 'custom') return 'maths'
    if (!typeAvailable(t, initialClass)) return 'maths'
    return t
  })
  const initialTopics = topicsFor(
    saved?.type && saved.type !== 'custom' && typeAvailable(saved.type, initialClass) ? saved.type : 'maths',
    initialClass,
  )
  const [childName, setChildName] = useState(saved?.childName ?? 'Aarav')
  const [classLevel, setClassLevel] = useState<SchoolClass>(initialClass)
  const [section, setSection] = useState(saved?.section ?? '')
  const [schoolName, setSchoolName] = useState(saved?.schoolName ?? '')
  const [subject, setSubject] = useState(saved?.subject ?? '')
  const [marks, setMarks] = useState(saved?.marks ?? '')
  const [timeAllowed, setTimeAllowed] = useState(saved?.timeAllowed ?? '')
  const [instructions, setInstructions] = useState(saved?.instructions ?? '')
  const [includeAnswerKey, setIncludeAnswerKey] = useState(saved?.includeAnswerKey ?? true)
  const [questionCount, setQuestionCount] = useState(saved?.questionCount ?? 0)
  const [difficulty, setDifficulty] = useState<Difficulty>(saved?.difficulty ?? 'easy')
  const [topic, setTopic] = useState(() =>
    initialTopics.some((t) => t.value === saved?.topic) ? saved?.topic ?? initialTopics[0]!.value : initialTopics[0]!.value,
  )
  const [title, setTitle] = useState(saved?.title ?? '')
  const [theme, setTheme] = useState<ThemeId>(saved?.theme ?? 'sunshine')
  const [customWords, setCustomWords] = useState(saved?.customWords ?? '')
  const [customPairs, setCustomPairs] = useState(saved?.customPairs ?? '')
  const [seed, setSeed] = useState(() => Date.now())
  const [busy, setBusy] = useState(false)
  const [remaining, setRemaining] = useState(() => remainingFreeDownloads())

  const persist = (patch: Partial<SavedForm> = {}) => {
    const next: SavedForm = {
      childName: patch.childName ?? childName,
      age: ageFromClass(patch.classLevel ?? classLevel),
      classLevel: patch.classLevel ?? classLevel,
      section: patch.section ?? section,
      schoolName: patch.schoolName ?? schoolName,
      subject: patch.subject ?? subject,
      marks: patch.marks ?? marks,
      timeAllowed: patch.timeAllowed ?? timeAllowed,
      instructions: patch.instructions ?? instructions,
      includeAnswerKey: patch.includeAnswerKey ?? includeAnswerKey,
      questionCount: patch.questionCount ?? questionCount,
      difficulty: patch.difficulty ?? difficulty,
      type: patch.type ?? type,
      topic: patch.topic ?? topic,
      title: patch.title ?? title,
      theme: patch.theme ?? theme,
      customWords: patch.customWords ?? customWords,
      customPairs: patch.customPairs ?? customPairs,
    }
    saveForm(next)
  }

  const applyClass = (c: SchoolClass) => {
    const nextTopics = topicsFor(type, c)
    const nextTopic = nextTopics.some((t) => t.value === topic) ? topic : nextTopics[0]?.value ?? topic
    const nextType = typeAvailable(type, c) ? type : 'maths'
    setClassLevel(c)
    setTopic(nextTopic)
    if (nextType !== type) setType(nextType)
    persist({ classLevel: c, topic: nextTopic, type: nextType })
  }

  const onType = (t: WorksheetType) => {
    const first = topicsFor(t, classLevel)[0]?.value ?? 'mixed'
    setType(t)
    setTopic(first)
    if (!subject || subject === defaultSubject(type)) setSubject(defaultSubject(t))
    persist({ type: t, topic: first, subject: defaultSubject(t) })
  }

  const model = useMemo(
    () =>
      generateWorksheet({
        type,
        childName,
        age: ageFromClass(classLevel),
        classLevel,
        section,
        schoolName,
        subject,
        marks,
        timeAllowed,
        instructions,
        includeAnswerKey,
        questionCount,
        difficulty,
        topic,
        title: title.trim() || defaultTitle(childName, unlocked, type, classLevel),
        theme: unlocked ? theme : 'sunshine',
        unlocked,
        teacherPack,
        seed,
        customWords,
        customPairs,
        customQuestions: '',
      }),
    [
      type,
      childName,
      classLevel,
      section,
      schoolName,
      subject,
      marks,
      timeAllowed,
      instructions,
      includeAnswerKey,
      questionCount,
      difficulty,
      topic,
      title,
      theme,
      unlocked,
      teacherPack,
      seed,
      customWords,
      customPairs,
    ],
  )

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
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <button type="button" onClick={onHome} className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral">
            <Logo compact />
          </button>
          <ol className="hidden items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink/40 sm:flex">
            {[1, 2, 3].map((n) => (
              <li key={n} className={step === n ? 'text-coral' : ''}>
                {n === 1 ? 'Type' : n === 2 ? 'Details' : 'Print'}
              </li>
            ))}
          </ol>
          <AccountMenu />
        </div>
        <div className="h-1 bg-ink/5">
          <div className="h-full bg-coral transition-all" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {step === 1 ? (
          <TypePicker
            value={type}
            classLevel={classLevel}
            onClassChange={applyClass}
            onChange={onType}
            onStudio={onStudio}
          />
        ) : null}
        {step === 2 ? (
          <DetailsForm
            type={type}
            childName={childName}
            classLevel={classLevel}
            section={section}
            schoolName={schoolName}
            subject={subject}
            marks={marks}
            timeAllowed={timeAllowed}
            instructions={instructions}
            includeAnswerKey={includeAnswerKey}
            questionCount={questionCount}
            difficulty={difficulty}
            topic={topic}
            title={title}
            theme={theme}
            customWords={customWords}
            customPairs={customPairs}
            unlocked={unlocked}
            onLockTheme={() => onRequestPaywall('theme')}
            onLockName={() => onRequestPaywall('name')}
            onLockCustomise={() => onRequestPaywall('customise')}
            onChange={(patch) => {
              if (patch.childName !== undefined) setChildName(patch.childName)
              if (patch.classLevel !== undefined) setClassLevel(patch.classLevel)
              if (patch.section !== undefined) setSection(patch.section)
              if (patch.schoolName !== undefined) setSchoolName(patch.schoolName)
              if (patch.subject !== undefined) setSubject(patch.subject)
              if (patch.marks !== undefined) setMarks(patch.marks)
              if (patch.timeAllowed !== undefined) setTimeAllowed(patch.timeAllowed)
              if (patch.instructions !== undefined) setInstructions(patch.instructions)
              if (patch.includeAnswerKey !== undefined) setIncludeAnswerKey(patch.includeAnswerKey)
              if (patch.questionCount !== undefined) setQuestionCount(patch.questionCount)
              if (patch.difficulty !== undefined) setDifficulty(patch.difficulty)
              if (patch.topic !== undefined) setTopic(patch.topic)
              if (patch.title !== undefined) setTitle(patch.title)
              if (patch.theme !== undefined) setTheme(patch.theme)
              if (patch.customWords !== undefined) setCustomWords(patch.customWords)
              if (patch.customPairs !== undefined) setCustomPairs(patch.customPairs)
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
            teacherPack={teacherPack}
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
