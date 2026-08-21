import type { PDFPage } from 'pdf-lib'
import { rgb } from 'pdf-lib'
import type { DrawOp, PictogramId } from '../types'

const INK = rgb(0.122, 0.165, 0.267)

export const PICTOGRAMS: Record<PictogramId, { label: string; ops: DrawOp[] }> = {
  sun: {
    label: 'sun',
    ops: [
      { t: 'circle', cx: 16, cy: 16, r: 7 },
      { t: 'line', x1: 16, y1: 2, x2: 16, y2: 6 },
      { t: 'line', x1: 16, y1: 26, x2: 16, y2: 30 },
      { t: 'line', x1: 2, y1: 16, x2: 6, y2: 16 },
      { t: 'line', x1: 26, y1: 16, x2: 30, y2: 16 },
      { t: 'line', x1: 6, y1: 6, x2: 9, y2: 9 },
      { t: 'line', x1: 23, y1: 23, x2: 26, y2: 26 },
      { t: 'line', x1: 26, y1: 6, x2: 23, y2: 9 },
      { t: 'line', x1: 9, y1: 23, x2: 6, y2: 26 },
    ],
  },
  flower: {
    label: 'flower',
    ops: [
      { t: 'circle', cx: 16, cy: 10, r: 4 },
      { t: 'circle', cx: 10, cy: 14, r: 4 },
      { t: 'circle', cx: 22, cy: 14, r: 4 },
      { t: 'circle', cx: 12, cy: 20, r: 4 },
      { t: 'circle', cx: 20, cy: 20, r: 4 },
      { t: 'circle', cx: 16, cy: 16, r: 3 },
      { t: 'line', x1: 16, y1: 24, x2: 16, y2: 30 },
    ],
  },
  fish: {
    label: 'fish',
    ops: [
      { t: 'ellipse', cx: 14, cy: 16, rx: 10, ry: 6 },
      { t: 'polyline', pts: [[24, 16], [30, 10], [30, 22], [24, 16]] },
      { t: 'circle', cx: 9, cy: 15, r: 1.2 },
    ],
  },
  star: {
    label: 'star',
    ops: [
      {
        t: 'polyline',
        pts: [
          [16, 3],
          [19, 12],
          [29, 12],
          [21, 18],
          [24, 28],
          [16, 22],
          [8, 28],
          [11, 18],
          [3, 12],
          [13, 12],
          [16, 3],
        ],
      },
    ],
  },
  leaf: {
    label: 'leaf',
    ops: [
      { t: 'ellipse', cx: 16, cy: 16, rx: 8, ry: 13 },
      { t: 'line', x1: 16, y1: 4, x2: 16, y2: 28 },
    ],
  },
  rocket: {
    label: 'rocket',
    ops: [
      { t: 'polyline', pts: [[16, 2], [24, 18], [8, 18], [16, 2]] },
      { t: 'rect', x: 10, y: 18, w: 12, h: 8 },
      { t: 'polyline', pts: [[10, 26], [16, 32], [22, 26]] },
      { t: 'circle', cx: 16, cy: 12, r: 2 },
    ],
  },
  planet: {
    label: 'planet',
    ops: [
      { t: 'circle', cx: 16, cy: 16, r: 8 },
      { t: 'ellipse', cx: 16, cy: 16, rx: 14, ry: 4 },
    ],
  },
  tree: {
    label: 'tree',
    ops: [
      { t: 'circle', cx: 16, cy: 12, r: 9 },
      { t: 'rect', x: 14, y: 20, w: 4, h: 10 },
    ],
  },
  apple: {
    label: 'apple',
    ops: [
      { t: 'circle', cx: 16, cy: 18, r: 8 },
      { t: 'line', x1: 16, y1: 10, x2: 18, y2: 4 },
      { t: 'ellipse', cx: 20, cy: 8, rx: 4, ry: 2 },
    ],
  },
  house: {
    label: 'house',
    ops: [
      { t: 'rect', x: 8, y: 16, w: 16, h: 14 },
      { t: 'polyline', pts: [[6, 16], [16, 6], [26, 16]] },
      { t: 'rect', x: 14, y: 22, w: 4, h: 8 },
    ],
  },
  cat: {
    label: 'cat',
    ops: [
      { t: 'circle', cx: 16, cy: 18, r: 8 },
      { t: 'polyline', pts: [[10, 12], [8, 4], [13, 10]] },
      { t: 'polyline', pts: [[22, 12], [24, 4], [19, 10]] },
      { t: 'circle', cx: 13, cy: 17, r: 1 },
      { t: 'circle', cx: 19, cy: 17, r: 1 },
    ],
  },
  bird: {
    label: 'bird',
    ops: [
      { t: 'ellipse', cx: 16, cy: 18, rx: 9, ry: 6 },
      { t: 'circle', cx: 24, cy: 14, r: 4 },
      { t: 'polyline', pts: [[28, 14], [32, 16], [28, 16]] },
      { t: 'circle', cx: 25, cy: 13, r: 0.8 },
    ],
  },
  heart: {
    label: 'heart',
    ops: [
      { t: 'path', d: 'M16 28 C16 28 6 20 6 13 C6 9 9 6 13 6 C15 6 16 8 16 8 C16 8 17 6 19 6 C23 6 26 9 26 13 C26 20 16 28 16 28' },
    ],
  },
  moon: {
    label: 'moon',
    ops: [
      { t: 'circle', cx: 16, cy: 16, r: 10 },
      { t: 'circle', cx: 20, cy: 14, r: 8 },
    ],
  },
  boat: {
    label: 'boat',
    ops: [
      { t: 'polyline', pts: [[4, 20], [28, 20], [24, 26], [8, 26], [4, 20]] },
      { t: 'line', x1: 16, y1: 20, x2: 16, y2: 6 },
      { t: 'polyline', pts: [[16, 6], [24, 16], [16, 16]] },
    ],
  },
  ball: {
    label: 'ball',
    ops: [
      { t: 'circle', cx: 16, cy: 16, r: 11 },
      { t: 'ellipse', cx: 16, cy: 16, rx: 5, ry: 11 },
      { t: 'line', x1: 5, y1: 16, x2: 27, y2: 16 },
    ],
  },
}

