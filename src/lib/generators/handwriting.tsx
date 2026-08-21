import type { ReactNode } from 'react'
import type { PDFDocument } from 'pdf-lib'
import type { HandwritingLine, HandwritingModel, HandwritingMode, PdfFonts, PdfOptions, WizardInput } from '../../types'
import { baseFields } from '../sheet'
import { mulberry32 } from '../rng'
import { sightWords } from '../words'
import { addA4Page, drawChrome, ink, muted, rgb } from '../pdf'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const SENTENCES = [
  'The sun is bright today.',
  'I like to read books.',
  'Please wait for your turn.',
  'India is my country.',
  'We play in the garden.',
  'Honesty is the best policy.',
  'Knowledge is power.',
  'Hard work brings success.',
]

export function generate(input: WizardInput): HandwritingModel {
  const rng = mulberry32(input.seed)
  const mode = (input.topic as HandwritingMode) || 'name'
  const rawName = input.unlocked ? input.childName.trim() : ''
  const name = rawName || 'Name'
  const lines: HandwritingLine[] = []
  const cls = input.classLevel

  if (mode === 'name') {
    lines.push({ prompt: 'Trace your name', trace: name, copies: 6 })
    lines.push({ prompt: 'Now write it yourself', trace: '', copies: 2 })
  } else if (mode === 'alphabet') {
    const slice =
      input.difficulty === 'easy' || cls <= 2
        ? LETTERS.slice(0, 13)
        : input.difficulty === 'hard'
          ? LETTERS
          : LETTERS.slice(0, 20)
    slice.forEach((L) => {
      lines.push({ prompt: '', trace: `${L}${L.toLowerCase()}`, copies: 1 })
    })
  } else if (mode === 'sentences') {
    SENTENCES.slice(0, cls >= 8 ? 6 : 5).forEach((s) => {
      lines.push({ prompt: s, trace: s, copies: 1 })
    })
  } else {
    const words = sightWords(rng, input.age || cls + 5, input.difficulty, cls <= 2 ? 6 : 8)
    words.forEach((w) => {
      lines.push({ prompt: w, trace: w, copies: 1 })
    })
  }

  return {
    ...baseFields(input, 'handwriting'),
    mode,
    lines,
  }
}

function LinedRow({ trace, copies }: { trace: string; copies: number }) {
  return (
    <>
      {Array.from({ length: copies }).map((_, i) => (
        <div
          key={i}
          className="relative mb-1.5 h-8 overflow-hidden rounded-[2px]"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, transparent 0, transparent 6px, #E06C5C99 6px, #E06C5C99 7px, transparent 7px, transparent 17px, #8ecae688 17px, #8ecae688 18px, transparent 18px, transparent 31px, #2A9D8F88 31px, #2A9D8F88 32px)',
          }}
        >
          {trace ? (
            <div className="trace-glyph absolute inset-x-2 top-[2px] text-[22px] leading-none">{trace}</div>
          ) : null}
        </div>
      ))}
    </>
  )
}

export function renderPreview(model: HandwritingModel): ReactNode {
  const alphabet = model.mode === 'alphabet'
  return (
    <div className="flex h-full flex-col">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-ink/45">
        {model.mode === 'name'
          ? 'Trace, then write on the lines'
          : model.mode === 'alphabet'
            ? 'Start at the dot. Trace each letter.'
            : model.mode === 'sentences'
              ? 'Trace each sentence, then write it again.'
              : 'Trace each sight word, then write it again.'}
      </p>
      {alphabet ? (
        <div className="grid grid-cols-2 gap-x-3">
          {model.lines.map((ln, i) => (
            <div key={i} className="mb-1">
              <LinedRow trace={ln.trace} copies={1} />
            </div>
          ))}
        </div>
      ) : (
        model.lines.map((ln, i) => (
          <div key={i} className="mb-2">
            {ln.prompt ? <p className="mb-0.5 text-[10px] font-bold text-ink/60">{ln.prompt}</p> : null}
            <LinedRow trace={ln.trace} copies={ln.copies} />
          </div>
        ))
      )}
    </div>
  )
}

export async function renderPdf(
  model: HandwritingModel,
  pdfDoc: PDFDocument,
  fonts: PdfFonts,
  options: PdfOptions,
): Promise<void> {
  const page = addA4Page(pdfDoc)
  const { contentTop, contentBottom, margin } = drawChrome(page, fonts, model, options)
  const color = ink()
  let y = contentTop
  const width = 595.28 - margin * 2

  page.drawText(
    model.mode === 'name'
      ? 'Trace the grey letters, then write on the empty lines.'
      : model.mode === 'alphabet'
        ? 'Trace each letter. Start at the top.'
        : model.mode === 'sentences'
          ? 'Trace each sentence, then write it on the line below.'
          : 'Trace each word, then write it on the line below.',
    { x: margin, y, size: 9, font: fonts.regular, color: muted() },
  )
  y -= 22

  const drawRuled = (yy: number, text: string, faded: boolean) => {
    const h = 28
    const top = yy + 18
    page.drawLine({
      start: { x: margin, y: top },
      end: { x: margin + width, y: top },
      thickness: 0.7,
      color: rgbRed(),
    })
    page.drawLine({
      start: { x: margin, y: top - 11 },
      end: { x: margin + width, y: top - 11 },
      thickness: 0.4,
      color: rgbBlue(),
      dashArray: [2, 2],
    })
    page.drawLine({
      start: { x: margin, y: top - 22 },
      end: { x: margin + width, y: top - 22 },
      thickness: 0.7,
      color: rgbBlue(),
    })
    if (text) {
      page.drawText(text, {
        x: margin + 8,
        y: top - 20,
        size: 16,
        font: fonts.hand,
        color: faded ? rgb(0.72, 0.74, 0.78) : color,
      })
    }
    return h
  }

  if (model.mode === 'alphabet') {
    const colW = (width - 12) / 2
    model.lines.forEach((ln, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const xOff = margin + col * (colW + 12)
      const yy = y - row * 30
      if (yy < contentBottom + 20) return
      page.drawLine({
        start: { x: xOff, y: yy + 16 },
        end: { x: xOff + colW, y: yy + 16 },
        thickness: 0.6,
        color: rgbRed(),
      })
      page.drawLine({
        start: { x: xOff, y: yy + 5 },
        end: { x: xOff + colW, y: yy + 5 },
        thickness: 0.35,
        color: rgbBlue(),
        dashArray: [1.5, 1.5],
      })
      page.drawLine({
        start: { x: xOff, y: yy - 6 },
        end: { x: xOff + colW, y: yy - 6 },
        thickness: 0.6,
        color: rgbBlue(),
      })
      page.drawText(ln.trace, {
        x: xOff + 6,
        y: yy - 4,
        size: 15,
        font: fonts.hand,
        color: rgb(0.7, 0.72, 0.76),
      })
      page.drawCircle({
        x: xOff + 10,
        y: yy + 12,
        size: 1.4,
        color: rgb(0.878, 0.424, 0.361),
      })
    })
  } else {
    for (const ln of model.lines) {
      if (ln.prompt) {
        page.drawText(ln.prompt, { x: margin, y, size: 9, font: fonts.bold, color: muted() })
        y -= 14
      }
      for (let c = 0; c < ln.copies; c++) {
        if (y < contentBottom + 24) break
        y -= drawRuled(y, ln.trace, true)
        y -= 6
      }
    }
  }
}

function rgbRed() {
  return rgb(0.878, 0.424, 0.361)
}
function rgbBlue() {
  return rgb(0.42, 0.62, 0.82)
}
