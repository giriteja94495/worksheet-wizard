import type { WorksheetModel } from '../types'
import { createPdf, downloadPdf, pdfFileName } from './pdf'
import { renderPdf } from './generators'
import { namedCopy } from './sheet'

export async function downloadWorksheet(model: WorksheetModel): Promise<void> {
  const { doc, fonts } = await createPdf()
  await renderPdf(model, doc, fonts, { watermark: !model.unlocked })
  await downloadPdf(doc, pdfFileName(model))
}

export async function downloadClassSet(model: WorksheetModel, names: string[]): Promise<void> {
  const { doc, fonts } = await createPdf()
  const list = names.length ? names : [model.displayName]
  for (const name of list) {
    const copy = namedCopy(model, name)
    await renderPdf(copy, doc, fonts, { watermark: !model.unlocked })
  }
  await downloadPdf(doc, pdfFileName(model, `class-set-${list.length}`))
}
