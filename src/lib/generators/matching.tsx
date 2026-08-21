import type { ReactNode } from 'react'
import type { PDFDocument } from 'pdf-lib'
import type { MatchingModel, MatchPair, PdfFonts, PdfOptions, PictogramId, WizardInput } from '../../types'
import { mulberry32, shuffle, randInt } from '../rng'
import { PICTOGRAMS, opsToSvg, drawOpsOnPage } from '../pictograms'
import { addA4Page, drawChrome, ink, muted } from '../pdf'
import { baseFields, effectiveCount, parsePairLines } from '../sheet'

const PICTURE_SET: { icon: PictogramId; word: string }[] = [
  { icon: 'cat', word: 'cat' },
  { icon: 'bird', word: 'bird' },
  { icon: 'fish', word: 'fish' },
  { icon: 'sun', word: 'sun' },
  { icon: 'moon', word: 'moon' },
  { icon: 'star', word: 'star' },
  { icon: 'tree', word: 'tree' },
  { icon: 'flower', word: 'flower' },
  { icon: 'house', word: 'house' },
  { icon: 'apple', word: 'apple' },
  { icon: 'boat', word: 'boat' },
  { icon: 'ball', word: 'ball' },
]

const RHYMES: [string, string][] = [
  ['cat', 'hat'],
  ['sun', 'fun'],
  ['dog', 'log'],
  ['star', 'car'],
  ['tree', 'bee'],
  ['cake', 'lake'],
  ['book', 'look'],
  ['night', 'light'],
  ['rain', 'train'],
  ['king', 'ring'],
  ['blue', 'shoe'],
  ['play', 'day'],
]

function dots(n: number): string {
  return '● '.repeat(n).trim()
}

const TERMS: [string, string][] = [
  ['noun', 'naming word'],
  ['verb', 'doing word'],
  ['photosynthesis', 'plants make food'],
  ['New Delhi', 'capital of India'],
  ['H2O', 'water'],
  ['numerator', 'top of a fraction'],
  ['perimeter', 'distance around a shape'],
  ['evaporation', 'liquid to vapour'],
  ['parallel', 'never meet'],
  ['mean', 'average'],
  ['equation', 'statement of equality'],
  ['friction', 'opposes motion'],
]

export function generate(input: WizardInput): MatchingModel {
  const rng = mulberry32(input.seed)
  const custom = input.unlocked ? parsePairLines(input.customPairs) : []
  const topic = input.topic || 'pictures'
  const count = effectiveCount(input, input.difficulty === 'hard' ? 8 : input.difficulty === 'easy' ? 6 : 7)
  let pairs: MatchPair[] = []

  if (custom.length >= 3) {
    pairs = custom.slice(0, count).map((p) => ({ left: p.left, right: p.right, icon: 'star' as PictogramId }))
  } else if (topic === 'numbers') {
    const used = new Set<number>()
    const max = input.classLevel <= 2 ? 6 : 10
    while (pairs.length < count) {
      const n = randInt(rng, 1, max)
      if (used.has(n)) continue
      used.add(n)
      pairs.push({ left: dots(n), right: String(n), icon: 'ball' })
    }
  } else if (topic === 'rhymes') {
    pairs = shuffle(rng, RHYMES)
      .slice(0, count)
      .map(([a, b]) => ({ left: a, right: b, icon: 'heart' as PictogramId }))
  } else if (topic === 'terms') {
    pairs = shuffle(rng, TERMS)
      .slice(0, count)
      .map(([a, b]) => ({ left: a, right: b, icon: 'star' as PictogramId }))
  } else {
    pairs = shuffle(rng, PICTURE_SET)
      .slice(0, count)
      .map((p) => ({ left: p.word, right: p.word, icon: p.icon }))
  }

  const shuffledRight = shuffle(
    rng,
    pairs.map((p, index) => ({ label: p.right, index })),
  )

  return {
    ...baseFields(input, 'matching'),
    topic: custom.length >= 3 ? 'custom' : topic,
    pairs,
    shuffledRight,
  }
}

function Icon({ id }: { id: PictogramId }) {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
      <g dangerouslySetInnerHTML={{ __html: opsToSvg(PICTOGRAMS[id].ops) }} />
    </svg>
  )
}

export function renderPreview(model: MatchingModel): ReactNode {
  const pictures = model.topic === 'pictures'
  return (
    <div>
      <p className="mb-3 text-[10px] uppercase tracking-wider text-ink/45">
        Draw a line to match each pair
      </p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-y-2">
        {model.pairs.map((p, i) => {
          const right = model.shuffledRight[i]!
          return (
            <div key={i} className="contents">
              <div className="flex items-center gap-2 rounded-full border border-ink/15 bg-white px-2 py-1 text-[12px]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-coral/15 text-[10px] font-bold">
                  {i + 1}
                </span>
                {pictures ? <Icon id={p.icon} /> : null}
                <span className={pictures ? 'capitalize' : 'tracking-widest'}>{pictures ? p.left : p.left}</span>
              </div>
              <div className="mx-2 h-px w-8 border-t border-dotted border-ink/30" />
              <div className="flex items-center justify-end gap-2 rounded-full border border-ink/15 bg-white px-2 py-1 text-[12px]">
                <span className="capitalize">{right.label}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-ink/30 text-[10px] font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export async function renderPdf(
  model: MatchingModel,
  pdfDoc: PDFDocument,
  fonts: PdfFonts,
  options: PdfOptions,
): Promise<void> {
  const page = addA4Page(pdfDoc)
  const { contentTop, margin } = drawChrome(page, fonts, model, options)
  const color = ink()
  let y = contentTop
  page.drawText('Draw a line from each item on the left to its match on the right.', {
    x: margin,
    y,
    size: 9,
    font: fonts.regular,
    color: muted(),
  })
  y -= 28
  const pictures = model.topic === 'pictures'
  model.pairs.forEach((p, i) => {
    const right = model.shuffledRight[i]!
    const rowY = y - i * 52
    page.drawCircle({ x: margin + 10, y: rowY + 6, size: 8, borderColor: color, borderWidth: 0.8 })
    const n = String(i + 1)
    page.drawText(n, {
      x: margin + 10 - fonts.bold.widthOfTextAtSize(n, 9) / 2,
      y: rowY + 3,
      size: 9,
      font: fonts.bold,
      color,
    })
    if (pictures) {
      drawOpsOnPage(page, PICTOGRAMS[p.icon].ops, margin + 24, rowY - 10, 1.1, 0.9)
      page.drawText(p.left, { x: margin + 64, y: rowY + 2, size: 11, font: fonts.regular, color })
    } else {
      page.drawText(p.left, { x: margin + 26, y: rowY + 2, size: 11, font: fonts.regular, color })
    }
    page.drawLine({
      start: { x: margin + 160, y: rowY + 6 },
      end: { x: 360, y: rowY + 6 },
      thickness: 0.5,
      color: muted(),
      dashArray: [2, 3],
    })
    const letter = String.fromCharCode(65 + i)
    page.drawText(right.label, { x: 380, y: rowY + 2, size: 11, font: fonts.regular, color })
    page.drawCircle({ x: 520, y: rowY + 6, size: 8, borderColor: color, borderWidth: 0.8 })
    page.drawText(letter, {
      x: 520 - fonts.bold.widthOfTextAtSize(letter, 9) / 2,
      y: rowY + 3,
      size: 9,
      font: fonts.bold,
      color,
    })
  })
}
