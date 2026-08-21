import type { WorksheetType } from '../types'
import { TYPE_META } from '../lib/catalog'

const ORDER: WorksheetType[] = [
  'maths',
  'handwriting',
  'spelling',
  'wordsearch',
  'matching',
  'oddoneout',
  'colouring',
  'rewardchart',
]

const TINT: Record<WorksheetType, string> = {
  maths: 'bg-sunflower/40',
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
  onChange: (t: WorksheetType) => void
}

export function TypePicker({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl">What shall we make?</h2>
      <p className="mt-1 text-sm text-ink-soft">Pick a sheet. You can change it later.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ORDER.map((id) => {
          const meta = TYPE_META[id]
          const selected = value === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`rounded-2xl border-2 p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${
                selected ? 'border-coral bg-white shadow-md' : 'border-transparent bg-white/70 hover:border-ink/10'
              }`}
            >
              <span className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl font-display text-xl ${TINT[id]}`}>
                {meta.icon}
              </span>
              <span className="block font-bold">{meta.label}</span>
              <span className="mt-1 block text-[12px] leading-snug text-ink/55">{meta.blurb}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
