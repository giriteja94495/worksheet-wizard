import type { ReactNode } from 'react'
import type { PDFDocument } from 'pdf-lib'
import type { MathsModel, MathsProblem, PdfFonts, PdfOptions, WizardInput } from '../../types'
import { mulberry32, randInt, pick } from '../rng'
import { addA4Page, drawChrome, drawWrapped, ensureSpace, ink, muted, startPage } from '../pdf'
import { baseFields, classBand, defaultQuestionCount, effectiveCount } from '../sheet'

const ARITH_OPS = ['addition', 'subtraction', 'multiplication', 'division'] as const

function arith(
  a: number,
  b: number,
  op: MathsProblem['op'],
  answer: number,
  layout: MathsProblem['layout'] = 'horizontal',
): MathsProblem {
  return { a, b, op, answer: String(answer), layout }
}

function prompt(text: string, answer: string): MathsProblem {
  return { layout: 'prompt', prompt: text, answer }
}

function makeArith(
  rng: () => number,
  opName: string,
  input: WizardInput,
): MathsProblem {
  const cls = input.classLevel
  const easy = input.difficulty === 'easy'
  const hard = input.difficulty === 'hard'
  let op = opName
  if (op === 'mixed') op = pick(rng, [...ARITH_OPS])
  const layout: MathsProblem['layout'] = cls <= 2 || easy ? 'horizontal' : 'vertical'

  if (op === 'addition') {
    if (cls <= 2) {
      const max = cls === 1 ? (easy ? 9 : 20) : hard ? 99 : 40
      const a = randInt(rng, 0, max)
      const b = randInt(rng, 0, max)
      return arith(a, b, '+', a + b, 'horizontal')
    }
    if (cls <= 5) {
      const a = hard ? randInt(rng, 100, 899) : randInt(rng, 10, 99)
      const b = hard ? randInt(rng, 100, 999 - a) : randInt(rng, 10, 99)
      return arith(a, b, '+', a + b, layout)
    }
    const a = randInt(rng, 120, 850)
    const b = randInt(rng, 80, 999 - a)
    return arith(a, b, '+', a + b, 'vertical')
  }

  if (op === 'subtraction') {
    if (cls <= 2) {
      const a = randInt(rng, 1, cls === 1 ? 20 : 50)
      const b = randInt(rng, 0, a)
      return arith(a, b, '−', a - b, 'horizontal')
    }
    const a = hard ? randInt(rng, 200, 999) : randInt(rng, 20, 99)
    const b = hard ? randInt(rng, 50, a - 10) : randInt(rng, 10, a)
    return arith(a, b, '−', a - b, layout)
  }

  if (op === 'multiplication') {
    if (cls <= 2) {
      const a = randInt(rng, 1, 5)
      const b = randInt(rng, 1, 5)
      return arith(a, b, '×', a * b, 'horizontal')
    }
    if (easy) {
      const a = randInt(rng, 1, 10)
      const b = randInt(rng, 1, 10)
      return arith(a, b, '×', a * b, layout)
    }
    if (hard) {
      const a = randInt(rng, 12, cls >= 6 ? 99 : 32)
      const b = randInt(rng, 3, cls >= 6 ? 28 : 12)
      return arith(a, b, '×', a * b, cls >= 5 ? 'vertical' : layout)
    }
    const a = randInt(rng, 6, 12)
    const b = randInt(rng, 2, 12)
    return arith(a, b, '×', a * b, layout)
  }

  const b = easy ? randInt(rng, 2, 9) : randInt(rng, 2, 12)
  const q = easy ? randInt(rng, 1, 9) : hard ? randInt(rng, 8, 24) : randInt(rng, 2, 12)
  return arith(b * q, b, '÷', q, 'horizontal')
}

function numbers(rng: () => number, input: WizardInput): MathsProblem {
  const max = input.classLevel === 1 ? 20 : 50
  const n = randInt(rng, 2, max - 1)
  const kind = randInt(rng, 0, 3)
  if (kind === 0) return prompt(`Write the number that comes after ${n}.`, String(n + 1))
  if (kind === 1) return prompt(`Write the number that comes before ${n}.`, String(n - 1))
  if (kind === 2) {
    const a = randInt(rng, 1, max)
    const b = randInt(rng, 1, max)
    const bigger = Math.max(a, b)
    return prompt(`Which is greater: ${a} or ${b}?`, String(bigger))
  }
  return prompt(`Write ${n} in words.`, numberWords(n))
}

