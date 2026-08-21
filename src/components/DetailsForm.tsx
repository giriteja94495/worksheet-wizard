import type { Difficulty, ThemeId, WorksheetType } from '../types'
import { DIFFICULTIES, THEMES, TOPICS, defaultTitle } from '../lib/catalog'

interface Props {
  type: WorksheetType
  childName: string
  age: number
  difficulty: Difficulty
  topic: string
  title: string
  theme: ThemeId
  unlocked: boolean
  onChange: (patch: Partial<Omit<Props, 'type' | 'unlocked' | 'onChange' | 'onLockTheme' | 'onLockName'>>) => void
  onLockTheme: () => void
  onLockName: () => void
}

export function DetailsForm({
  type,
  childName,
  age,
  difficulty,
  topic,
  title,
  theme,
  unlocked,
  onChange,
  onLockTheme,
  onLockName,
}: Props) {
  const topics = TOPICS[type]
  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl">Make it theirs</h2>
      <p className="mt-1 text-sm text-ink-soft">Age and difficulty change the numbers and the word lists.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
            Child’s name
            {!unlocked ? (
              <button type="button" onClick={onLockName} className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/50">
                Locked on free
              </button>
            ) : null}
          </span>
          <input
            value={childName}
            onChange={(e) => onChange({ childName: e.target.value })}
            placeholder="Aarav"
            className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
            aria-describedby="name-help"
          />
          <span id="name-help" className="mt-1 block text-[12px] text-ink/45">
            {unlocked
              ? 'Printed as “Made for …” on the sheet.'
              : 'Free sheets show “My Worksheet”. Unlock to print the real name.'}
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-bold">Age</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-10 w-10 rounded-xl border border-ink/15 bg-white text-lg font-bold hover:bg-cream"
              onClick={() => onChange({ age: Math.max(4, age - 1) })}
              aria-label="Decrease age"
            >
              −
            </button>
            <input
              type="number"
              min={4}
              max={12}
              value={age}
              onChange={(e) => onChange({ age: Math.min(12, Math.max(4, Number(e.target.value) || 4)) })}
              className="h-10 w-full rounded-xl border border-ink/15 bg-white text-center font-display text-xl outline-none ring-coral/40 focus:ring-2"
              aria-label="Age from 4 to 12"
            />
            <button
              type="button"
              className="h-10 w-10 rounded-xl border border-ink/15 bg-white text-lg font-bold hover:bg-cream"
              onClick={() => onChange({ age: Math.min(12, age + 1) })}
              aria-label="Increase age"
            >
              +
            </button>
          </div>
        </label>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold">Grade / difficulty</legend>
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

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-bold">Custom title (optional)</span>
          <input
            value={title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder={defaultTitle(childName, unlocked, type)}
            className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none ring-coral/40 focus:ring-2"
          />
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
