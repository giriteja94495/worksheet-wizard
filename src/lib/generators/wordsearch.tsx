import type { ReactNode } from 'react'
import type { PDFDocument } from 'pdf-lib'
import type { PdfFonts, PdfOptions, WizardInput, WordSearchModel } from '../../types'
import { mulberry32, pick, randInt } from '../rng'
import { isWordTheme, themedWords } from '../words'
import { addA4Page, drawChrome, ink, muted } from '../pdf'
import { baseFields, effectiveCount, parseWordList } from '../sheet'

type Dir = { dx: number; dy: number }

const HV: Dir[] = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
]
const HVD: Dir[] = [
  ...HV,
  { dx: 1, dy: 1 },
  { dx: 1, dy: -1 },
]

function placeWords(size: number, words: string[], dirs: Dir[], rng: () => number): string[][] {
  const grid: (string | null)[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => null))
  const sorted = [...words].sort((a, b) => b.length - a.length)

  for (const raw of sorted) {
    const word = raw.toUpperCase().replace(/[^A-Z]/g, '')
    if (word.length > size) continue
    let placed = false
    for (let attempt = 0; attempt < 80 && !placed; attempt++) {
      const dir = pick(rng, dirs)
      const row = randInt(rng, 0, size - 1)
      const col = randInt(rng, 0, size - 1)
      const endR = row + dir.dy * (word.length - 1)
      const endC = col + dir.dx * (word.length - 1)
      if (endR < 0 || endC < 0 || endR >= size || endC >= size) continue
      let ok = true
      for (let i = 0; i < word.length; i++) {
        const r = row + dir.dy * i
        const c = col + dir.dx * i
        const cell = grid[r]![c]
        if (cell && cell !== word[i]) {
          ok = false
          break
        }
      }
      if (!ok) continue
      for (let i = 0; i < word.length; i++) {
        grid[row + dir.dy * i]![col + dir.dx * i] = word[i]!
      }
      placed = true
    }
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return grid.map((row) => row.map((ch) => ch ?? letters[randInt(rng, 0, 25)]!))
}

export function generate(input: WizardInput): WordSearchModel {
  const rng = mulberry32(input.seed)
  const custom = input.unlocked
    ? parseWordList(input.customWords)
        .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ''))
        .filter((w) => w.length >= 3)
    : []
  const theme = isWordTheme(input.topic) ? input.topic : 'animals'
  const size = input.difficulty === 'hard' ? 12 : input.difficulty === 'medium' ? 10 : 8
  const count = effectiveCount(input, input.difficulty === 'hard' ? 12 : input.difficulty === 'medium' ? 10 : 8)
  const picked =
    custom.length >= 4
      ? custom.filter((w) => w.length <= size).slice(0, count)
      : themedWords(rng, theme, input.age, input.difficulty, count)
          .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ''))
          .filter((w) => w.length >= 3 && w.length <= size)
  const dirs = input.difficulty === 'hard' || input.classLevel >= 6 ? HVD : HV
  const grid = placeWords(size, picked, dirs, rng)
  return {
    ...baseFields(input, 'wordsearch'),
    topic: custom.length >= 4 ? 'custom' : theme,
    size,
    grid,
    words: picked,
  }
}

export function renderPreview(model: WordSearchModel): ReactNode {
  return (
    <div className="flex h-full flex-col">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-ink/45">
        Find {model.words.length} {model.topic} words · {model.size}×{model.size}
      </p>
      <div
        className="mx-auto grid w-full max-w-[20rem] gap-px rounded-md border-2 border-ink/20 bg-ink/10 p-px"
        style={{ gridTemplateColumns: `repeat(${model.size}, minmax(0, 1fr))` }}
      >
        {model.grid.flatMap((row, r) =>
          row.map((ch, c) => (
            <div
              key={`${r}-${c}`}
              className="flex aspect-square items-center justify-center bg-paper text-[10px] font-bold"
            >
              {ch}
            </div>
          )),
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-wide">
        {model.words.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
    </div>
  )
}

export async function renderPdf(
  model: WordSearchModel,
  pdfDoc: PDFDocument,
  fonts: PdfFonts,
  options: PdfOptions,
): Promise<void> {
  const page = addA4Page(pdfDoc)
  const { contentTop, margin } = drawChrome(page, fonts, model, options)
  const color = ink()
  let y = contentTop
  page.drawText(`Find ${model.words.length} ${model.topic} words. Circle them.`, {
    x: margin,
    y,
    size: 9,
    font: fonts.regular,
    color: muted(),
  })
  y -= 18

  const size = model.size
  const cell = Math.min(28, (595.28 - margin * 2) / size)
  const gridW = cell * size
  const originX = (595.28 - gridW) / 2
  const originY = y - cell * size

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const x = originX + c * cell
      const yy = originY + (size - 1 - r) * cell
      page.drawRectangle({
        x,
        y: yy,
        width: cell,
        height: cell,
        borderColor: color,
        borderWidth: 0.7,
      })
      const ch = model.grid[r]![c]!
      const tw = fonts.bold.widthOfTextAtSize(ch, 11)
      page.drawText(ch, {
        x: x + (cell - tw) / 2,
        y: yy + cell / 2 - 4,
        size: 11,
        font: fonts.bold,
        color,
      })
    }
  }

  let ly = originY - 22
  page.drawText('Word list', { x: margin, y: ly, size: 11, font: fonts.display, color })
  ly -= 16
  model.words.forEach((w, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    page.drawText(w, {
      x: margin + col * 170,
      y: ly - row * 14,
      size: 10,
      font: fonts.regular,
      color,
    })
  })
}
