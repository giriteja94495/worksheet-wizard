import type { SchoolClass } from '../types'
import { CLASSES, typicalAgeHint } from '../lib/sheet'

interface Props {
  value: SchoolClass
  onChange: (c: SchoolClass) => void
}

export function ClassPicker({ value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-bold">Class</legend>
      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
        {CLASSES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`rounded-xl border-2 py-2 text-sm font-extrabold ${
              value === c ? 'border-coral bg-coral/10 text-ink' : 'border-ink/10 bg-white text-ink/70 hover:border-ink/25'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[12px] text-ink/45">{typicalAgeHint(value)} · CBSE / state-board style topics</p>
    </fieldset>
  )
}