function numberWords(n: number): string {
  const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty']
  if (n < 20) return ones[n] ?? String(n)
  return `${tens[Math.floor(n / 10)]} ${ones[n % 10] === 'zero' ? '' : ones[n % 10]}`.trim()
}

function missing(rng: () => number, input: WizardInput): MathsProblem {
  const max = input.classLevel === 1 ? 10 : 20
  const a = randInt(rng, 1, max)
  const b = randInt(rng, 0, max)
  if (rng() < 0.5) return prompt(`${a} + □ = ${a + b}`, String(b))
  const total = a + b
  return prompt(`□ + ${b} = ${total}`, String(a))
}

function fractions(rng: () => number, input: WizardInput): MathsProblem {
  const d = pick(rng, [2, 3, 4, 6, 8])
  const n = randInt(rng, 1, d - 1)
  const kind = randInt(rng, 0, 3)
  const whole = d * randInt(rng, 2, 5)
  if (kind === 0) return prompt(`Write the fraction with numerator ${n} and denominator ${d}.`, `${n}/${d}`)
  if (kind === 1) return prompt(`Find 1/${d} of ${whole}.`, String(whole / d))
  if (kind === 2) return prompt(`Find ${n}/${d} of ${whole}.`, String((n * whole) / d))
  if (input.classLevel >= 5) {
    return prompt(`Add: 1/${d} + 1/${d}`, d === 2 ? '1' : `2/${d}`)
  }
  return prompt(`Which is greater: 1/2 or 1/${Math.max(d, 4)}?`, '1/2')
}

function wordProblem(rng: () => number, input: WizardInput): MathsProblem {
  const names = ['Aarav', 'Anaya', 'Kabir', 'Meera', 'Rohan']
  const name = pick(rng, names)
  const a = randInt(rng, 2, input.classLevel <= 3 ? 9 : 24)
  const b = randInt(rng, 2, 12)
  const kind = randInt(rng, 0, 3)
  if (kind === 0) {
    return prompt(`${name} bought ${a} notebooks at ₹${b} each. How much did ${name} spend?`, `₹${a * b}`)
  }
  if (kind === 1) {
    const total = a + b
    return prompt(`${name} had ${total} sweets and gave ${b} to a friend. How many sweets are left?`, String(a))
  }
  if (kind === 2) {
    return prompt(`A box holds ${b} pencils. How many pencils are there in ${a} boxes?`, String(a * b))
  }
  const km = randInt(rng, 2, 9)
  return prompt(`A bus travels ${km} km in 1 hour. How far does it travel in ${a} hours?`, `${km * a} km`)
}

function measurement(rng: () => number, input: WizardInput): MathsProblem {
  const kind = randInt(rng, 0, 3)
  if (kind === 0) {
    const m = randInt(rng, 1, 9)
    const cm = randInt(rng, 1, 90)
    return prompt(`Convert ${m} m ${cm} cm into centimetres.`, `${m * 100 + cm} cm`)
  }
  if (kind === 1) {
    const kg = randInt(rng, 1, 8)
    return prompt(`How many grams are there in ${kg} kg?`, `${kg * 1000} g`)
  }
  if (kind === 2) {
    const h = randInt(rng, 1, 5)
    return prompt(`${h} hours = ____ minutes.`, String(h * 60))
  }
  const l = input.classLevel >= 5 ? randInt(rng, 2, 9) : randInt(rng, 2, 5)
  const b = randInt(rng, 2, 8)
  return prompt(`Find the perimeter of a rectangle ${l} cm by ${b} cm.`, `${2 * (l + b)} cm`)
}

function integers(rng: () => number): MathsProblem {
  const a = randInt(rng, -12, 12)
  const b = randInt(rng, -9, 9)
  const kind = randInt(rng, 0, 3)
  if (kind === 0) return prompt(`(− integers)  ${a} + (${b}) =`, String(a + b))
  if (kind === 1) return prompt(`${a} − (${b}) =`, String(a - b))
  if (kind === 2) {
    const x = randInt(rng, -6, 6) || 2
    const y = randInt(rng, -5, 5) || 3
    return prompt(`${x} × (${y}) =`, String(x * y))
  }
  return prompt(`The additive inverse of ${a} is`, String(-a))
}

