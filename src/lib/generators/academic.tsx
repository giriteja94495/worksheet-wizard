import type { ReactNode } from 'react'
import type { PDFDocument } from 'pdf-lib'
import type {
  AcademicQuestion,
  MatchPair,
  PdfFonts,
  PdfOptions,
  PictogramId,
  PracticeModel,
  WizardInput,
} from '../../types'
import { mulberry32, sample, shuffle } from '../rng'
import { parseQuestionBank, hasAnswers } from '../parseQuestions'
import {
  parsePairLines,
  parseWordList,
  baseFields,
  effectiveCount,
  defaultQuestionCount,
  classBand,
} from '../sheet'
import { addA4Page, drawChrome, drawWrapped, ensureSpace, ink, muted, startPage } from '../pdf'

function emptyPairs(): Pick<PracticeModel, 'pairs' | 'shuffledRight' | 'words'> {
  return { pairs: [], shuffledRight: [], words: [] }
}

function extrasFromInput(input: WizardInput, rng: () => number): Pick<PracticeModel, 'pairs' | 'shuffledRight' | 'words'> {
  const words = parseWordList(input.customWords)
  const rawPairs = parsePairLines(input.customPairs).slice(0, 10)
  const pairs: MatchPair[] = rawPairs.map((p) => ({ ...p, icon: 'star' as PictogramId }))
  const shuffledRight = shuffle(
    rng,
    pairs.map((p, index) => ({ label: p.right, index })),
  )
  return { pairs, shuffledRight, words }
}

