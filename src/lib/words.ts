import type { Difficulty, WordTheme } from '../types'
import { sample, type Rng } from './rng'

const BANKS: Record<WordTheme, { easy: string[]; medium: string[]; hard: string[] }> = {
  animals: {
    easy: ['cat', 'dog', 'cow', 'hen', 'ant', 'owl', 'pig', 'bat', 'fox', 'bee'],
    medium: ['lion', 'tiger', 'zebra', 'camel', 'horse', 'sheep', 'goat', 'duck', 'frog', 'panda', 'parrot', 'monkey'],
    hard: ['peacock', 'elephant', 'giraffe', 'buffalo', 'sparrow', 'cheetah', 'dolphin', 'octopus', 'penguin', 'kangaroo'],
  },
  food: {
    easy: ['rice', 'dal', 'roti', 'milk', 'egg', 'jam', 'nut', 'pea', 'bun', 'tea'],
    medium: ['mango', 'banana', 'idli', 'dosa', 'apple', 'bread', 'curd', 'laddu', 'samosa', 'papad', 'chilli', 'lemon'],
    hard: ['biryani', 'coconut', 'spinach', 'mustard', 'pineapple', 'pomegranate', 'chapati', 'tamarind', 'cardamom'],
  },
  school: {
    easy: ['bag', 'pen', 'book', 'desk', 'ink', 'map', 'bell', 'cap', 'pad', 'rub'],
    medium: ['pencil', 'eraser', 'chalk', 'ruler', 'paper', 'class', 'lunch', 'teacher', 'board', 'glue'],
    hard: ['notebook', 'compass', 'uniform', 'assembly', 'homework', 'geometry', 'principal', 'dictionary'],
  },
  home: {
    easy: ['bed', 'mat', 'cup', 'fan', 'pot', 'key', 'door', 'lamp', 'sofa', 'rug'],
    medium: ['chair', 'table', 'window', 'kitchen', 'garden', 'pillow', 'mirror', 'bucket', 'towel', 'clock'],
    hard: ['balcony', 'cupboard', 'blanket', 'curtain', 'doorbell', 'bookshelf', 'veranda', 'utensils'],
  },
  nature: {
    easy: ['sun', 'sky', 'tree', 'leaf', 'rain', 'moon', 'star', 'hill', 'sand', 'dew'],
    medium: ['river', 'cloud', 'flower', 'stone', 'grass', 'ocean', 'wind', 'seed', 'pond', 'forest'],
    hard: ['rainbow', 'thunder', 'waterfall', 'mountain', 'blossom', 'meadow', 'sunrise', 'monsoon'],
  },
}

const SIGHT: Record<'easy' | 'medium' | 'hard', string[]> = {
  easy: ['I', 'a', 'the', 'is', 'my', 'we', 'go', 'to', 'you', 'and', 'see', 'me', 'it', 'up', 'on'],
  medium: ['like', 'come', 'look', 'play', 'said', 'here', 'this', 'that', 'with', 'have', 'from', 'they', 'were', 'when'],
  hard: ['because', 'friend', 'school', 'people', 'beautiful', 'together', 'always', 'through', 'enough', 'thought'],
}

export function bandFor(age: number, difficulty: Difficulty): 'easy' | 'medium' | 'hard' {
  if (difficulty === 'hard' || age >= 10) return difficulty === 'easy' ? 'medium' : 'hard'
  if (difficulty === 'easy' || age <= 6) return 'easy'
  return 'medium'
}

export function themedWords(
  rng: Rng,
  theme: WordTheme,
  age: number,
  difficulty: Difficulty,
  count: number,
): string[] {
  const band = bandFor(age, difficulty)
  const pool =
    band === 'hard'
      ? [...BANKS[theme].medium, ...BANKS[theme].hard]
      : band === 'medium'
        ? [...BANKS[theme].easy, ...BANKS[theme].medium]
        : BANKS[theme].easy
  return sample(rng, pool, count)
}

export function sightWords(rng: Rng, age: number, difficulty: Difficulty, count: number): string[] {
  const band = bandFor(age, difficulty)
  const pool =
    band === 'hard'
      ? [...SIGHT.medium, ...SIGHT.hard]
      : band === 'medium'
        ? [...SIGHT.easy, ...SIGHT.medium]
        : SIGHT.easy
  return sample(rng, pool, count)
}

export function isWordTheme(value: string): value is WordTheme {
  return value === 'animals' || value === 'food' || value === 'school' || value === 'home' || value === 'nature'
}
