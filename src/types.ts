export type WorksheetType =
  | 'maths'
  | 'handwriting'
  | 'spelling'
  | 'wordsearch'
  | 'matching'
  | 'oddoneout'
  | 'colouring'
  | 'rewardchart'

export type Difficulty = 'easy' | 'medium' | 'hard'
export type ThemeId = 'sunshine' | 'ocean' | 'jungle' | 'space'
export type MathsOp = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed'
export type HandwritingMode = 'name' | 'alphabet' | 'words'
export type WordTheme = 'animals' | 'food' | 'school' | 'home' | 'nature'
export type MatchingTopic = 'pictures' | 'numbers' | 'rhymes'

export interface WizardInput {
  type: WorksheetType
  childName: string
  age: number
  difficulty: Difficulty
  topic: string
  title: string
  theme: ThemeId
  unlocked: boolean
  seed: number
}

export interface WorksheetBase {
  kind: WorksheetType
  seed: number
  title: string
  displayName: string
  madeFor: string | null
  theme: ThemeId
  unlocked: boolean
  age: number
  difficulty: Difficulty
  topic: string
}

export interface MathsProblem {
  a: number
  b: number
  op: '+' | '−' | '×' | '÷'
  answer: number
  layout: 'horizontal' | 'vertical'
}

export interface MathsModel extends WorksheetBase {
  kind: 'maths'
  problems: MathsProblem[]
}

export interface HandwritingLine {
  prompt: string
  trace: string
  copies: number
}

export interface HandwritingModel extends WorksheetBase {
  kind: 'handwriting'
  mode: HandwritingMode
  lines: HandwritingLine[]
}

export interface SpellingModel extends WorksheetBase {
  kind: 'spelling'
  words: string[]
  missing: { word: string; masked: string }[]
  scrambles: { word: string; scrambled: string }[]
}

export interface WordSearchModel extends WorksheetBase {
  kind: 'wordsearch'
  size: number
  grid: string[][]
  words: string[]
}

export interface MatchPair {
  left: string
  right: string
  icon: PictogramId
}

export interface MatchingModel extends WorksheetBase {
  kind: 'matching'
  pairs: MatchPair[]
  shuffledRight: { label: string; index: number }[]
}

export interface OddRow {
  items: string[]
  oddIndex: number
  hint: string
}

export interface OddOneOutModel extends WorksheetBase {
  kind: 'oddoneout'
  rows: OddRow[]
}

export type PictogramId =
  | 'sun'
  | 'flower'
  | 'fish'
  | 'star'
  | 'leaf'
  | 'rocket'
  | 'planet'
  | 'tree'
  | 'apple'
  | 'house'
  | 'cat'
  | 'bird'
  | 'heart'
  | 'moon'
  | 'boat'
  | 'ball'

export type DrawOp =
  | { t: 'circle'; cx: number; cy: number; r: number }
  | { t: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { t: 'polyline'; pts: [number, number][] }
  | { t: 'rect'; x: number; y: number; w: number; h: number; rx?: number }
  | { t: 'path'; d: string }

export interface ColouringModel extends WorksheetBase {
  kind: 'colouring'
  ops: DrawOp[]
  caption: string
}

export interface RewardChartModel extends WorksheetBase {
  kind: 'rewardchart'
  habits: string[]
  days: string[]
}

export type WorksheetModel =
  | MathsModel
  | HandwritingModel
  | SpellingModel
  | WordSearchModel
  | MatchingModel
  | OddOneOutModel
  | ColouringModel
  | RewardChartModel

export interface PdfFonts {
  regular: import('pdf-lib').PDFFont
  bold: import('pdf-lib').PDFFont
  display: import('pdf-lib').PDFFont
  hand: import('pdf-lib').PDFFont
}

export interface PdfOptions {
  watermark: boolean
}

export type PaywallReason = 'download' | 'theme' | 'name' | 'preview'
