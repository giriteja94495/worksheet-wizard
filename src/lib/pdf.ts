import { PDFDocument, rgb, degrees, type PDFPage, type PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { PdfFonts, PdfOptions, ThemeId, WorksheetModel } from '../types'
import { THEME_TOKENS } from './themes'
import { fileLabel, slugName } from './catalog'
import nunitoRegularUrl from '../assets/fonts/Nunito-Regular.ttf?url'
import nunitoBoldUrl from '../assets/fonts/Nunito-Bold.ttf?url'
import frauncesUrl from '../assets/fonts/Fraunces-SemiBold.ttf?url'
import patrickUrl from '../assets/fonts/PatrickHand-Regular.ttf?url'

export const A4 = { width: 595.28, height: 841.89 }

const INK = rgb(0.122, 0.165, 0.267)
const MUTED = rgb(0.35, 0.4, 0.5)

let cachedBytes: { regular: ArrayBuffer; bold: ArrayBuffer; display: ArrayBuffer; hand: ArrayBuffer } | null =
  null

async function fontBytes() {
  if (cachedBytes) return cachedBytes
  const [regular, bold, display, hand] = await Promise.all([
    fetch(nunitoRegularUrl).then((r) => r.arrayBuffer()),
    fetch(nunitoBoldUrl).then((r) => r.arrayBuffer()),
    fetch(frauncesUrl).then((r) => r.arrayBuffer()),
    fetch(patrickUrl).then((r) => r.arrayBuffer()),
  ])
  cachedBytes = { regular, bold, display, hand }
  return cachedBytes
}

export async function createPdf(): Promise<{ doc: PDFDocument; fonts: PdfFonts }> {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit as never)
  const bytes = await fontBytes()
  const fonts: PdfFonts = {
    regular: await doc.embedFont(bytes.regular.slice(0)),
    bold: await doc.embedFont(bytes.bold.slice(0)),
    display: await doc.embedFont(bytes.display.slice(0)),
    hand: await doc.embedFont(bytes.hand.slice(0)),
  }
  return { doc, fonts }
}

export function addA4Page(doc: PDFDocument): PDFPage {
  return doc.addPage([A4.width, A4.height])
}

export function drawChrome(
  page: PDFPage,
  fonts: PdfFonts,
  model: Pick<WorksheetModel, 'title' | 'madeFor' | 'theme' | 'unlocked'>,
  options: PdfOptions,
): { contentTop: number; contentBottom: number; margin: number } {
  const { width, height } = A4
  const theme = THEME_TOKENS[model.theme]
  const margin = 28

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 0.992, 0.973),
  })

  page.drawRectangle({
    x: 16,
    y: 16,
    width: width - 32,
    height: height - 32,
    borderColor: theme.pdfBorder,
    borderWidth: 3,
  })
  page.drawRectangle({
    x: 22,
    y: 22,
    width: width - 44,
    height: height - 44,
    borderColor: theme.pdfAccent,
    borderWidth: 0.8,
  })

  page.drawText(model.title, {
    x: margin,
    y: height - 52,
    size: 18,
    font: fonts.display,
    color: INK,
  })

  if (model.madeFor) {
    page.drawText(model.madeFor, {
      x: margin,
      y: height - 70,
      size: 10,
      font: fonts.regular,
      color: theme.pdfAccent,
    })
  } else {
    page.drawText('My Worksheet', {
      x: margin,
      y: height - 70,
      size: 10,
      font: fonts.regular,
      color: MUTED,
    })
  }

  const footer = 'Worksheet Wizard  ·  worksheetwizard.app'
  const fw = fonts.regular.widthOfTextAtSize(footer, 8)
  page.drawText(footer, {
    x: (width - fw) / 2,
    y: 32,
    size: 8,
    font: fonts.regular,
    color: MUTED,
  })

  if (options.watermark) {
    page.drawText('Worksheet Wizard — Free', {
      x: 90,
      y: 280,
      size: 28,
      font: fonts.display,
      color: rgb(0.72, 0.74, 0.78),
      rotate: degrees(38),
      opacity: 0.28,
    })
  }

  return { contentTop: height - 88, contentBottom: 52, margin }
}

export function drawWrapped(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; size: number; font: PDFFont; color?: ReturnType<typeof rgb>; maxWidth: number; lineHeight?: number },
): number {
  const words = text.split(/\s+/)
  const lh = opts.lineHeight ?? opts.size * 1.35
  let line = ''
  let y = opts.y
  const color = opts.color ?? INK
  const flush = (s: string) => {
    if (!s) return
    page.drawText(s, { x: opts.x, y, size: opts.size, font: opts.font, color })
    y -= lh
  }
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (opts.font.widthOfTextAtSize(next, opts.size) > opts.maxWidth) {
      flush(line)
      line = w
    } else {
      line = next
    }
  }
  flush(line)
  return y
}

export function ink(): ReturnType<typeof rgb> {
  return INK
}

export function muted(): ReturnType<typeof rgb> {
  return MUTED
}

export async function downloadPdf(doc: PDFDocument, filename: string): Promise<void> {
  const bytes = await doc.save()
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  const blob = new Blob([copy], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function pdfFileName(model: WorksheetModel): string {
  return `${slugName(model.displayName === 'My Worksheet' ? '' : model.displayName, true)}-${fileLabel(model.kind)}.pdf`
}

export function themeOf(id: ThemeId) {
  return THEME_TOKENS[id]
}

export { rgb, degrees }
