import type { WorksheetModel } from '../types'
import { createPdf, downloadPdf, pdfFileName } from './pdf'
import { renderPdf } from './generators'

export async function downloadWorksheet(model: WorksheetModel): Promise<void> {
  const { doc, fonts } = await createPdf()
  await renderPdf(model, doc, fonts, { watermark: !model.unlocked })
  await downloadPdf(doc, pdfFileName(model))
}
