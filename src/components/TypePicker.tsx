import type { SchoolClass, WorksheetType } from '../types'
import { TYPE_META, TYPE_ORDER } from '../lib/catalog'
import { typeAvailable } from '../lib/sheet'
import { ClassPicker } from './ClassPicker'

const TINT: Record<WorksheetType, string> = {
  maths: 'bg-sunflower/40',
  quiz: 'bg-ink/10',
  grammar: 'bg-coral/20',
  science: 'bg-teal/15',
  custom: 'bg-ink text-cream',
  handwriting: 'bg-coral/20',
  spelling: 'bg-teal/15',
  wordsearch: 'bg-sage/50',
  matching: 'bg-coral/15',
  oddoneout: 'bg-sunflower/25',
  colouring: 'bg-teal/20',
  rewardchart: 'bg-sage/40',
}

interface Props {
  value: WorksheetType
  classLevel: SchoolClass
  onClassChange: (c: SchoolClass) => void
  onChange: (t: WorksheetType) => void
  onStudio?: () => void
}

export function TypePicker({ value, classLevel, onClassChange, onChange, onStudio }: Props) {
  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl">What shall we make?</h2>
      <p className="mt-1 text-sm text-ink-soft">Pick the class first — topics and difficulty follow from there.</p>
      <div className="mt-5">
        <ClassPicker value={classLevel} onChange={onClassChange} />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TYPE_ORDER.map((id) => {
          const meta = TYPE_META[id]
          const selected = value === id
          const available = typeAvailable(id, classLevel)
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (id === 'custom' && onStudio) {
                  onStudio()
                  return
                }
                if (!available) return
                onChange(id)
              }}
              className={`rounded-2xl border-2 p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${
                selected ? 'border-coral bg-white shadow-md' : 'border-transparent bg-white/70 hover:border-ink/10'
              } ${!available ? 'cursor-not-allowed opacity-45' : ''}`}
            >
              <span className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl font-display text-xl ${TINT[id]}`}>
                {meta.icon}
              </span>
              <span className="block font-bold">{meta.label}</span>
              <span className="mt-1 block text-[12px] leading-snug text-ink/55">
                {!available ? 'Available from Class 3' : meta.blurb}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