function decimals(rng: () => number): MathsProblem {
  const a = randInt(rng, 10, 80) / 10
  const b = randInt(rng, 5, 40) / 10
  const kind = randInt(rng, 0, 2)
  if (kind === 0) return prompt(`${a.toFixed(1)} + ${b.toFixed(1)} =`, (a + b).toFixed(1))
  if (kind === 1) {
    const x = Math.max(a, b)
    const y = Math.min(a, b)
    return prompt(`${x.toFixed(1)} − ${y.toFixed(1)} =`, (x - y).toFixed(1))
  }
  const n = randInt(rng, 2, 9)
  return prompt(`${n} × 0.5 =`, String(n * 0.5))
}

function percentages(rng: () => number): MathsProblem {
  const p = pick(rng, [10, 20, 25, 50, 5])
  const base = pick(rng, [40, 80, 100, 120, 200, 250])
  const kind = randInt(rng, 0, 2)
  if (kind === 0) return prompt(`Find ${p}% of ${base}.`, String((p * base) / 100))
  if (kind === 1) return prompt(`Convert ${p / 100} into a percentage.`, `${p}%`)
  return prompt(`${p} is what percent of ${base}?`, `${(p / base) * 100}%`.replace(/(\.\d{3})\d+/, ''))
}

function algebra(rng: () => number, input: WizardInput): MathsProblem {
  const x = randInt(rng, 2, 12)
  const c = randInt(rng, 1, 9)
  const m = randInt(rng, 2, 6)
  const kind = randInt(rng, 0, 3)
  if (kind === 0) return prompt(`If x = ${x}, find 2x + ${c}.`, String(2 * x + c))
  if (kind === 1) return prompt(`Solve: ${m}x + ${c} = ${m * x + c}`, `x = ${x}`)
  if (kind === 2) return prompt(`Simplify: ${m}a + ${c}a`, `${m + c}a`)
  if (input.classLevel >= 8) return prompt(`Solve: ${m}(x − 2) = ${m * (x - 2)}`, `x = ${x}`)
  return prompt(`Write an expression for “${c} more than ${m} times a number x”.`, `${m}x + ${c}`)
}

function geometry(rng: () => number): MathsProblem {
  const kind = randInt(rng, 0, 3)
  if (kind === 0) {
    const s = randInt(rng, 4, 12)
    return prompt(`Find the area of a square of side ${s} cm.`, `${s * s} cm²`)
  }
  if (kind === 1) {
    const l = randInt(rng, 5, 14)
    const b = randInt(rng, 3, 10)
    return prompt(`Find the area of a rectangle ${l} cm by ${b} cm.`, `${l * b} cm²`)
  }
  if (kind === 2) {
    const a = randInt(rng, 20, 70)
    return prompt(`If one angle of a linear pair is ${a}°, the other is`, `${180 - a}°`)
  }
  const r = randInt(rng, 3, 10)
  return prompt(`Perimeter of a square of side ${r} cm =`, `${4 * r} cm`)
}

function linear(rng: () => number): MathsProblem {
  const x = randInt(rng, 2, 15)
  const m = randInt(rng, 2, 7)
  const c = randInt(rng, 1, 12)
  const kind = randInt(rng, 0, 3)
  if (kind === 0) return prompt(`Solve: ${m}x + ${c} = ${m * x + c}`, `x = ${x}`)
  if (kind === 1) return prompt(`Solve: ${m}x − ${c} = ${m * x - c}`, `x = ${x}`)
  if (kind === 2) return prompt(`Solve: ${m}x + 4 = ${(m - 1) * x + 4 + x}`, `x = ${x}`)
  return prompt(`If x = ${x}, y = 1 is a solution of ${m}x + y = k, find k.`, `k = ${m * x + 1}`)
}

function polynomials(rng: () => number): MathsProblem {
  const kind = randInt(rng, 0, 3)
  if (kind === 0) return prompt('Write the degree of 4x³ − x + 2.', '3')
  if (kind === 1) return prompt('How many terms does 5x² + 3x − 7 have?', '3')
  if (kind === 2) return prompt('Add: (x² + 2x) + (3x − 1)', 'x² + 5x − 1')
  return prompt('The coefficient of x in 7x − 3 is', '7')
}

function quadratic(rng: () => number): MathsProblem {
  const r1 = randInt(rng, 1, 6)
  const r2 = randInt(rng, 1, 6)
  const kind = randInt(rng, 0, 2)
  if (kind === 0) {
    return prompt(`One root of x² − ${r1 + r2}x + ${r1 * r2} = 0 is`, String(r1))
  }
  if (kind === 1) return prompt('Write the standard form of a quadratic equation.', 'ax² + bx + c = 0')
  return prompt(`Identify a, b, c in ${r1}x² + ${r2}x − 6 = 0.`, `a = ${r1}, b = ${r2}, c = −6`)
}

