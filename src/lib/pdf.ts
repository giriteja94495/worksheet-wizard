import { PDFDocument, rgb, degrees, type PDFPage, type PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { PdfFonts, PdfOptions, ThemeId, WorksheetBase, WorksheetModel } from '../types'
import { classLabel } from './sheet'
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

export interface PageCursor {
  page: PDFPage
  y: number
  margin: number
  contentBottom: number
}

function metaBits(model: WorksheetBase): string[] {
  const bits: string[] = [classLabel(model.classLevel, model.section)]
  if (model.subject) bits.push(model.subject)
  if (model.marks) bits.push(`Max. ${model.marks}`)
  if (model.timeAllowed) bits.push(`Time ${model.timeAllowed}`)
  return bits
}

export function drawChrome(
  page: PDFPage,
  fonts: PdfFonts,
  model: WorksheetBase,
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

  let y = height - 46
  if (model.schoolName) {
    const school = model.schoolName.toUpperCase()
    const sw = fonts.bold.widthOfTextAtSize(school, 10)
    page.drawText(school, {
      x: (width - sw) / 2,
      y,
      size: 10,
      font: fonts.bold,
      color: theme.pdfAccent,
    })
    y -= 16
  }

  page.drawText(model.title, {
    x: margin,
    y,
    size: 16,
    font: fonts.display,
    color: INK,
  })
  y -= 16

  const bits = metaBits(model)
  page.drawText(bits.join('   ·   '), {
    x: margin,
    y,
    size: 8,
    font: fonts.regular,
    color: MUTED,
  })
  y -= 14

  const nameLabel = model.displayName && model.displayName !== 'My Worksheet' ? model.displayName : ''
  page.drawText('Name', { x: margin, y, size: 8, font: fonts.regular, color: MUTED })
  if (nameLabel) {
    page.drawText(nameLabel, { x: margin + 32, y, size: 10, font: fonts.bold, color: INK })
  } else {
    page.drawLine({
      start: { x: margin + 32, y: y - 1 },
      end: { x: margin + 250, y: y - 1 },
      thickness: 0.5,
      color: MUTED,
    })
  }
  page.drawText('Date', { x: 360, y, size: 8, font: fonts.regular, color: MUTED })
  page.drawLine({
    start: { x: 386, y: y - 1 },
    end: { x: width - margin, y: y - 1 },
    thickness: 0.5,
    color: MUTED,
  })
  y -= 12

  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.4,
    color: rgb(0.78, 0.8, 0.84),
  })
  y -= 12

  if (model.instructions) {
    page.drawText('Note', {
      x: margin,
      y,
      size: 8,
      font: fonts.bold,
      color: MUTED,
    })
    y = drawWrapped(page, model.instructions, {
      x: margin + 28,
      y,
      size: 8,
      font: fonts.regular,
      color: MUTED,
      maxWidth: width - margin * 2 - 28,
      lineHeight: 11,
    })
    y -= 4
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

  return { contentTop: y, contentBottom: 52, margin }
}

export function startPage(
  doc: import('pdf-lib').PDFDocument,
  fonts: PdfFonts,
  model: WorksheetBase,
  options: PdfOptions,
): PageCursor {
  const page = addA4Page(doc)
  const box = drawChrome(page, fonts, model, options)
  return { page, y: box.contentTop, margin: box.margin, contentBottom: box.contentBottom }
}

export function ensureSpace(
  cursor: PageCursor,
  needed: number,
  doc: import('pdf-lib').PDFDocument,
  fonts: PdfFonts,
  model: WorksheetBase,
  options: PdfOptions,
): PageCursor {
  if (cursor.y - needed >= cursor.contentBottom) return cursor
  return startPage(doc, fonts, model, options)
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

export function pdfFileName(model: WorksheetModel, suffix = ''): string {
  const who = slugName(model.displayName === 'My Worksheet' ? '' : model.displayName, true)
  const extra = suffix ? `-${suffix}` : ''
  return `${who}-Class${model.classLevel}-${fileLabel(model.kind)}${extra}.pdf`
}

export function themeOf(id: ThemeId) {
  return THEME_TOKENS[id]
}

export { rgb, degrees }
