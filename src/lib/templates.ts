import type { TeacherTemplate } from '../types'

function sample(
  id: string,
  name: string,
  classLevel: TeacherTemplate['classLevel'],
  subject: string,
  title: string,
  questions: string,
  extra: Partial<TeacherTemplate> = {},
): TeacherTemplate {
  return {
    id,
    name,
    classLevel,
    subject,
    topic: 'custom',
    title,
    schoolName: 'Sunrise Public School',
    section: 'A',
    marks: extra.marks ?? '20',
    timeAllowed: extra.timeAllowed ?? '30 min',
    instructions: extra.instructions ?? 'Read each question carefully. Show working where asked.',
    includeAnswerKey: true,
    questionCount: 0,
    questions: questions.trim(),
    customWords: extra.customWords ?? '',
    customPairs: extra.customPairs ?? '',
    theme: 'sunshine',
    sample: true,
    updatedAt: 0,
  }
}

export const SAMPLE_TEMPLATES: TeacherTemplate[] = [
  sample(
    'sample-class4-fractions',
    'Class 4 · Fractions',
    4,
    'Mathematics',
    'Fractions — Practice Paper',
    `
Q. Write a fraction for 3 shaded parts out of 8 equal parts. | 3/8
FILL. One-half is written as ____. | 1/2
MCQ. Which fraction is greater? | 1/4 | *3/4 | 1/8 | 2/8
NUM. 1/4 + 1/4 = | 1/2
Q. Ravi ate 2/8 of a chocolate bar. Write this fraction in lowest terms. | 1/4
FILL. In the fraction 5/6, the numerator is ____. | 5
MCQ. How many halves make a whole? | 1 | *2 | 3 | 4
Q. Meera coloured 1/2 of a circle and Anaya coloured 1/4. Who coloured more? | Meera
`,
    {
      marks: '20',
      timeAllowed: '30 min',
      instructions: 'Write fractions in lowest terms where you can. Draw a small picture if it helps.',
      customPairs: 'one-half | 1/2\none-quarter | 1/4\nthree-quarters | 3/4\nnumerator | top number',
    },
  ),
  sample(
    'sample-class8-algebra',
    'Class 8 · Algebra',
    8,
    'Mathematics',
    'Algebra — Linear Expressions',
    `
NUM. 3x + 5 = 20 | x = 5
NUM. 2y − 7 = 9 | y = 8
Q. Simplify: 4a + 3a − 2a | 5a
MCQ. The coefficient of x in 7x − 3 is | 7x | -3 | *7 | 3
FILL. An expression with one term is called a ____. | monomial
NUM. 5(x − 2) = 15 | x = 5
Q. If p = 3, find the value of 2p + 4. | 10
Q. Write an algebraic expression for “5 more than twice a number x”. | 2x + 5
`,
    {
      marks: '25',
      timeAllowed: '40 min',
      instructions: 'Show each step. Box the final answer.',
    },
  ),
  sample(
    'sample-class10-linear',
    'Class 10 · Linear equations',
    10,
    'Mathematics',
    'Linear Equations in Two Variables',
    `
NUM. 2x + 5 = 17 | x = 6
NUM. 3x − 4 = 2x + 9 | x = 13
Q. The pair 2x + y = 5 and 3x − y = 5. Find x. | x = 2
MCQ. The graph of y = 2x is a | circle | *straight line | parabola | point
FILL. A linear equation in two variables has ____ solutions. | infinitely many
Q. Find the value of k if x = 2, y = 1 is a solution of 2x + 3y = k. | k = 7
NUM. x/2 + 4 = 10 | x = 12
Q. Write the standard form of a linear equation in two variables. | ax + by + c = 0
`,
    {
      marks: '30',
      timeAllowed: '45 min',
      instructions: 'Show working. Use a rough figure if you graph a line.',
      customWords: 'coefficient, intercept, solution, linear, simultaneous',
    },
  ),
]

export function isSampleId(id: string): boolean {
  return SAMPLE_TEMPLATES.some((t) => t.id === id)
}
