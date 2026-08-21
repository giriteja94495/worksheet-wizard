import type { Difficulty, SchoolClass, ThemeId, WorksheetType } from '../types'
import { DIFFICULTIES, THEMES, defaultSubject, defaultTitle, topicsFor } from '../lib/catalog'
import { defaultQuestionCount } from '../lib/sheet'
import { ClassPicker } from './ClassPicker'

export interface DetailsValue {
  childName: string
  classLevel: SchoolClass
  section: string
  schoolName: string
  subject: string
  marks: string
  timeAllowed: string
  instructions: string
  includeAnswerKey: boolean
  questionCount: number
  difficulty: Difficulty
  topic: string
  title: string
  theme: ThemeId
  customWords: string
  customPairs: string
}

interface Props extends DetailsValue {
  type: WorksheetType
  unlocked: boolean
  onChange: (patch: Partial<DetailsValue>) => void
  onLockTheme: () => void
  onLockName: () => void
  onLockCustomise: () => void
}

function Lock({ onClick, label }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/50"
    >
      {label ?? 'Lifetime'}
    </button>
  )
}

export function DetailsForm({
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
  customWords,
  customPairs,
  unlocked,
  onChange,
  onLockTheme,
  onLockName,
  onLockCustomise,
}: Props) {
  const topics = topicsFor(type, classLevel)
  const showWords = type === 'spelling' || type === 'wordsearch'
  const showPairs = type === 'matching'
  const showCount = type !== 'colouring' && type !== 'rewardchart' && type !== 'custom'
  const autoCount = defaultQuestionCount(type, classLevel, difficulty)

  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl">Make it theirs</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Class drives the topic list. Add school header details so the A4 sheet looks like a real paper.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ClassPicker
            value={classLevel}
            onChange={(c) => {
              const nextTopics = topicsFor(type, c)
              const nextTopic = nextTopics.some((t) => t.value === topic) ? topic : nextTopics[0]?.value ?? topic
              onChange({ classLevel: c, topic: nextTopic })
            }}
          />
        </div>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
            Student’s name
            {!unlocked ? <Lock onClick={onLockName} label="Locked on free" /> : null}
          </span>
          <input
            value={childName}
            onChange={(e) => onChange({ childName: e.target.value })}
            placeholder={classLevel >= 9 ? 'Isha' : classLevel >= 6 ? 'Rohan' : 'Aarav'}
            className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
          />
          <span className="mt-1 block text-[12px] text-ink/45">
            {unlocked
              ? 'Printed on the Name line of the sheet.'
              : 'Free sheets leave the name line blank. Unlock to print the real name.'}
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
            School name
            {!unlocked ? <Lock onClick={onLockCustomise} /> : null}
          </span>
          <input
            value={schoolName}
            onChange={(e) => onChange({ schoolName: e.target.value })}
            placeholder="Sunrise Public School"
            className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
            Section
            {!unlocked ? <Lock onClick={onLockCustomise} /> : null}
          </span>
          <input
            value={section}
            onChange={(e) => onChange({ section: e.target.value })}
            placeholder="A"
            maxLength={4}
            className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
            Subject
            {!unlocked ? <Lock onClick={onLockCustomise} /> : null}
          </span>
          <input
            value={subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            placeholder={defaultSubject(type)}
            className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
              Marks
              {!unlocked ? <Lock onClick={onLockCustomise} /> : null}
            </span>
            <input
              value={marks}
              onChange={(e) => onChange({ marks: e.target.value })}
              placeholder="20"
              className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
              Time
              {!unlocked ? <Lock onClick={onLockCustomise} /> : null}
            </span>
            <input
              value={timeAllowed}
              onChange={(e) => onChange({ timeAllowed: e.target.value })}
              placeholder="30 min"
              className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
            />
          </label>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold">Difficulty</legend>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <label
                key={d}
                className={`flex-1 cursor-pointer rounded-xl border-2 py-2 text-center text-sm font-bold capitalize ${
                  difficulty === d ? 'border-coral bg-coral/10' : 'border-ink/10 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={d}
                  checked={difficulty === d}
                  onChange={() => onChange({ difficulty: d })}
                  className="sr-only"
                />
                {d}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-bold">Topic</span>
          <select
            value={topics.some((t) => t.value === topic) ? topic : topics[0]?.value}
            onChange={(e) => onChange({ topic: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
          >
            {topics.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        {showCount ? (
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
              Number of questions
              {!unlocked ? <Lock onClick={onLockCustomise} /> : null}
            </span>
            <input
              type="number"
              min={4}
              max={25}
              value={questionCount || autoCount}
              onChange={(e) => onChange({ questionCount: Math.min(25, Math.max(4, Number(e.target.value) || autoCount)) })}
              className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
            />
          </label>
        ) : null}

        <label className={`block ${showCount ? '' : 'sm:col-span-2'}`}>
          <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
            Custom title (optional)
            {!unlocked ? <Lock onClick={onLockCustomise} /> : null}
          </span>
          <input
            value={title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder={defaultTitle(childName, unlocked, type, classLevel)}
            className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
            Note to students
            {!unlocked ? <Lock onClick={onLockCustomise} /> : null}
          </span>
          <textarea
            value={instructions}
            onChange={(e) => onChange({ instructions: e.target.value })}
            placeholder="Show working. Use a pencil. No calculators."
            rows={2}
            className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
          />
        </label>

        {showWords ? (
          <label className="block sm:col-span-2">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
              Custom word list
              {!unlocked ? <Lock onClick={onLockCustomise} /> : null}
            </span>
            <textarea
              value={customWords}
              onChange={(e) => onChange({ customWords: e.target.value })}
              placeholder="comma or newline: photosynthesis, stomata, chlorophyll"
              rows={3}
              className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
            />
            <span className="mt-1 block text-[12px] text-ink/45">
              Used instead of the built-in bank when you paste at least a few words.
            </span>
          </label>
        ) : null}

        {showPairs ? (
          <label className="block sm:col-span-2">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
              Custom matching pairs
              {!unlocked ? <Lock onClick={onLockCustomise} /> : null}
            </span>
            <textarea
              value={customPairs}
              onChange={(e) => onChange({ customPairs: e.target.value })}
              placeholder={'one pair per line: left | right'}
              rows={4}
              className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 font-mono text-[13px] outline-none ring-coral/40 focus:ring-2"
            />
          </label>
        ) : null}

        <label className="flex items-center gap-3 sm:col-span-2">
          <input
            type="checkbox"
            checked={includeAnswerKey}
            onChange={(e) => onChange({ includeAnswerKey: e.target.checked })}
            className="h-4 w-4 accent-coral"
          />
          <span className="text-sm font-bold">
            Include answer key page
            {!unlocked ? <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide text-ink/40">Lifetime</span> : null}
          </span>
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-sm font-bold">Theme</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {THEMES.map((th) => {
              const locked = th.premium && !unlocked
              const selected = theme === th.id
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    if (locked) onLockTheme()
                    else onChange({ theme: th.id })
                  }}
                  className={`rounded-2xl border-2 p-3 text-left ${
                    selected ? 'border-coral' : 'border-ink/10'
                  } ${locked ? 'opacity-70' : ''}`}
                >
                  <span className="mb-2 flex h-8 w-full rounded-lg" style={{ background: th.swatch }} />
                  <span className="flex items-center justify-between text-sm font-bold">
                    {th.label}
                    {th.premium ? <span className="text-[10px] uppercase tracking-wide text-ink/40">₹49</span> : null}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>
      </div>
    </div>
  )
}
