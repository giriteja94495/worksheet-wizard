import type { ReactNode } from 'react'
import type { ThemeId } from '../types'
import { THEME_TOKENS } from '../lib/themes'

interface Props {
  title: string
  madeFor: string | null
  theme: ThemeId
  watermark?: boolean
  children: ReactNode
}

export function WorksheetPaper({ title, madeFor, theme, watermark, children }: Props) {
  const t = THEME_TOKENS[theme]
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
      <div className="relative flex h-full flex-col px-[6%] py-[5%]">
        <header className="mb-3 border-b pb-2" style={{ borderColor: `${t.border}99` }}>
          <h2 className="font-display text-[clamp(14px,2.4vw,22px)] leading-tight">{title}</h2>
          <p className="mt-0.5 text-[clamp(9px,1.4vw,12px)] font-semibold" style={{ color: t.accent }}>
            {madeFor ?? 'My Worksheet'}
          </p>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        <footer
          className="mt-3 border-t pt-2 text-center text-[clamp(8px,1.2vw,10px)] text-ink/45"
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
