import type { ReactNode } from 'react'
import type { PDFDocument } from 'pdf-lib'
import type { PdfFonts, PdfOptions, WizardInput, WorksheetModel, WorksheetType } from '../../types'
import * as maths from './maths'
import * as handwriting from './handwriting'
import * as spelling from './spelling'
import * as wordsearch from './wordsearch'
import * as matching from './matching'
import * as oddoneout from './oddoneout'
import * as colouring from './colouring'
import * as rewardchart from './rewardchart'

interface Generator {
  generate: (input: WizardInput) => WorksheetModel
  renderPreview: (model: WorksheetModel) => ReactNode
  renderPdf: (
    model: WorksheetModel,
    pdfDoc: PDFDocument,
    fonts: PdfFonts,
    options: PdfOptions,
  ) => Promise<void>
}

function wrap<T extends WorksheetModel>(g: {
  generate: (input: WizardInput) => T
  renderPreview: (model: T) => ReactNode
  renderPdf: (model: T, pdfDoc: PDFDocument, fonts: PdfFonts, options: PdfOptions) => Promise<void>
}): Generator {
  return {
    generate: g.generate,
    renderPreview: (model) => g.renderPreview(model as T),
    renderPdf: (model, doc, fonts, options) => g.renderPdf(model as T, doc, fonts, options),
  }
}

const REGISTRY: Record<WorksheetType, Generator> = {
  maths: wrap(maths),
  handwriting: wrap(handwriting),
  spelling: wrap(spelling),
  wordsearch: wrap(wordsearch),
  matching: wrap(matching),
  oddoneout: wrap(oddoneout),
  colouring: wrap(colouring),
  rewardchart: wrap(rewardchart),
}

export function generateWorksheet(input: WizardInput): WorksheetModel {
  return REGISTRY[input.type].generate(input)
}

export function renderPreview(model: WorksheetModel): ReactNode {
  return REGISTRY[model.kind].renderPreview(model)
}

export function renderPdf(
  model: WorksheetModel,
  pdfDoc: PDFDocument,
  fonts: PdfFonts,
  options: PdfOptions,
): Promise<void> {
  return REGISTRY[model.kind].renderPdf(model, pdfDoc, fonts, options)
}