function mensuration(rng: () => number): MathsProblem {
  const kind = randInt(rng, 0, 3)
  if (kind === 0) {
    const s = randInt(rng, 3, 10)
    return prompt(`Volume of a cube of side ${s} cm =`, `${s ** 3} cm³`)
  }
  if (kind === 1) {
    const l = randInt(rng, 4, 12)
    const b = randInt(rng, 3, 8)
    const h = randInt(rng, 2, 7)
    return prompt(`Volume of a cuboid ${l} cm × ${b} cm × ${h} cm =`, `${l * b * h} cm³`)
  }
  if (kind === 2) {
    const s = randInt(rng, 3, 9)
    return prompt(`Total surface area of a cube of side ${s} cm =`, `${6 * s * s} cm²`)
  }
  const r = randInt(rng, 3, 7)
  const h = randInt(rng, 5, 12)
  return prompt(`Volume of a cylinder, r = ${r} cm, h = ${h} cm (take π = 22/7), is`, `${Math.round((22 / 7) * r * r * h)} cm³`)
}

function trig(rng: () => number): MathsProblem {
  const kind = randInt(rng, 0, 4)
  if (kind === 0) return prompt('sin 30° =', '1/2')
  if (kind === 1) return prompt('cos 90° =', '0')
  if (kind === 2) return prompt('tan 45° =', '1')
  if (kind === 3) return prompt('sin 90° =', '1')
  return prompt('Write sin θ in terms of opposite and hypotenuse.', 'opposite / hypotenuse')
}

function statistics(rng: () => number): MathsProblem {
  const n = 5
  const vals = Array.from({ length: n }, () => randInt(rng, 2, 18))
  const sum = vals.reduce((s, v) => s + v, 0)
  const mean = sum / n
  const kind = randInt(rng, 0, 2)
  if (kind === 0) return prompt(`Find the mean of ${vals.join(', ')}.`, String(mean))
  if (kind === 1) return prompt(`Find the sum of ${vals.join(', ')}.`, String(sum))
  const sorted = [...vals].sort((a, b) => a - b)
  return prompt(`The median of ${sorted.join(', ')} is`, String(sorted[2]))
}

function makeProblem(rng: () => number, topic: string, input: WizardInput): MathsProblem {
  switch (topic) {
    case 'numbers':
      return numbers(rng, input)
    case 'missing':
      return missing(rng, input)
    case 'fractions':
      return fractions(rng, input)
    case 'word':
      return wordProblem(rng, input)
    case 'measurement':
      return measurement(rng, input)
    case 'integers':
      return integers(rng)
    case 'decimals':
      return decimals(rng)
    case 'percentages':
      return percentages(rng)
    case 'algebra':
      return algebra(rng, input)
    case 'geometry':
      return geometry(rng)
    case 'linear':
      return linear(rng)
    case 'polynomials':
      return polynomials(rng)
    case 'quadratic':
      return quadratic(rng)
    case 'mensuration':
      return mensuration(rng)
    case 'trig':
      return trig(rng)
    case 'statistics':
      return statistics(rng)
    case 'mixed': {
      const band = classBand(input.classLevel)
      if (band === 'early') return pick(rng, [() => makeArith(rng, pick(rng, ['addition', 'subtraction']), input), () => missing(rng, input), () => numbers(rng, input)])()
      if (band === 'primary') return pick(rng, [() => makeArith(rng, pick(rng, [...ARITH_OPS]), input), () => fractions(rng, input), () => wordProblem(rng, input)])()
      if (band === 'middle') return pick(rng, [() => integers(rng), () => decimals(rng), () => percentages(rng), () => algebra(rng, input)])()
      return pick(rng, [() => linear(rng), () => polynomials(rng), () => trig(rng), () => statistics(rng)])()
    }
    default:
      return makeArith(rng, topic || 'addition', input)
  }
}

export function generate(input: WizardInput): MathsModel {
  const rng = mulberry32(input.seed)
  const fallback = defaultQuestionCount('maths', input.classLevel, input.difficulty)
  const count = effectiveCount(input, fallback)
  const problems: MathsProblem[] = []
  for (let i = 0; i < count; i++) {
    problems.push(makeProblem(rng, input.topic || 'addition', input))
  }
  return {
    ...baseFields(input, 'maths'),
    problems,
  }
}

