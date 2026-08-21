import { useState } from 'react'
import type { PaywallReason, SchoolClass, TeacherTemplate, ThemeId } from '../types'
import { generateWorksheet } from '../lib/generators'
import { downloadClassSet, downloadWorksheet } from '../lib/export'
import {
  FREE_DAILY_LIMIT,
  deleteTemplate,
  getDailyDownloads,
  getTemplate,
  incrementDailyDownloads,
  listTemplates,
  remainingFreeDownloads,
  renameTemplate,
  saveTemplate,
} from '../lib/storage'
import { ageFromClass, parseNameList, wizardInput } from '../lib/sheet'
import { ClassPicker } from './ClassPicker'
import { Preview } from './Preview'
import { Logo } from './Logo'

interface Props {
  unlocked: boolean
  teacherPack: boolean
  onHome: () => void
  onRequestPaywall: (reason: PaywallReason) => void
}

function blankTemplate(classLevel: SchoolClass): TeacherTemplate {
  return {
    id: '',
    name: 'Untitled worksheet',
    classLevel,
    subject: 'Mathematics',
    topic: 'custom',
    title: '',
    schoolName: '',
    section: 'A',
    marks: '20',
    timeAllowed: '30 min',
    instructions: 'Read each question carefully. Show working where asked.',
    includeAnswerKey: true,
    questionCount: 0,
    questions: '',
    customWords: '',
    customPairs: '',
    theme: 'sunshine',
    sample: false,
    updatedAt: Date.now(),
  }
}