export function renderPreview(model: PracticeModel): ReactNode {
  return (
    <div className="space-y-2.5 text-[10px] leading-snug">
      {model.questions.map((q, i) => (
        <div key={i} className="break-inside-avoid">
          <p>
            <span className="mr-1 font-bold text-ink/45">{i + 1}.</span>
            {q.prompt}
          </p>
          {q.kind === 'mcq' && q.options ? (
            <div className="mt-0.5 grid grid-cols-2 gap-x-2 pl-4 text-[9px]">
              {q.options.map((opt, j) => (
                <span key={j}>
                  ({String.fromCharCode(97 + j)}) {opt}
                </span>
              ))}
            </div>
          ) : q.kind === 'fill' ? (
            <div className="mt-1 h-3 border-b border-dotted border-ink/30" />
          ) : (
            <div className="mt-1 space-y-1 pl-4">
              <div className="h-2.5 border-b border-ink/20" />
              {q.kind === 'short' ? <div className="h-2.5 border-b border-ink/20" /> : null}
            </div>
          )}
        </div>
      ))}
      {model.pairs.length > 0 ? (
        <section>
          <p className="mb-1 font-display text-[12px]">Match the following</p>
          <div className="grid grid-cols-2 gap-1">
            {model.pairs.map((p, i) => (
              <div key={i} className="contents">
                <span>
                  {i + 1}. {p.left}
                </span>
                <span>
                  {String.fromCharCode(65 + i)}. {model.shuffledRight[i]?.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {model.words.length > 0 ? (
        <section>
          <p className="mb-1 font-display text-[12px]">Key terms — write each word once</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 font-semibold uppercase tracking-wide">
            {model.words.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function questionHeight(q: AcademicQuestion): number {
  if (q.kind === 'mcq') return 42
  if (q.kind === 'fill') return 28
  if (q.kind === 'num') return 32
  return 44
}

export async function renderPdf(
  model: PracticeModel,
  pdfDoc: PDFDocument,
  fonts: PdfFonts,
  options: PdfOptions,
): Promise<void> {
  let cursor = startPage(pdfDoc, fonts, model, options)
  const color = ink()
  const width = 595.28 - cursor.margin * 2

  model.questions.forEach((q, i) => {
    cursor = ensureSpace(cursor, questionHeight(q), pdfDoc, fonts, model, options)
    const { page, margin } = cursor
    page.drawText(`${i + 1}.`, { x: margin, y: cursor.y, size: 10, font: fonts.bold, color: muted() })
    cursor.y = drawWrapped(page, q.prompt, {
      x: margin + 18,
      y: cursor.y,
      size: 10,
      font: fonts.regular,
      color,
      maxWidth: width - 18,
      lineHeight: 13,
    })
    if (q.kind === 'mcq' && q.options) {
      cursor.y -= 2
      q.options.forEach((opt, j) => {
        const col = j % 2
        const row = Math.floor(j / 2)
        const x = margin + 18 + col * (width / 2)
        const yy = cursor.y - row * 12
        page.drawText(`(${String.fromCharCode(97 + j)})  ${opt}`, {
          x,
          y: yy,
          size: 9,
          font: fonts.regular,
          color,
        })
      })
      cursor.y -= Math.ceil(q.options.length / 2) * 12 + 8
    } else if (q.kind === 'fill') {
      page.drawLine({
        start: { x: margin + 18, y: cursor.y - 2 },
        end: { x: margin + width, y: cursor.y - 2 },
        thickness: 0.5,
        color: muted(),
      })
      cursor.y -= 16
    } else {
      const lines = q.kind === 'short' ? 2 : 1
      for (let n = 0; n < lines; n++) {
        cursor.y -= 14
        page.drawLine({
          start: { x: margin + 18, y: cursor.y },
          end: { x: margin + width, y: cursor.y },
          thickness: 0.45,
          color: muted(),
        })
      }
      cursor.y -= 10
    }
  })

  if (model.pairs.length > 0) {
    cursor = ensureSpace(cursor, 28 + model.pairs.length * 16, pdfDoc, fonts, model, options)
    cursor.page.drawText('Match the following', {
      x: cursor.margin,
      y: cursor.y,
      size: 12,
      font: fonts.display,
      color,
    })
    cursor.y -= 16
    model.pairs.forEach((p, i) => {
      cursor.page.drawText(`${i + 1}.  ${p.left}`, {
        x: cursor.margin,
        y: cursor.y,
        size: 10,
        font: fonts.regular,
        color,
      })
      const right = model.shuffledRight[i]
      if (right) {
        cursor.page.drawText(`${String.fromCharCode(65 + i)}.  ${right.label}`, {
          x: cursor.margin + 260,
          y: cursor.y,
          size: 10,
          font: fonts.regular,
          color,
        })
      }
      cursor.y -= 14
    })
    cursor.y -= 8
  }

  if (model.words.length > 0) {
    cursor = ensureSpace(cursor, 40, pdfDoc, fonts, model, options)
    cursor.page.drawText('Key terms — write each word once', {
      x: cursor.margin,
      y: cursor.y,
      size: 12,
      font: fonts.display,
      color,
    })
    cursor.y -= 16
    model.words.forEach((w, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      cursor.page.drawText(w, {
        x: cursor.margin + col * 170,
        y: cursor.y - row * 14,
        size: 10,
        font: fonts.regular,
        color,
      })
    })
  }

  if (model.includeAnswerKey && hasAnswers(model.questions)) {
    const key = addA4Page(pdfDoc)
    const box = drawChrome(key, fonts, { ...model, title: 'Answer key' }, options)
    let ky = box.contentTop
    key.drawText('Keep this page for checking.', {
      x: box.margin,
      y: ky,
      size: 9,
      font: fonts.regular,
      color: muted(),
    })
    ky -= 18
    model.questions.forEach((q, i) => {
      const line = q.answer ? `${i + 1}.  ${q.answer}` : `${i + 1}.  —`
      if (ky < box.contentBottom + 14) return
      key.drawText(line, { x: box.margin, y: ky, size: 10, font: fonts.regular, color })
      ky -= 14
    })
    model.pairs.forEach((p, i) => {
      if (ky < box.contentBottom + 14) return
      key.drawText(`Match ${i + 1}: ${p.left} → ${p.right}`, {
        x: box.margin,
        y: ky,
        size: 10,
        font: fonts.regular,
        color,
      })
      ky -= 14
    })
  }
}

function take(rng: () => number, bank: AcademicQuestion[], n: number): AcademicQuestion[] {
  return sample(rng, bank, Math.min(n, bank.length))
}

const GK: AcademicQuestion[] = [
  { kind: 'short', prompt: 'Name the capital of India.', answer: 'New Delhi' },
  { kind: 'mcq', prompt: 'How many states does India have?', options: ['28', '29', '27', '26'], answer: '28' },
  { kind: 'fill', prompt: 'The national animal of India is the ____.', answer: 'tiger' },
  { kind: 'short', prompt: 'Name the largest ocean on Earth.', answer: 'Pacific Ocean' },
  { kind: 'mcq', prompt: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], answer: 'Mars' },
  { kind: 'fill', prompt: 'The currency of India is the ____.', answer: 'rupee' },
  { kind: 'short', prompt: 'Name one neighbouring country of India.', answer: 'Nepal / Pakistan / Bangladesh / Bhutan / China / Myanmar / Sri Lanka' },
  { kind: 'mcq', prompt: 'The Ganga flows into the', options: ['Arabian Sea', 'Bay of Bengal', 'Indian Ocean', 'Red Sea'], answer: 'Bay of Bengal' },
]

function quizBank(input: WizardInput): AcademicQuestion[] {
  const band = classBand(input.classLevel)
  const topic = input.topic
  if (topic === 'gk') return GK
  if (topic === 'english') return grammarBank(input)
  if (topic === 'evs' || topic === 'science') return scienceBank(input)
  if (topic === 'maths') {
    if (band === 'early') {
      return [
        { kind: 'num', prompt: '7 + 5 =', answer: '12' },
        { kind: 'num', prompt: '9 − 4 =', answer: '5' },
        { kind: 'short', prompt: 'Write the number that comes after 19.', answer: '20' },
        { kind: 'mcq', prompt: 'Which is greater?', options: ['8', '5', '3', '2'], answer: '8' },
        { kind: 'fill', prompt: '2 + 2 + 2 = ____.', answer: '6' },
        { kind: 'num', prompt: '10 − 1 =', answer: '9' },
        { kind: 'short', prompt: 'How many tens are there in 40?', answer: '4' },
      ]
    }
    if (band === 'primary') {
      return [
        { kind: 'num', prompt: '12 × 8 =', answer: '96' },
        { kind: 'num', prompt: '56 ÷ 7 =', answer: '8' },
        { kind: 'fill', prompt: '1/2 of 18 is ____.', answer: '9' },
        { kind: 'short', prompt: 'A notebook costs ₹25. What is the cost of 4 notebooks?', answer: '₹100' },
        { kind: 'mcq', prompt: 'How many centimetres make 1 metre?', options: ['10', '100', '1000', '50'], answer: '100' },
        { kind: 'num', prompt: '345 + 129 =', answer: '474' },
        { kind: 'short', prompt: 'Write 3/6 in lowest terms.', answer: '1/2' },
      ]
    }
    if (band === 'middle') {
      return [
        { kind: 'num', prompt: '−4 + 9 =', answer: '5' },
        { kind: 'num', prompt: '12.5 + 3.75 =', answer: '16.25' },
        { kind: 'fill', prompt: '20% of 150 is ____.', answer: '30' },
        { kind: 'num', prompt: 'If 2x + 3 = 11, then x =', answer: '4' },
        { kind: 'short', prompt: 'Find the perimeter of a square of side 8 cm.', answer: '32 cm' },
        { kind: 'mcq', prompt: 'The additive inverse of −7 is', options: ['−7', '0', '7', '1/7'], answer: '7' },
        { kind: 'short', prompt: 'Convert 0.25 into a percentage.', answer: '25%' },
      ]
    }
    return [
      { kind: 'num', prompt: 'Solve: 3x − 7 = 14', answer: 'x = 7' },
      { kind: 'short', prompt: 'Write the degree of the polynomial 4x³ − x + 2.', answer: '3' },
      { kind: 'fill', prompt: 'sin 30° = ____.', answer: '1/2' },
      { kind: 'short', prompt: 'Find the mean of 4, 6, 8, 10, 12.', answer: '8' },
      { kind: 'mcq', prompt: 'The graph of a linear equation in two variables is a', options: ['circle', 'straight line', 'parabola', 'point'], answer: 'straight line' },
      { kind: 'num', prompt: 'Volume of a cube of side 5 cm =', answer: '125 cm³' },
      { kind: 'short', prompt: 'If x² − 5x + 6 = 0, write one root.', answer: '2 or 3' },
    ]
  }
  return [
    ...GK,
    { kind: 'short', prompt: 'Name two indoor games.', answer: 'Accept reasonable answers' },
    { kind: 'short', prompt: 'Why should we drink clean water?', answer: 'To stay healthy / avoid disease' },
  ]
}

function grammarBank(input: WizardInput): AcademicQuestion[] {
  const topic = input.topic
  const band = classBand(input.classLevel)
  if (band === 'early' || topic === 'nouns' || topic === 'verbs' || topic === 'articles' || topic === 'capitals') {
    return [
      { kind: 'short', prompt: 'Circle the naming word: The cat sat on the mat. Write it.', answer: 'cat / mat' },
      { kind: 'fill', prompt: 'Ravi ____ (run) to school every day. (use a verb)', answer: 'runs' },
      { kind: 'mcq', prompt: 'Choose the correct article: I saw ____ elephant.', options: ['a', 'an', 'the', 'no article'], answer: 'an' },
      { kind: 'short', prompt: 'Rewrite with a capital letter: delhi is a big city.', answer: 'Delhi is a big city.' },
      { kind: 'fill', prompt: 'A ____ is a naming word.', answer: 'noun' },
      { kind: 'mcq', prompt: 'Which word is a doing word?', options: ['blue', 'jump', 'soft', 'tall'], answer: 'jump' },
      { kind: 'short', prompt: 'Write one word for a person, a place, and a thing.', answer: 'e.g. teacher, school, book' },
      { kind: 'fill', prompt: 'We use ____ before words that start with a vowel sound.', answer: 'an' },
    ]
  }
  if (band === 'primary' || topic === 'adjectives' || topic === 'pronouns' || topic === 'punctuation') {
    return [
      { kind: 'fill', prompt: 'She ____ (go) to the market yesterday.', answer: 'went' },
      { kind: 'short', prompt: 'Pick the adjective: The red balloon flew away.', answer: 'red' },
      { kind: 'mcq', prompt: 'Choose the pronoun: ____ are my friends.', options: ['Ravi', 'They', 'School', 'Tall'], answer: 'They' },
      { kind: 'short', prompt: 'Punctuate: where is kabir', answer: 'Where is Kabir?' },
      { kind: 'fill', prompt: 'I ____ (be) hungry now.', answer: 'am' },
      { kind: 'short', prompt: 'Change to past tense: Anaya plays cricket.', answer: 'Anaya played cricket.' },
      { kind: 'mcq', prompt: 'The opposite of “happy” is', options: ['glad', 'sad', 'kind', 'fast'], answer: 'sad' },
      { kind: 'short', prompt: 'Write a sentence using the word “because”.', answer: 'Accept reasonable answers' },
    ]
  }
  if (topic === 'voice') {
    return [
      { kind: 'short', prompt: 'Change into passive voice: The chef cooked the meal.', answer: 'The meal was cooked by the chef.' },
      { kind: 'short', prompt: 'Change into active voice: The window was broken by Rohan.', answer: 'Rohan broke the window.' },
      { kind: 'mcq', prompt: 'In the passive voice, the object of the active sentence becomes the', options: ['verb', 'subject', 'adverb', 'article'], answer: 'subject' },
      { kind: 'fill', prompt: 'The letter ____ (write) by Isha yesterday. (passive)', answer: 'was written' },
      { kind: 'short', prompt: 'Identify the voice: “Someone stole my bag.”', answer: 'active' },
      { kind: 'short', prompt: 'Change into passive: They will finish the work.', answer: 'The work will be finished by them.' },
      { kind: 'mcq', prompt: 'Choose the passive form of “She sings a song.”', options: ['A song is sung by her.', 'A song sang she.', 'She is sung a song.', 'A song was sing by her.'], answer: 'A song is sung by her.' },
    ]
  }
  if (topic === 'speech') {
    return [
      { kind: 'short', prompt: 'Change into reported speech: Ravi said, “I am tired.”', answer: 'Ravi said that he was tired.' },
      { kind: 'short', prompt: 'Change into direct speech: She said that she liked mangoes.', answer: 'She said, “I like mangoes.”' },
      { kind: 'fill', prompt: 'In reported speech, “today” often becomes ____.', answer: 'that day' },
      { kind: 'mcq', prompt: '“He said, ‘I will come.’” becomes', options: ['He said he will come.', 'He said that he would come.', 'He said I would come.', 'He said that I will come.'], answer: 'He said that he would come.' },
      { kind: 'short', prompt: 'Report: Mother said to me, “Please close the door.”', answer: 'Mother requested me to close the door.' },
      { kind: 'short', prompt: 'Report: Kabir said, “Where do you live?”', answer: 'Kabir asked where I lived.' },
    ]
  }
  if (topic === 'editing' || topic === 'reordering') {
    return [
      { kind: 'short', prompt: 'Edit: He go to school every day.', answer: 'He goes to school every day.' },
      { kind: 'short', prompt: 'Edit: The childrens are playing in park.', answer: 'The children are playing in the park.' },
      { kind: 'short', prompt: 'Reorder: the / quickly / fox / brown / jumped', answer: 'The brown fox jumped quickly. (accept similar)' },
      { kind: 'fill', prompt: 'One word is wrong: She don’t like tea. The error is ____.', answer: "don't / doesn't" },
      { kind: 'short', prompt: 'Omit the extra word: I am going to the my school.', answer: 'the / my (omit one)' },
      { kind: 'short', prompt: 'Edit: Neither of the boys have arrived.', answer: 'Neither of the boys has arrived.' },
      { kind: 'mcq', prompt: 'Choose the correct sentence.', options: ['She suggested me to wait.', 'She suggested that I wait.', 'She suggested to me wait.', 'She suggest I waiting.'], answer: 'She suggested that I wait.' },
    ]
  }
  return [
    { kind: 'fill', prompt: 'By this time tomorrow we ____ (reach) Jaipur.', answer: 'will have reached' },
    { kind: 'short', prompt: 'Fill the correct tense: I ____ (live) here since 2020.', answer: 'have lived / have been living' },
    { kind: 'mcq', prompt: 'Choose the past perfect: When we arrived, the film', options: ['started', 'has started', 'had started', 'starts'], answer: 'had started' },
    { kind: 'short', prompt: 'Write the present continuous of “write” with “they”.', answer: 'they are writing' },
    { kind: 'short', prompt: 'Identify the tense: “She has finished her homework.”', answer: 'present perfect' },
    { kind: 'fill', prompt: 'If it rains, we ____ (stay) indoors.', answer: 'will stay' },
  ]
}

function scienceBank(input: WizardInput): AcademicQuestion[] {
  const topic = input.topic
  const cls = input.classLevel
  if (cls <= 5 || topic === 'living' || topic === 'body' || topic === 'materials' || topic === 'earth') {
    return [
      { kind: 'fill', prompt: 'Plants make their food in the ____.', answer: 'leaves' },
      { kind: 'short', prompt: 'Name two sense organs.', answer: 'eyes, ears (or others)' },
      { kind: 'mcq', prompt: 'Which of these is a living thing?', options: ['stone', 'water', 'plant', 'air'], answer: 'plant' },
      { kind: 'short', prompt: 'Why do we need to drink water?', answer: 'To stay alive / healthy' },
      { kind: 'fill', prompt: 'The ____ is the nearest star to the Earth.', answer: 'Sun' },
      { kind: 'mcq', prompt: 'Air is a', options: ['solid', 'liquid', 'gas', 'plant'], answer: 'gas' },
      { kind: 'short', prompt: 'Name one animal that lives in water.', answer: 'fish (accept others)' },
      { kind: 'fill', prompt: 'We breathe in ____ gas.', answer: 'oxygen' },
    ]
  }
  if (cls <= 8 || topic === 'food' || topic === 'matter' || topic === 'force') {
    return [
      { kind: 'short', prompt: 'Name two nutrients we get from food.', answer: 'carbohydrates, proteins, fats, vitamins, minerals' },
      { kind: 'fill', prompt: 'Friction always acts ____ to the direction of motion.', answer: 'opposite' },
      { kind: 'mcq', prompt: 'The SI unit of force is', options: ['pascal', 'newton', 'joule', 'watt'], answer: 'newton' },
      { kind: 'short', prompt: 'What is photosynthesis?', answer: 'Process by which green plants make food using sunlight' },
      { kind: 'fill', prompt: 'Acids turn blue litmus ____.', answer: 'red' },
      { kind: 'short', prompt: 'Define a cell.', answer: 'The basic unit of life' },
      { kind: 'mcq', prompt: 'Which organ pumps blood?', options: ['lungs', 'heart', 'liver', 'kidney'], answer: 'heart' },
      { kind: 'short', prompt: 'Give one example of a magnetic material.', answer: 'iron / nickel / cobalt' },
    ]
  }
  return [
    { kind: 'short', prompt: 'Name the process by which green plants make food.', answer: 'photosynthesis' },
    { kind: 'fill', prompt: 'The chemical formula of water is ____.', answer: 'H2O' },
    { kind: 'mcq', prompt: 'Ohm’s law relates V, I and', options: ['mass', 'R', 'time', 'area'], answer: 'R' },
    { kind: 'short', prompt: 'What is the function of stomata?', answer: 'Gaseous exchange / transpiration' },
    { kind: 'fill', prompt: 'The image formed by a plane mirror is ____ (real/virtual).', answer: 'virtual' },
    { kind: 'short', prompt: 'Define an ecosystem.', answer: 'Community of living things and their environment' },
    { kind: 'mcq', prompt: 'Which acid is found in lemon?', options: ['hydrochloric', 'citric', 'sulphuric', 'nitric'], answer: 'citric' },
    { kind: 'num', prompt: 'A current of 2 A flows for 5 s. Charge transferred Q = It =', answer: '10 C' },
    { kind: 'short', prompt: 'State one way to save electricity at home.', answer: 'Accept reasonable answers' },
  ]
}

function countFor(input: WizardInput): number {
  return effectiveCount(input, defaultQuestionCount(input.type, input.classLevel, input.difficulty))
}

export function generateQuiz(input: WizardInput): PracticeModel {
  const rng = mulberry32(input.seed)
  const questions = take(rng, quizBank(input), countFor(input))
  return { ...baseFields(input, 'quiz'), questions, ...emptyPairs() }
}

export function generateGrammar(input: WizardInput): PracticeModel {
  const rng = mulberry32(input.seed)
  const questions = take(rng, grammarBank(input), countFor(input))
  return { ...baseFields(input, 'grammar'), questions, ...emptyPairs() }
}

export function generateScience(input: WizardInput): PracticeModel {
  const rng = mulberry32(input.seed)
  const questions = take(rng, scienceBank(input), countFor(input))
  return { ...baseFields(input, 'science'), questions, ...emptyPairs() }
}

export function generateCustom(input: WizardInput): PracticeModel {
  const rng = mulberry32(input.seed)
  const parsed = parseQuestionBank(input.customQuestions)
  const fallback: AcademicQuestion[] = [
    {
      kind: 'short',
      prompt: 'Write your questions in Teacher Studio — one per line. Try Q.  MCQ.  FILL.  NUM.',
      answer: '',
    },
  ]
  const extras = extrasFromInput(input, rng)
  return {
    ...baseFields(input, 'custom'),
    questions: parsed.length ? parsed : fallback,
    ...extras,
  }
}

export const quiz = {
  generate: generateQuiz,
  renderPreview,
  renderPdf,
}

export const grammar = {
  generate: generateGrammar,
  renderPreview,
  renderPdf,
}

export const science = {
  generate: generateScience,
  renderPreview,
  renderPdf,
}

export const custom = {
  generate: generateCustom,
  renderPreview,
  renderPdf,
}
