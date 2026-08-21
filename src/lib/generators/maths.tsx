import type { ReactNode } from 'react'
import type { PDFDocument } from 'pdf-lib'
import type { MathsModel, MathsProblem, PdfFonts, PdfOptions, WizardInput } from '../../types'
import { mulberry32, randInt, pick } from '../rng'
import { displayName, madeForLine, defaultTitle } from '../catalog'
import { addA4Page, drawChrome, ink, muted } from '../pdf'

const OPS = ['addition', 'subtraction', 'multiplication', 'division'] as const

function makeProblem(
  rng: () => number,
  opName: string,
  age: number,
  difficulty: WizardInput['difficulty'],
): MathsProblem {
  const layout: MathsProblem['layout'] =
    age <= 6 || difficulty === 'easy' ? 'horizontal' : 'vertical'
  let a = 1
  let b = 1
  let op = opName
  if (op === 'mixed') op = pick(rng, [...OPS])

  const easy = difficulty === 'easy' || age <= 6
  const hard = difficulty === 'hard' || age >= 10

  if (op === 'addition') {
    if (easy) {
      a = randInt(rng, 0, age <= 5 ? 9 : 20)
      b = randInt(rng, 0, age <= 5 ? 9 : 20)
    } else if (hard) {
      a = randInt(rng, 100, 899)
      b = randInt(rng, 100, 999 - a)
    } else {
      a = randInt(rng, 10, 99)
      b = randInt(rng, 10, 99)
    }
    return { a, b, op: '+', answer: a + b, layout }
  }

  if (op === 'subtraction') {
    if (easy) {
      a = randInt(rng, 1, age <= 5 ? 10 : 20)
      b = randInt(rng, 0, a)
    } else if (hard) {
      a = randInt(rng, 200, 999)
      b = randInt(rng, 50, a - 10)
    } else {
      a = randInt(rng, 20, 99)
      b = randInt(rng, 10, a)
    }
    return { a, b, op: '−', answer: a - b, layout }
  }

  if (op === 'multiplication') {
    if (easy) {
      a = randInt(rng, 1, age <= 6 ? 5 : 10)
      b = randInt(rng, 1, 10)
    } else if (hard) {
      a = randInt(rng, 12, age >= 11 ? 99 : 32)
      b = randInt(rng, 3, age >= 11 ? 28 : 12)
    } else {
      a = randInt(rng, 6, 12)
      b = randInt(rng, 2, 12)
    }
    return { a, b, op: '×', answer: a * b, layout: age >= 10 && hard ? 'vertical' : layout }
  }

  // division — exact
  if (easy) {
    b = randInt(rng, 2, 9)
    const q = randInt(rng, 1, 9)
    a = b * q
    return { a, b, op: '÷', answer: q, layout: 'horizontal' }
  }
  if (hard) {
    b = randInt(rng, 4, 12)
    const q = randInt(rng, 8, age >= 11 ? 48 : 24)
    a = b * q
    return { a, b, op: '÷', answer: q, layout: 'horizontal' }
  }
  b = randInt(rng, 2, 12)
  const q = randInt(rng, 2, 12)
  a = b * q
  return { a, b, op: '÷', answer: q, layout: 'horizontal' }
}

export function generate(input: WizardInput): MathsModel {
  const rng = mulberry32(input.seed)
  const count = input.difficulty === 'hard' ? 20 : input.difficulty === 'medium' ? 16 : 12
  const problems: MathsProblem[] = []
  for (let i = 0; i < count; i++) {
    problems.push(makeProblem(rng, input.topic || 'addition', input.age, input.difficulty))
  }
  return {
    kind: 'maths',
    seed: input.seed,
    title: input.title.trim() || defaultTitle(input.childName, input.unlocked, 'maths'),
    displayName: displayName(input.childName, input.unlocked),
    madeFor: madeForLine(input.childName, input.unlocked),
    theme: input.theme,
    unlocked: input.unlocked,
    age: input.age,
    difficulty: input.difficulty,
    topic: input.topic,
    problems,
  }
}

