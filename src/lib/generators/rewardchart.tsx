import type { ReactNode } from 'react'
import type { PDFDocument } from 'pdf-lib'
import type { PdfFonts, PdfOptions, RewardChartModel, WizardInput } from '../../types'
import { displayName, madeForLine, defaultTitle } from '../catalog'
import { addA4Page, drawChrome, ink, muted, rgb } from '../pdf'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HABITS = ['Homework', 'Reading', 'Kindness', 'Tidy up', 'Sleep on time']

export function generate(input: WizardInput): RewardChartModel {
  return {
    kind: 'rewardchart',
    seed: input.seed,
    title: input.title.trim() || defaultTitle(input.childName, input.unlocked, 'rewardchart'),
    displayName: displayName(input.childName, input.unlocked),
    madeFor: madeForLine(input.childName, input.unlocked),
    theme: input.theme,
    unlocked: input.unlocked,
    age: input.age,
    difficulty: input.difficulty,
    topic: input.topic,
    habits: [...HABITS],
    days: [...DAYS],
  }
}

export function renderPreview(model: RewardChartModel): ReactNode {
  return (
    <div>
      <p className="mb-3 text-[10px] uppercase tracking-wider text-ink/45">
        Colour a star each day you do the habit
      </p>
      <div
        className="grid overflow-hidden rounded-lg border border-ink/15 text-[10px]"
        style={{ gridTemplateColumns: `1.4fr repeat(7, 1fr)` }}
      >
        <div className="bg-ink/[0.04] px-2 py-1.5 font-bold">Habit</div>
        {model.days.map((d) => (
          <div key={d} className="bg-ink/[0.04] py-1.5 text-center font-bold">
            {d}
          </div>
        ))}
        {model.habits.map((h) => (
          <div key={h} className="contents">
            <div className="border-t border-ink/10 px-2 py-2 font-semibold">{h}</div>
            {model.days.map((d) => (
              <div key={d} className="flex items-center justify-center border-t border-ink/10 py-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-sunflower text-[11px] text-sunflower">
                  ★
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="mt-3 font-hand text-sm text-ink/70">This week I am proud of ________________</p>
    </div>
  )
}

export async function renderPdf(
  model: RewardChartModel,
  pdfDoc: PDFDocument,
  fonts: PdfFonts,
  options: PdfOptions,
): Promise<void> {
  const page = addA4Page(pdfDoc)
  const { contentTop, margin } = drawChrome(page, fonts, model, options)
  const color = ink()
  let y = contentTop
  page.drawText('Colour a star each day you keep the habit.', {
    x: margin,
    y,
    size: 9,
    font: fonts.regular,
    color: muted(),
  })
  y -= 24
  const tableW = 595.28 - margin * 2
  const habitW = 130
  const dayW = (tableW - habitW) / 7
  const rowH = 52

  page.drawRectangle({
    x: margin,
    y: y - rowH + 16,
    width: tableW,
    height: rowH - 8,
    color: rgb(1, 0.965, 0.839),
  })
  page.drawText('Habit', { x: margin + 8, y: y - 8, size: 10, font: fonts.bold, color })
  model.days.forEach((d, i) => {
    const x = margin + habitW + i * dayW
    page.drawText(d, {
      x: x + dayW / 2 - fonts.bold.widthOfTextAtSize(d, 9) / 2,
      y: y - 8,
      size: 9,
      font: fonts.bold,
      color,
    })
  })

  model.habits.forEach((h, r) => {
    const rowY = y - (r + 1) * rowH
    page.drawRectangle({
      x: margin,
      y: rowY - 20,
      width: tableW,
      height: rowH,
      borderColor: color,
      borderWidth: 0.7,
    })
    page.drawText(h, { x: margin + 8, y: rowY + 4, size: 11, font: fonts.regular, color })
    model.days.forEach((_, i) => {
      const cx = margin + habitW + i * dayW + dayW / 2
      page.drawLine({
        start: { x: margin + habitW + i * dayW, y: rowY - 20 },
        end: { x: margin + habitW + i * dayW, y: rowY - 20 + rowH },
        thickness: 0.5,
        color: muted(),
      })
      page.drawSvgPath(starPath(cx, rowY + 6, 9), { borderColor: color, borderWidth: 1 })
    })
  })

  const footY = y - (model.habits.length + 1) * rowH - 36
  page.drawText('This week I am proud of', {
    x: margin,
    y: footY,
    size: 12,
    font: fonts.hand,
    color,
  })
  page.drawLine({
    start: { x: margin + 140, y: footY },
    end: { x: margin + tableW, y: footY },
    thickness: 0.7,
    color: muted(),
  })
}

function starPath(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const ang = (-90 + i * 36) * (Math.PI / 180)
    const rad = i % 2 === 0 ? r : r * 0.45
    pts.push(`${i === 0 ? 'M' : 'L'} ${cx + Math.cos(ang) * rad} ${cy + Math.sin(ang) * rad}`)
  }
  return pts.join(' ') + ' Z'
}