export function TeacherStudio({ unlocked, teacherPack, onHome, onRequestPaywall }: Props) {
  const [library, setLibrary] = useState(() => listTemplates())
  const [draft, setDraft] = useState<TeacherTemplate>(() => ({ ...library[0]! }))
  const [classList, setClassList] = useState('Aarav\nAnaya\nKabir\nIsha\nRohan')
  const [step, setStep] = useState<'edit' | 'preview'>('edit')
  const [seed, setSeed] = useState(() => Date.now())
  const [busy, setBusy] = useState(false)
  const [remaining, setRemaining] = useState(() => remainingFreeDownloads())
  const [notice, setNotice] = useState('')
  const [renameTo, setRenameTo] = useState('')

  const patch = (partial: Partial<TeacherTemplate>) => {
    setDraft((d) => ({ ...d, ...partial }))
  }

  const refresh = (selectId?: string) => {
    const next = listTemplates()
    setLibrary(next)
    if (selectId) {
      const found = next.find((t) => t.id === selectId)
      if (found) setDraft(found)
    }
  }

  const save = () => {
    if (!teacherPack) {
      onRequestPaywall('studio')
      return
    }
    const saved = saveTemplate({
      ...draft,
      name: draft.name.trim() || 'Untitled worksheet',
    })
    setDraft(saved)
    refresh(saved.id)
    setNotice('Saved to this browser’s teacher library.')
  }

  const load = (id: string) => {
    const t = getTemplate(id)
    if (!t) return
    setDraft({ ...t })
    setStep('edit')
    setNotice('')
  }

  const remove = (id: string) => {
    if (!teacherPack) {
      onRequestPaywall('studio')
      return
    }
    deleteTemplate(id)
    const next = listTemplates()
    setLibrary(next)
    setDraft({ ...next[0]! })
  }

  const doRename = () => {
    if (!teacherPack) {
      onRequestPaywall('studio')
      return
    }
    if (!draft.id || draft.sample) {
      patch({ name: renameTo || draft.name })
      return
    }
    renameTemplate(draft.id, renameTo || draft.name)
    patch({ name: renameTo || draft.name })
    refresh(draft.id)
    setRenameTo('')
  }

  const input = wizardInput({
    type: 'custom',
    childName: '',
    age: ageFromClass(draft.classLevel),
    classLevel: draft.classLevel,
    section: draft.section,
    schoolName: draft.schoolName,
    subject: draft.subject,
    marks: draft.marks,
    timeAllowed: draft.timeAllowed,
    instructions: draft.instructions,
    includeAnswerKey: draft.includeAnswerKey,
    questionCount: 0,
    difficulty: 'medium',
    topic: 'custom',
    title: draft.title,
    theme: (unlocked ? draft.theme : 'sunshine') as ThemeId,
    unlocked,
    teacherPack,
    seed,
    customWords: draft.customWords,
    customPairs: draft.customPairs,
    customQuestions: draft.questions,
  })

  const model = generateWorksheet(input)

  const names = parseNameList(classList)

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

  const downloadSet = async () => {
    if (!teacherPack) {
      onRequestPaywall('studio')
      return
    }
    if (!names.length) {
      setNotice('Paste at least one student name.')
      return
    }
    setBusy(true)
    try {
      await downloadClassSet(model, names)
    } finally {
      setBusy(false)
    }
  }

  const parsedCount = draft.questions.split('\n').filter((l) => l.trim()).length

  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-20 border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button type="button" onClick={onHome} className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral">
            <Logo compact />
          </button>
          <p className="text-[11px] font-bold uppercase tracking-wider text-coral">Teacher Studio</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {step === 'edit' ? (
          <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="rounded-3xl border border-ink/10 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-ink/45">Library</p>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(blankTemplate(draft.classLevel))
                    setNotice('New worksheet — save it to keep it.')
                  }}
                  className="text-[11px] font-extrabold text-coral"
                >
                  New
                </button>
              </div>
              <ul className="mt-3 space-y-1.5">
                {library.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => load(t.id)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                        draft.id === t.id ? 'bg-coral/10 font-bold' : 'hover:bg-cream'
                      }`}
                    >
                      <span className="block truncate">{t.name}</span>
                      <span className="text-[11px] font-semibold text-ink/40">
                        Class {t.classLevel}
                        {t.sample ? ' · sample' : ''}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {!teacherPack ? (
                <p className="mt-3 text-[11px] leading-relaxed text-ink/50">
                  Samples are free to open. Saving your own library is in the Teacher Pack.
                </p>
              ) : null}
            </aside>

            <div>
              <h2 className="font-display text-2xl sm:text-3xl">Add your own material</h2>
              <p className="mt-1 text-sm text-ink-soft">
                One question per line. Mix short answers, MCQs, fill-ups and numericals with simple prefixes.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold">Template name</span>
                  <input
                    value={draft.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
                  />
                </label>
                <div className="sm:col-span-2">
                  <ClassPicker value={draft.classLevel} onChange={(c) => patch({ classLevel: c })} />
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold">School</span>
                  <input
                    value={draft.schoolName}
                    onChange={(e) => patch({ schoolName: e.target.value })}
                    placeholder="Sunrise Public School"
                    className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold">Section</span>
                  <input
                    value={draft.section}
                    onChange={(e) => patch({ section: e.target.value })}
                    className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold">Subject</span>
                  <input
                    value={draft.subject}
                    onChange={(e) => patch({ subject: e.target.value })}
                    className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold">Marks</span>
                    <input
                      value={draft.marks}
                      onChange={(e) => patch({ marks: e.target.value })}
                      className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold">Time</span>
                    <input
                      value={draft.timeAllowed}
                      onChange={(e) => patch({ timeAllowed: e.target.value })}
                      className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
                    />
                  </label>
                </div>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold">Sheet title</span>
                  <input
                    value={draft.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    placeholder={`Class ${draft.classLevel} Custom Worksheet`}
                    className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold">Note to students</span>
                  <textarea
                    value={draft.instructions}
                    onChange={(e) => patch({ instructions: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="mb-1.5 flex items-center justify-between text-sm font-bold">
                  Questions
                  <span className="font-semibold text-ink/40">{parsedCount} lines</span>
                </span>
                <textarea
                  value={draft.questions}
                  onChange={(e) => patch({ questions: e.target.value })}
                  rows={12}
                  placeholder={'Q. What is the capital of India?\nMCQ. 2 + 2 = | 3 | *4 | 5 | 6\nFILL. The chemical formula of water is ____. | H2O\nNUM. 2x + 5 = 17 | x = 6'}
                  className="w-full rounded-xl border border-ink/15 bg-white px-3 py-3 font-mono text-[13px] leading-relaxed outline-none ring-coral/40 focus:ring-2"
                />
              </label>
              <div className="mt-2 rounded-2xl bg-white/80 p-3 text-[12px] leading-relaxed text-ink/60">
                <p className="font-bold text-ink/80">Prefixes</p>
                <ul className="mt-1 space-y-0.5">
                  <li>
                    <code className="font-bold">Q.</code> or a plain line — short answer with writing lines. Optional{' '}
                    <code>| answer</code>
                  </li>
                  <li>
                    <code className="font-bold">MCQ. question | A | B | C | D</code> — mark the right option with{' '}
                    <code>*B</code>
                  </li>
                  <li>
                    <code className="font-bold">FILL. The capital of India is ____.</code>
                  </li>
                  <li>
                    <code className="font-bold">NUM. 2x + 5 = 17</code>
                  </li>
                </ul>
              </div>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-sm font-bold">Custom word list (optional)</span>
                <textarea
                  value={draft.customWords}
                  onChange={(e) => patch({ customWords: e.target.value })}
                  rows={2}
                  placeholder="Key terms, comma or newline"
                  className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
                />
              </label>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-sm font-bold">Matching pairs (optional)</span>
                <textarea
                  value={draft.customPairs}
                  onChange={(e) => patch({ customPairs: e.target.value })}
                  rows={3}
                  placeholder={'left | right'}
                  className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 font-mono text-[13px] outline-none ring-coral/40 focus:ring-2"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
                  Class list — up to 30 names
                  {!teacherPack ? (
                    <button type="button" onClick={() => onRequestPaywall('studio')} className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/50">
                      Teacher Pack
                    </button>
                  ) : null}
                </span>
                <textarea
                  value={classList}
                  onChange={(e) => setClassList(e.target.value)}
                  rows={5}
                  placeholder="Aarav, Anaya, Kabir — or one name per line"
                  className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
                />
                <span className="mt-1 block text-[12px] text-ink/45">
                  {names.length} student{names.length === 1 ? '' : 's'} · Download makes one named A4 copy each.
                </span>
              </label>

              <label className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={draft.includeAnswerKey}
                  onChange={(e) => patch({ includeAnswerKey: e.target.checked })}
                  className="h-4 w-4 accent-coral"
                />
                <span className="text-sm font-bold">Include answer key</span>
              </label>

              {notice ? <p className="mt-4 text-sm font-semibold text-teal-dark">{notice}</p> : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={save} className="rounded-xl bg-ink px-4 py-2.5 text-sm font-extrabold text-cream">
                  Save template
                </button>
                <div className="flex gap-2">
                  <input
                    value={renameTo}
                    onChange={(e) => setRenameTo(e.target.value)}
                    placeholder="Rename to…"
                    className="w-36 rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none ring-coral/40 focus:ring-2"
                  />
                  <button type="button" onClick={doRename} className="rounded-xl border-2 border-ink/15 px-3 py-2 text-sm font-bold">
                    Rename
                  </button>
                </div>
                {draft.id && !draft.sample ? (
                  <button type="button" onClick={() => remove(draft.id)} className="rounded-xl px-3 py-2 text-sm font-bold text-coral">
                    Delete
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setSeed(Date.now())
                    setStep('preview')
                  }}
                  className="ml-auto rounded-xl bg-coral px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_6px_0_#C45344]"
                >
                  See preview
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Preview
              model={model}
              busy={busy}
              remaining={remaining}
              unlocked={unlocked}
              teacherPack={teacherPack}
              classCount={names.length}
              onDownload={() => void download()}
              onPrint={() => window.print()}
              onRegenerate={() => setSeed(Date.now())}
              onClassSet={() => void downloadSet()}
            />
            <button type="button" onClick={() => setStep('edit')} className="no-print mt-8 text-sm font-bold text-ink/60 hover:text-ink">
              ← Edit questions
            </button>
          </>
        )}
      </main>
    </div>
  )
}