function ProblemCard({ p, i }: { p: MathsProblem; i: number }) {
  if (p.layout === 'vertical') {
    return (
      <div className="flex items-end gap-2 rounded-lg border border-ink/10 bg-white/70 px-3 py-2">
        <span className="text-[11px] text-ink-soft/70">{i + 1}.</span>
        <div className="font-ui text-right text-[15px] tabular-nums leading-5">
          <div>{p.a}</div>
          <div className="border-b border-ink/70">
            {p.op} {p.b}
          </div>
          <div className="h-5" />
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 rounded-lg border border-ink/10 bg-white/70 px-3 py-2 text-[15px] tabular-nums">
      <span className="text-[11px] text-ink-soft/70">{i + 1}.</span>
      <span>
        {p.a} {p.op} {p.b} =
      </span>
      <span className="ml-auto min-w-[3.2rem] border-b border-dotted border-ink/40" />
    </div>
  )
}

export function renderPreview(model: MathsModel): ReactNode {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex gap-2 text-[10px]">
        {['Name', 'Date', 'Score'].map((lab) => (
          <div key={lab} className="flex flex-1 items-end gap-1 border-b border-ink/20 pb-0.5">
            <span className="text-ink/50">{lab}</span>
            <span className="flex-1" />
          </div>
        ))}
      </div>
      <p className="mb-2 text-[10px] uppercase tracking-wider text-ink/45">
        {model.topic} · {model.difficulty} · age {model.age}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {model.problems.map((p, i) => (
          <ProblemCard key={i} p={p} i={i} />
        ))}
      </div>
    </div>
  )
}

export async function renderPdf(
  model: MathsModel,
  pdfDoc: PDFDocument,
  fonts: PdfFonts,
  options: PdfOptions,
): Promise<void> {
  const page = addA4Page(pdfDoc)
  const { contentTop, margin } = drawChrome(page, fonts, model, options)
  const color = ink()
  let y = contentTop

  const boxW = (595.28 - margin * 2 - 24) / 3
  ;['Name', 'Date', 'Score'].forEach((lab, i) => {
    const x = margin + i * (boxW + 12)
    page.drawText(lab, { x, y: y - 2, size: 8, font: fonts.regular, color: muted() })
    page.drawLine({
      start: { x: x + 28, y: y },
      end: { x: x + boxW, y: y },
      thickness: 0.6,
      color: muted(),
    })
  })
  y -= 22
  page.drawText(`${model.topic}  ·  ${model.difficulty}  ·  age ${model.age}`, {
    x: margin,
    y,
    size: 8,
    font: fonts.regular,
    color: muted(),
  })
  y -= 18

  const cols = 2
  const colW = (595.28 - margin * 2 - 16) / cols
  const rowH = 36
  model.problems.forEach((p, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = margin + col * (colW + 16)
    const py = y - row * rowH
    page.drawText(`${i + 1}.`, { x, y: py, size: 9, font: fonts.regular, color: muted() })
    if (p.layout === 'vertical') {
      const numX = x + 70
      const a = String(p.a)
      const b = `${p.op} ${p.b}`
      page.drawText(a, {
        x: numX - fonts.bold.widthOfTextAtSize(a, 12),
        y: py + 8,
        size: 12,
        font: fonts.bold,
        color,
      })
      page.drawText(b, {
        x: numX - fonts.bold.widthOfTextAtSize(b, 12),
        y: py - 6,
        size: 12,
        font: fonts.bold,
        color,
      })
      page.drawLine({
        start: { x: numX - 48, y: py - 10 },
        end: { x: numX + 4, y: py - 10 },
        thickness: 0.8,
        color,
      })
    } else {
      page.drawText(`${p.a}  ${p.op}  ${p.b}  =`, {
        x: x + 18,
        y: py,
        size: 12,
        font: fonts.bold,
        color,
      })
      page.drawLine({
        start: { x: x + 110, y: py - 2 },
        end: { x: x + colW - 12, y: py - 2 },
        thickness: 0.6,
        color: muted(),
      })
    }
  })

  const key = addA4Page(pdfDoc)
  const box = drawChrome(key, fonts, { ...model, title: 'Answer key' }, options)
  let ky = box.contentTop
  key.drawText('Keep this page for checking. Fold it back while working.', {
    x: box.margin,
    y: ky,
    size: 9,
    font: fonts.regular,
    color: muted(),
  })
  ky -= 22
  model.problems.forEach((p, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = box.margin + col * 250
    const py = ky - row * 16
    key.drawText(`${i + 1}.  ${p.a} ${p.op} ${p.b} = ${p.answer}`, {
      x,
      y: py,
      size: 10,
      font: fonts.regular,
      color,
    })
  })
}

