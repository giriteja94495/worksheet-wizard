import type { ReactNode } from 'react'
import type { PDFDocument } from 'pdf-lib'
import type { ColouringModel, DrawOp, PdfFonts, PdfOptions, ThemeId, WizardInput } from '../../types'
import { opsToSvg } from '../pictograms'
import { addA4Page, drawChrome, ink, muted, rgb } from '../pdf'
import { baseFields } from '../sheet'

function scene(theme: ThemeId): { ops: DrawOp[]; caption: string } {
  if (theme === 'ocean') {
    return {
      caption: 'Colour the reef. Leave the water for last.',
      ops: [
        { t: 'ellipse', cx: 250, cy: 210, rx: 70, ry: 32 },
        { t: 'polyline', pts: [[320, 210], [360, 180], [360, 240], [320, 210]] },
        { t: 'circle', cx: 210, cy: 200, r: 6 },
        { t: 'ellipse', cx: 120, cy: 300, rx: 40, ry: 18 },
        { t: 'polyline', pts: [[160, 300], [190, 280], [190, 320], [160, 300]] },
        { t: 'circle', cx: 100, cy: 294, r: 4 },
        { t: 'circle', cx: 80, cy: 80, r: 16 },
        { t: 'circle', cx: 400, cy: 90, r: 10 },
        { t: 'circle', cx: 430, cy: 70, r: 6 },
        { t: 'circle', cx: 70, cy: 120, r: 8 },
        { t: 'polyline', pts: [[40, 380], [80, 340], [110, 380]] },
        { t: 'polyline', pts: [[200, 380], [240, 330], [270, 380]] },
        { t: 'polyline', pts: [[340, 380], [390, 300], [430, 380]] },
        { t: 'line', x1: 20, y1: 160, x2: 480, y2: 130 },
        { t: 'line', x1: 20, y1: 180, x2: 480, y2: 150 },
        { t: 'circle', cx: 300, cy: 90, r: 22 },
        { t: 'polyline', pts: [[300, 112], [292, 130], [308, 130], [300, 112]] },
      ],
    }
  }
  if (theme === 'jungle') {
    return {
      caption: 'Colour the jungle canopy and the hidden bird.',
      ops: [
        { t: 'circle', cx: 90, cy: 80, r: 50 },
        { t: 'circle', cx: 160, cy: 70, r: 40 },
        { t: 'rect', x: 84, y: 120, w: 12, h: 80 },
        { t: 'circle', cx: 360, cy: 90, r: 55 },
        { t: 'circle', cx: 420, cy: 70, r: 36 },
        { t: 'rect', x: 354, y: 130, w: 12, h: 90 },
        { t: 'ellipse', cx: 250, cy: 240, rx: 50, ry: 28 },
        { t: 'circle', cx: 300, cy: 220, r: 16 },
        { t: 'polyline', pts: [[316, 220], [340, 210], [336, 230]] },
        { t: 'circle', cx: 306, cy: 216, r: 2 },
        { t: 'polyline', pts: [[40, 380], [90, 260], [140, 380]] },
        { t: 'polyline', pts: [[300, 380], [360, 240], [410, 380]] },
        { t: 'ellipse', cx: 80, cy: 300, rx: 18, ry: 40 },
        { t: 'ellipse', cx: 430, cy: 310, rx: 16, ry: 36 },
        { t: 'circle', cx: 240, cy: 60, r: 18 },
      ],
    }
  }
  if (theme === 'space') {
    return {
      caption: 'Colour the planets. Keep the rocket white if you like.',
      ops: [
        { t: 'circle', cx: 80, cy: 70, r: 8 },
        { t: 'circle', cx: 140, cy: 40, r: 4 },
        { t: 'circle', cx: 400, cy: 50, r: 6 },
        { t: 'circle', cx: 450, cy: 110, r: 5 },
        { t: 'circle', cx: 60, cy: 200, r: 5 },
        { t: 'circle', cx: 430, cy: 220, r: 7 },
        { t: 'circle', cx: 250, cy: 160, r: 50 },
        { t: 'ellipse', cx: 250, cy: 160, rx: 80, ry: 16 },
        { t: 'circle', cx: 120, cy: 280, r: 28 },
        { t: 'circle', cx: 380, cy: 300, r: 36 },
        { t: 'circle', cx: 370, cy: 288, r: 8 },
        { t: 'polyline', pts: [[250, 240], [280, 320], [220, 320], [250, 240]] },
        { t: 'rect', x: 236, y: 320, w: 28, h: 24 },
        { t: 'polyline', pts: [[236, 344], [250, 370], [264, 344]] },
        { t: 'circle', cx: 250, cy: 280, r: 6 },
        { t: 'circle', cx: 200, cy: 50, r: 10 },
      ],
    }
  }
  return {
    caption: 'Colour the garden. Start with the big sun.',
    ops: [
      { t: 'circle', cx: 80, cy: 70, r: 36 },
      { t: 'line', x1: 80, y1: 16, x2: 80, y2: 28 },
      { t: 'line', x1: 80, y1: 112, x2: 80, y2: 124 },
      { t: 'line', x1: 26, y1: 70, x2: 38, y2: 70 },
      { t: 'line', x1: 122, y1: 70, x2: 134, y2: 70 },
      { t: 'line', x1: 40, y1: 30, x2: 50, y2: 40 },
      { t: 'line', x1: 110, y1: 100, x2: 120, y2: 110 },
      { t: 'circle', cx: 200, cy: 260, r: 22 },
      { t: 'circle', cx: 178, cy: 240, r: 18 },
      { t: 'circle', cx: 222, cy: 240, r: 18 },
      { t: 'circle', cx: 186, cy: 278, r: 18 },
      { t: 'circle', cx: 214, cy: 278, r: 18 },
      { t: 'circle', cx: 200, cy: 256, r: 10 },
      { t: 'line', x1: 200, y1: 288, x2: 200, y2: 360 },
      { t: 'circle', cx: 340, cy: 230, r: 20 },
      { t: 'circle', cx: 320, cy: 212, r: 16 },
      { t: 'circle', cx: 360, cy: 212, r: 16 },
      { t: 'circle', cx: 326, cy: 248, r: 16 },
      { t: 'circle', cx: 354, cy: 248, r: 16 },
      { t: 'circle', cx: 340, cy: 228, r: 8 },
      { t: 'line', x1: 340, y1: 256, x2: 340, y2: 340 },
      { t: 'ellipse', cx: 250, cy: 380, rx: 220, ry: 18 },
      { t: 'ellipse', cx: 120, cy: 320, rx: 16, ry: 40 },
      { t: 'ellipse', cx: 430, cy: 300, rx: 14, ry: 36 },
      { t: 'circle', cx: 280, cy: 140, r: 18 },
      { t: 'polyline', pts: [[270, 140], [240, 120], [272, 128]] },
      { t: 'polyline', pts: [[290, 140], [320, 118], [288, 128]] },
    ],
  }
}