function ProblemCard({ p, i }: { p: MathsProblem; i: number }) {
  if (p.layout === 'prompt') {
    return (
      <div className="col-span-2 rounded-lg border border-ink/10 bg-white/70 px-3 py-2 text-[12px]">
        <span className="mr-1 text-[11px] text-ink-soft/70">{i + 1}.</span>
        {p.prompt}
        <div className="mt-1 h-3 border-b border-dotted border-ink/30" />
      </div>
    )
  }
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
      <p className="mb-2 text-[10px] uppercase tracking-wider text-ink/45">
        {model.topic} · {model.difficulty} · Class {model.classLevel}
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
  let cursor = startPage(pdfDoc, fonts, model, options)
  const color = ink()
  const cols = 2
  const colW = (595.28 - cursor.margin * 2 - 16) / cols
  const rowH = 36

  cursor.page.drawText(`${model.topic}  ·  ${model.difficulty}  ·  Class ${model.classLevel}`, {
    x: cursor.margin,
    y: cursor.y,
    size: 8,
    font: fonts.regular,
    color: muted(),
  })
  cursor.y -= 18

  let arithIndex = 0
  for (let i = 0; i < model.problems.length; i++) {
    const p = model.problems[i]!
    if (p.layout === 'prompt') {
      cursor = ensureSpace(cursor, 36, pdfDoc, fonts, model, options)
      cursor.page.drawText(`${i + 1}.`, {
        x: cursor.margin,
        y: cursor.y,
        size: 9,
        font: fonts.regular,
        color: muted(),
      })
      cursor.y = drawWrapped(cursor.page, p.prompt ?? '', {
        x: cursor.margin + 18,
        y: cursor.y,
        size: 11,
        font: fonts.regular,
        color,
        maxWidth: 595.28 - cursor.margin * 2 - 18,
        lineHeight: 14,
      })
      cursor.page.drawLine({
        start: { x: cursor.margin + 18, y: cursor.y - 4 },
        end: { x: 595.28 - cursor.margin, y: cursor.y - 4 },
        thickness: 0.5,
        color: muted(),
      })
      cursor.y -= 22
      arithIndex = 0
      continue
    }

    cursor = ensureSpace(cursor, rowH, pdfDoc, fonts, model, options)
    const col = arithIndex % cols
    if (col === 0 && arithIndex > 0) {
      /* row already accounted via y when wrapping */
    }
    const x = cursor.margin + col * (colW + 16)
    const py = cursor.y
    cursor.page.drawText(`${i + 1}.`, { x, y: py, size: 9, font: fonts.regular, color: muted() })
    if (p.layout === 'vertical') {
      const numX = x + 70
      const a = String(p.a)
      const b = `${p.op} ${p.b}`
      cursor.page.drawText(a, {
        x: numX - fonts.bold.widthOfTextAtSize(a, 12),
        y: py + 8,
        size: 12,
        font: fonts.bold,
        color,
      })
      cursor.page.drawText(b, {
        x: numX - fonts.bold.widthOfTextAtSize(b, 12),
        y: py - 6,
        size: 12,
        font: fonts.bold,
        color,
      })
      cursor.page.drawLine({
        start: { x: numX - 48, y: py - 10 },
        end: { x: numX + 4, y: py - 10 },
        thickness: 0.8,
        color,
      })
    } else {
      cursor.page.drawText(`${p.a}  ${p.op}  ${p.b}  =`, {
        x: x + 18,
        y: py,
        size: 12,
        font: fonts.bold,
        color,
      })
      cursor.page.drawLine({
        start: { x: x + 110, y: py - 2 },
        end: { x: x + colW - 12, y: py - 2 },
        thickness: 0.6,
        color: muted(),
      })
    }
    arithIndex += 1
    if (arithIndex % cols === 0) cursor.y -= rowH
  }

  if (!model.includeAnswerKey) return

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
    if (ky < box.contentBottom + 14) return
    const text =
      p.layout === 'prompt'
        ? `${i + 1}.  ${p.answer}`
        : `${i + 1}.  ${p.a} ${p.op} ${p.b} = ${p.answer}`
    key.drawText(text, {
      x: box.margin,
      y: ky,
      size: 10,
      font: fonts.regular,
      color,
    })
    ky -= 14
  })
}
