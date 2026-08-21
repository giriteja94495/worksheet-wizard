import { WorksheetPaper } from './WorksheetPaper'
import { renderPreview } from '../lib/generators'
import type { WorksheetModel } from '../types'

interface Props {
  model: WorksheetModel
  busy: boolean
  remaining: number
  unlocked: boolean
  teacherPack?: boolean
  classCount?: number
  onDownload: () => void
  onPrint: () => void
  onRegenerate: () => void
  onClassSet?: () => void
}

export function Preview({
  model,
  busy,
  remaining,
  unlocked,
  teacherPack,
  classCount = 0,
  onDownload,
  onPrint,
  onRegenerate,
  onClassSet,
}: Props) {
  const academic = model.kind === 'maths' || model.kind === 'quiz' || model.kind === 'grammar' || model.kind === 'science' || model.kind === 'custom'
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl">Looks print-ready?</h2>
        <p className="mt-1 text-sm text-ink-soft">This is an A4 page. Download a PDF or send it straight to the printer.</p>
        <div className="mt-5 max-w-[28rem]">
          <WorksheetPaper model={model} watermark={!model.unlocked}>
            {renderPreview(model)}
          </WorksheetPaper>
        </div>
      </div>
      <aside className="no-print rounded-3xl border border-ink/10 bg-white p-5 lg:sticky lg:top-24">
        <p className="text-[12px] font-bold uppercase tracking-widest text-ink/45">Finish</p>
        <button
          type="button"
          onClick={onDownload}
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-coral py-3 text-sm font-extrabold text-white shadow-[0_6px_0_#C45344] hover:translate-y-px disabled:opacity-60"
        >
          {busy ? 'Making PDF…' : 'Download PDF'}
        </button>
        {onClassSet ? (
          <button
            type="button"
            onClick={onClassSet}
            disabled={busy}
            className="mt-3 w-full rounded-xl bg-ink py-3 text-sm font-extrabold text-cream hover:bg-ink/90 disabled:opacity-60"
          >
            {busy ? 'Making class set…' : `Download class set${classCount ? ` (${classCount})` : ''}`}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onPrint}
          className="mt-3 w-full rounded-xl border-2 border-ink/15 py-3 text-sm font-bold hover:bg-cream"
        >
          Print
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          className="mt-3 w-full rounded-xl bg-sunflower/60 py-3 text-sm font-bold hover:bg-sunflower"
        >
          Regenerate
        </button>
        <p className="mt-4 text-[12px] leading-relaxed text-ink/50">
          {unlocked
            ? teacherPack
              ? 'Teacher Pack is on. Save templates and print a named copy for every student.'
              : 'Lifetime is on. Unlimited downloads, no watermark, full header customisation.'
            : remaining > 0
              ? `${remaining} free download${remaining === 1 ? '' : 's'} left today.`
              : 'Free downloads used up for today.'}
        </p>
        <p className="mt-2 text-[12px] text-ink/40">
          File: A4 · 595.28 × 841.89 pt
          {academic && model.includeAnswerKey ? ' · answer key included.' : '.'}
        </p>
      </aside>
    </div>
  )
}