export function opsToSvg(ops: DrawOp[], stroke = '#1F2A44', width = 1.6): string {
  return ops
    .map((op) => {
      switch (op.t) {
        case 'circle':
          return `<circle cx="${op.cx}" cy="${op.cy}" r="${op.r}" fill="none" stroke="${stroke}" stroke-width="${width}"/>`
        case 'ellipse':
          return `<ellipse cx="${op.cx}" cy="${op.cy}" rx="${op.rx}" ry="${op.ry}" fill="none" stroke="${stroke}" stroke-width="${width}"/>`
        case 'line':
          return `<line x1="${op.x1}" y1="${op.y1}" x2="${op.x2}" y2="${op.y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`
        case 'polyline':
          return `<polyline points="${op.pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`
        case 'rect':
          return `<rect x="${op.x}" y="${op.y}" width="${op.w}" height="${op.h}" rx="${op.rx ?? 0}" fill="none" stroke="${stroke}" stroke-width="${width}"/>`
        case 'path':
          return `<path d="${op.d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`
      }
    })
    .join('')
}

export function drawOpsOnPage(
  page: PDFPage,
  ops: DrawOp[],
  originX: number,
  originY: number,
  scale: number,
  strokeWidth = 1.2,
): void {
  const x = (n: number) => originX + n * scale
  const y = (n: number) => originY + n * scale
  const color = INK
  for (const op of ops) {
    switch (op.t) {
      case 'circle':
        page.drawCircle({
          x: x(op.cx),
          y: y(32 - op.cy),
          size: op.r * scale,
          borderColor: color,
          borderWidth: strokeWidth,
        })
        break
      case 'ellipse': {
        const d = ellipsePath(x(op.cx), y(32 - op.cy), op.rx * scale, op.ry * scale)
        page.drawSvgPath(d, { borderColor: color, borderWidth: strokeWidth })
        break
      }
      case 'line':
        page.drawLine({
          start: { x: x(op.x1), y: y(32 - op.y1) },
          end: { x: x(op.x2), y: y(32 - op.y2) },
          thickness: strokeWidth,
          color,
        })
        break
      case 'polyline': {
        const d =
          op.pts
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p[0])} ${y(32 - p[1])}`)
            .join(' ') + ' Z'
        page.drawSvgPath(d, { borderColor: color, borderWidth: strokeWidth })
        break
      }
      case 'rect':
        page.drawRectangle({
          x: x(op.x),
          y: y(32 - op.y - op.h),
          width: op.w * scale,
          height: op.h * scale,
          borderColor: color,
          borderWidth: strokeWidth,
        })
        break
      case 'path':
        page.drawSvgPath(scalePath(op.d, originX, originY, scale), {
          borderColor: color,
          borderWidth: strokeWidth,
        })
        break
    }
  }
}

function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`
}

function scalePath(d: string, ox: number, oy: number, scale: number): string {
  return d.replace(/[-+]?\d*\.?\d+/g, (n, offset) => {
    const prev = d.slice(Math.max(0, offset - 8), offset)
    const isX = !/[\d.]+\s+$/.test(prev)
    const v = Number(n)
    if (Number.isNaN(v)) return n
    return String(isX ? ox + v * scale : oy + (32 - v) * scale)
  })
}
