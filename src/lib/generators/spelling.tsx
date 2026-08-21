import type { ReactNode } from 'react'
import type { PDFDocument } from 'pdf-lib'
import type { PdfFonts, PdfOptions, SpellingModel, WizardInput } from '../../types'
import { mulberry32, randInt, shuffle } from '../rng'
import { isWordTheme, themedWords } from '../words'
import { addA4Page, drawChrome, ink, muted } from '../pdf'
import { baseFields, effectiveCount, parseWordList } from '../sheet'

function maskWord(word: string, rng: () => number): string {
  if (word.length <= 3) {
    const i = randInt(rng, 0, word.length - 1)
    return word.split('').map((ch, idx) => (idx === i ? '_' : ch)).join(' ')
  }
  const hide = Math.max(1, Math.floor(word.length / 3))
  const idxs = new Set<number>()
  while (idxs.size < hide) {
    const i = randInt(rng, 1, word.length - 2)
    idxs.add(i)
  }
  return word
    .split('')
    .map((ch, i) => (idxs.has(i) ? '_' : ch))
    .join(' ')
}

function scramble(word: string, rng: () => number): string {
  if (word.length < 2) return word
  let out = word
  let guard = 0
  while (out === word && guard++ < 12) {
    out = shuffle(rng, word.split('')).join('')
  }
  return out.toUpperCase()
}

export function generate(input: WizardInput): SpellingModel {
  const rng = mulberry32(input.seed)
  const custom = input.unlocked ? parseWordList(input.customWords) : []
  const theme = isWordTheme(input.topic) ? input.topic : 'animals'
  const count = effectiveCount(input, input.difficulty === 'hard' ? 10 : input.difficulty === 'medium' ? 8 : 6)
  const words =
    custom.length >= 3
      ? custom.slice(0, count)
      : themedWords(rng, theme, input.age, input.difficulty, count)
  return {
    ...baseFields(input, 'spelling'),
    topic: custom.length >= 3 ? 'custom' : theme,
    words,
    missing: words.map((w) => ({ word: w, masked: maskWord(w, rng) })),
    scrambles: words.map((w) => ({ word: w, scrambled: scramble(w, rng) })),
  }
}

export function renderPreview(model: SpellingModel): ReactNode {
  return (
    <div className="space-y-3 text-[11px]">
      <section>
        <h3 className="mb-1 font-display text-[13px]">Look · Cover · Write · Check</h3>
        <div className="overflow-hidden rounded-md border border-ink/15">
          <div className="grid grid-cols-4 bg-ink/[0.04] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-ink/50">
            <span>Look</span>
            <span>Cover</span>
            <span>Write</span>
            <span>Check</span>
          </div>
          {model.words.map((w) => (
            <div key={w} className="grid grid-cols-4 border-t border-ink/10 px-2 py-1.5">
              <span className="font-bold capitalize">{w}</span>
              <span className="text-ink/30">····</span>
              <span className="border-b border-dotted border-ink/30" />
              <span className="flex justify-center">☐</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 className="mb-1 font-display text-[13px]">Fill the missing letters</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {model.missing.map((m) => (
            <div key={m.word} className="rounded-md border border-ink/10 px-2 py-1 font-hand text-[15px] tracking-widest">
              {m.masked}
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 className="mb-1 font-display text-[13px]">Unscramble</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {model.scrambles.map((s) => (
            <div key={s.word} className="flex items-center gap-2 rounded-md border border-ink/10 px-2 py-1">
              <span className="font-bold tracking-wider">{s.scrambled}</span>
              <span className="flex-1 border-b border-dotted border-ink/30" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export async function renderPdf(
  model: SpellingModel,
  pdfDoc: PDFDocument,
  fonts: PdfFonts,
  options: PdfOptions,
): Promise<void> {
  const page = addA4Page(pdfDoc)
  const { contentTop, margin } = drawChrome(page, fonts, model, options)
  const color = ink()
  let y = contentTop
  const width = 595.28 - margin * 2

  page.drawText('Look  ·  Cover  ·  Write  ·  Check', {
    x: margin,
    y,
    size: 12,
    font: fonts.display,
    color,
  })
  y -= 16
  const cols = [0, 0.28, 0.5, 0.78]
  const headers = ['Look', 'Cover', 'Write', 'Check']
  headers.forEach((h, i) => {
    page.drawText(h, {
      x: margin + cols[i]! * width,
      y,
      size: 8,
      font: fonts.bold,
      color: muted(),
    })
  })
  y -= 6
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + width, y },
    thickness: 0.6,
    color: muted(),
  })
  y -= 16
  model.words.forEach((w) => {
    page.drawText(w, { x: margin, y, size: 11, font: fonts.bold, color })
    page.drawText('····', { x: margin + cols[1]! * width, y, size: 11, font: fonts.regular, color: muted() })
    page.drawLine({
      start: { x: margin + cols[2]! * width, y: y - 2 },
      end: { x: margin + cols[3]! * width - 8, y: y - 2 },
      thickness: 0.5,
      color: muted(),
    })
    page.drawRectangle({
      x: margin + cols[3]! * width + 8,
      y: y - 2,
      width: 9,
      height: 9,
      borderColor: muted(),
      borderWidth: 0.8,
    })
    y -= 18
  })

  y -= 10
  page.drawText('Fill the missing letters', { x: margin, y, size: 12, font: fonts.display, color })
  y -= 18
  model.missing.forEach((m, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = margin + col * (width / 2)
    const py = y - row * 20
    page.drawText(m.masked.replace(/ /g, '  '), {
      x,
      y: py,
      size: 12,
      font: fonts.hand,
      color,
    })
  })
  y -= Math.ceil(model.missing.length / 2) * 20 + 12

  page.drawText('Unscramble', { x: margin, y, size: 12, font: fonts.display, color })
  y -= 18
  model.scrambles.forEach((s, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = margin + col * (width / 2)
    const py = y - row * 20
    page.drawText(s.scrambled, { x, y: py, size: 11, font: fonts.bold, color })
    page.drawLine({
      start: { x: x + 90, y: py - 2 },
      end: { x: x + width / 2 - 16, y: py - 2 },
      thickness: 0.5,
      color: muted(),
    })
  })
}
