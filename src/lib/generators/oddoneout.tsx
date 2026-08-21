import type { ReactNode } from 'react'
import type { PDFDocument } from 'pdf-lib'
import type { OddOneOutModel, OddRow, PdfFonts, PdfOptions, WizardInput } from '../../types'
import { mulberry32, pick, randInt, shuffle } from '../rng'
import { displayName, madeForLine, defaultTitle } from '../catalog'
import { addA4Page, drawChrome, ink, muted } from '../pdf'

interface Bank {
  hint: string
  groups: string[][]
  odd: string[]
}

const BANKS: Bank[] = [
  { hint: 'animals', groups: [['cat', 'dog', 'cow'], ['lion', 'tiger', 'zebra']], odd: ['mango', 'bus', 'pencil'] },
  { hint: 'food', groups: [['rice', 'dal', 'roti'], ['idli', 'dosa', 'samosa']], odd: ['tiger', 'cloud', 'ruler'] },
  { hint: 'numbers', groups: [['2', '4', '6'], ['1', '3', '5'], ['10', '20', '30']], odd: ['7', '9', '11', '15'] },
  { hint: 'shapes', groups: [['circle', 'circle', 'circle'], ['square', 'square', 'square']], odd: ['triangle', 'star'] },
  { hint: 'school', groups: [['pen', 'pencil', 'eraser'], ['book', 'bag', 'desk']], odd: ['river', 'moon', 'fish'] },
  { hint: 'nature', groups: [['tree', 'leaf', 'flower'], ['rain', 'cloud', 'sun']], odd: ['chair', 'truck', 'socks'] },
]

function makeRow(rng: () => number): OddRow {
  const bank = pick(rng, BANKS)
  const base = pick(rng, bank.groups)
  const odd = pick(rng, bank.odd)
  const items = shuffle(rng, [...base, odd])
  return { items, oddIndex: items.indexOf(odd), hint: bank.hint }
}

export function generate(input: WizardInput): OddOneOutModel {
  const rng = mulberry32(input.seed)
  const rows: OddRow[] = []
  for (let i = 0; i < 6; i++) {
    if (i === 2) {
      const n = randInt(rng, 2, 9)
      const items = shuffle(rng, [String(n), String(n), String(n), String(n + 3)])
      const oddVal = String(n + 3)
      rows.push({ items, oddIndex: items.indexOf(oddVal), hint: 'numbers' })
    } else {
      rows.push(makeRow(rng))
    }
  }
  return {
    kind: 'oddoneout',
    seed: input.seed,
    title: input.title.trim() || defaultTitle(input.childName, input.unlocked, 'oddoneout'),
    displayName: displayName(input.childName, input.unlocked),
    madeFor: madeForLine(input.childName, input.unlocked),
    theme: input.theme,
    unlocked: input.unlocked,
    age: input.age,
    difficulty: input.difficulty,
    topic: input.topic,
    rows,
  }
}

export function renderPreview(model: OddOneOutModel): ReactNode {
  return (
    <div>
      <p className="mb-3 text-[10px] uppercase tracking-wider text-ink/45">
        Circle the odd one in each row
      </p>
      <div className="space-y-2">
        {model.rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-4 text-[10px] text-ink/40">{i + 1}.</span>
            <div className="grid flex-1 grid-cols-4 gap-1.5">
              {row.items.map((item, j) => (
                <div
                  key={j}
                  className="rounded-lg border border-ink/15 bg-white py-2 text-center text-[12px] capitalize"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export async function renderPdf(
  model: OddOneOutModel,
  pdfDoc: PDFDocument,
  fonts: PdfFonts,
  options: PdfOptions,
): Promise<void> {
  const page = addA4Page(pdfDoc)
  const { contentTop, margin } = drawChrome(page, fonts, model, options)
  const color = ink()
  let y = contentTop
  page.drawText('Circle the word or number that does not belong.', {
    x: margin,
    y,
    size: 9,
    font: fonts.regular,
    color: muted(),
  })
  y -= 28
  const boxW = (595.28 - margin * 2 - 36 - 18) / 4
  model.rows.forEach((row, i) => {
    const rowY = y - i * 72
    page.drawText(`${i + 1}.`, { x: margin, y: rowY + 10, size: 11, font: fonts.bold, color: muted() })
    row.items.forEach((item, j) => {
      const x = margin + 28 + j * (boxW + 6)
      page.drawRectangle({
        x,
        y: rowY - 8,
        width: boxW,
        height: 36,
        borderColor: color,
        borderWidth: 0.9,
      })
      const tw = fonts.regular.widthOfTextAtSize(item, 11)
      page.drawText(item, {
        x: x + (boxW - tw) / 2,
        y: rowY + 4,
        size: 11,
        font: fonts.regular,
        color,
      })
    })
  })
}
