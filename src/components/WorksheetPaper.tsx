import type { ReactNode } from 'react'
import type { WorksheetBase } from '../types'
import { THEME_TOKENS } from '../lib/themes'
import { classLabel } from '../lib/sheet'

interface Props {
  model: Pick<
    WorksheetBase,
    | 'title'
    | 'madeFor'
    | 'theme'
    | 'schoolName'
    | 'classLevel'
    | 'section'
    | 'subject'
    | 'marks'
    | 'timeAllowed'
    | 'instructions'
    | 'displayName'
    | 'unlocked'
  >
  watermark?: boolean
  children: ReactNode
}

export function WorksheetPaper({ model, watermark, children }: Props) {
  const t = THEME_TOKENS[model.theme]
  const named = model.displayName && model.displayName !== 'My Worksheet' ? model.displayName : ''
  const bits = [
    classLabel(model.classLevel, model.section),
    model.subject,
    model.marks ? `Max. ${model.marks}` : '',
    model.timeAllowed ? `Time ${model.timeAllowed}` : '',
  ].filter(Boolean)

  return (
    <article
      className="print-sheet relative mx-auto aspect-[1/1.414] w-full overflow-hidden bg-paper text-ink"
      style={{
        border: `7px solid ${t.border}`,
        boxShadow: `0 22px 50px -24px rgb(31 42 68 / 0.4), inset 0 0 0 2px ${t.accent}`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#1F2A4412 0.8px, transparent 0.8px)',
          backgroundSize: '14px 14px',
        }}
      />
      <div className="relative flex h-full flex-col px-[6%] py-[4.5%]">
        <header className="mb-2 border-b pb-2" style={{ borderColor: `${t.border}99` }}>
          {model.schoolName ? (
            <p
              className="text-center text-[clamp(8px,1.3vw,11px)] font-extrabold uppercase tracking-[0.14em]"
              style={{ color: t.accent }}
            >
              {model.schoolName}
            </p>
          ) : null}
          <h2 className="font-display text-[clamp(13px,2.2vw,20px)] leading-tight">{model.title}</h2>
          <p className="mt-0.5 text-[clamp(8px,1.25vw,11px)] text-ink/55">{bits.join(' · ')}</p>
          <div className="mt-1.5 flex gap-3 text-[clamp(8px,1.2vw,10px)]">
            <div className="flex min-w-0 flex-1 items-end gap-1 border-b border-ink/20 pb-0.5">
              <span className="text-ink/45">Name</span>
              <span className="truncate font-bold">{named}</span>
            </div>
            <div className="flex w-[32%] items-end gap-1 border-b border-ink/20 pb-0.5">
              <span className="text-ink/45">Date</span>
            </div>
          </div>
          {model.instructions ? (
            <p className="mt-1.5 line-clamp-2 text-[clamp(8px,1.15vw,10px)] text-ink/55">
              <span className="font-bold text-ink/70">Note. </span>
              {model.instructions}
            </p>
          ) : null}
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        <footer
          className="mt-2 border-t pt-1.5 text-center text-[clamp(8px,1.2vw,10px)] text-ink/45"
          style={{ borderColor: `${t.border}66` }}
        >
          Worksheet Wizard · worksheetwizard.app
        </footer>
      </div>
      {watermark ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rotate-[-38deg] font-display text-[clamp(18px,4vw,34px)] text-ink/15">
            Worksheet Wizard — Free
          </span>
        </div>
      ) : null}
    </article>
  )
}
