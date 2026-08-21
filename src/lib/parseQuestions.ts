import type { AcademicQuestion } from '../types'

function splitAnswer(body: string): { prompt: string; answer: string } {
  const idx = body.lastIndexOf('|')
  if (idx < 0) return { prompt: body.trim(), answer: '' }
  return {
    prompt: body.slice(0, idx).trim(),
    answer: body.slice(idx + 1).trim(),
  }
}

export function parseQuestionLine(line: string): AcademicQuestion | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  if (/^[-–]{3,}$/.test(trimmed)) return null

  const mcq = trimmed.match(/^MCQ\.\s*(.+)$/i)
  if (mcq) {
    const parts = mcq[1]!.split('|').map((p) => p.trim()).filter(Boolean)
    const prompt = parts.shift() ?? ''
    if (!prompt || parts.length < 2) return null
    let answer = ''
    const options = parts.map((raw) => {
      const starred = raw.startsWith('*')
      const text = (starred ? raw.slice(1) : raw).trim()
      if (starred && text) answer = text
      return text
    })
    return { kind: 'mcq', prompt, options, answer }
  }

  const fill = trimmed.match(/^FILL\.\s*(.+)$/i)
  if (fill) {
    const { prompt, answer } = splitAnswer(fill[1]!)
    return { kind: 'fill', prompt, answer }
  }

  const num = trimmed.match(/^NUM\.\s*(.+)$/i)
  if (num) {
    const { prompt, answer } = splitAnswer(num[1]!)
    return { kind: 'num', prompt, answer }
  }

  const q = trimmed.match(/^Q\.\s*(.+)$/i)
  const body = q ? q[1]! : trimmed
  const { prompt, answer } = splitAnswer(body)
  if (!prompt) return null
  return { kind: 'short', prompt, answer }
}

export function parseQuestionBank(raw: string): AcademicQuestion[] {
  const questions: AcademicQuestion[] = []
  for (const line of raw.split('\n')) {
    const q = parseQuestionLine(line)
    if (q) questions.push(q)
  }
  return questions
}

export function hasAnswers(questions: readonly AcademicQuestion[]): boolean {
  return questions.some((q) => q.answer.trim().length > 0)
}