export function generate(input: WizardInput): ColouringModel {
  const { ops, caption } = scene(input.theme)
  return {
    ...baseFields(input, 'colouring'),
    ops,
    caption,
  }
}

export function renderPreview(model: ColouringModel): ReactNode {
  const name = model.madeFor ? model.displayName : 'My Worksheet'
  return (
    <div className="flex h-full flex-col">
      <p className="mb-1 text-center font-display text-2xl tracking-wide" style={{ WebkitTextStroke: '1px #1F2A44', color: 'transparent' }}>
        {name}
      </p>
      <p className="mb-2 text-center text-[10px] uppercase tracking-wider text-ink/45">{model.caption}</p>
      <svg viewBox="0 0 500 400" className="mx-auto w-full flex-1" fill="none">
        <g dangerouslySetInnerHTML={{ __html: opsToSvg(model.ops, '#1F2A44', 1.8) }} />
      </svg>
    </div>
  )
}

export async function renderPdf(
  model: ColouringModel,
  pdfDoc: PDFDocument,
  fonts: PdfFonts,
  options: PdfOptions,
): Promise<void> {
  const page = addA4Page(pdfDoc)
  const { contentTop, margin } = drawChrome(page, fonts, model, options)
  const color = ink()
  const name = model.madeFor ? model.displayName : 'My Worksheet'
  const titleSize = 28
  const tw = fonts.display.widthOfTextAtSize(name, titleSize)
  page.drawText(name, {
    x: (595.28 - tw) / 2,
    y: contentTop - 8,
    size: titleSize,
    font: fonts.display,
    color: rgb(0.95, 0.95, 0.95),
  })
  page.drawText(name, {
    x: (595.28 - tw) / 2,
    y: contentTop - 8,
    size: titleSize,
    font: fonts.display,
    color,
    opacity: 0.15,
  })
  page.drawText(model.caption, {
    x: margin,
    y: contentTop - 28,
    size: 9,
    font: fonts.regular,
    color: muted(),
  })

  const originX = 50
  const originY = 120
  const scale = 1.05
  const yFlip = (n: number) => originY + (400 - n) * scale
  const xOf = (n: number) => originX + n * scale

  for (const op of model.ops) {
    switch (op.t) {
      case 'circle':
        page.drawCircle({
          x: xOf(op.cx),
          y: yFlip(op.cy),
          size: op.r * scale,
          borderColor: color,
          borderWidth: 1.4,
        })
        break
      case 'ellipse': {
        const rx = op.rx * scale
        const ry = op.ry * scale
        const cx = xOf(op.cx)
        const cy = yFlip(op.cy)
        page.drawSvgPath(
          `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`,
          { borderColor: color, borderWidth: 1.4 },
        )
        break
      }
      case 'line':
        page.drawLine({
          start: { x: xOf(op.x1), y: yFlip(op.y1) },
          end: { x: xOf(op.x2), y: yFlip(op.y2) },
          thickness: 1.4,
          color,
        })
        break
      case 'polyline': {
        const d = op.pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOf(p[0])} ${yFlip(p[1])}`).join(' ')
        page.drawSvgPath(d, { borderColor: color, borderWidth: 1.4 })
        break
      }
      case 'rect':
        page.drawRectangle({
          x: xOf(op.x),
          y: yFlip(op.y + op.h),
          width: op.w * scale,
          height: op.h * scale,
          borderColor: color,
          borderWidth: 1.4,
        })
        break
      case 'path':
        break
    }
  }
}
