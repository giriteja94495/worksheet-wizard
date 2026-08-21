import { rgb } from 'pdf-lib'
import type { ThemeId } from '../types'

export interface ThemeTokens {
  id: ThemeId
  label: string
  border: string
  borderDark: string
  accent: string
  wash: string
  pdfBorder: ReturnType<typeof rgb>
  pdfAccent: ReturnType<typeof rgb>
  pdfWash: ReturnType<typeof rgb>
}

export const THEME_TOKENS: Record<ThemeId, ThemeTokens> = {
  sunshine: {
    id: 'sunshine',
    label: 'Sunshine',
    border: '#E9C46A',
    borderDark: '#C9A227',
    accent: '#E06C5C',
    wash: '#FFF6D6',
    pdfBorder: rgb(0.914, 0.769, 0.416),
    pdfAccent: rgb(0.878, 0.424, 0.361),
    pdfWash: rgb(1, 0.965, 0.839),
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    border: '#2A9D8F',
    borderDark: '#1F7A70',
    accent: '#E9C46A',
    wash: '#E6F5F2',
    pdfBorder: rgb(0.165, 0.616, 0.561),
    pdfAccent: rgb(0.914, 0.769, 0.416),
    pdfWash: rgb(0.902, 0.961, 0.949),
  },
  jungle: {
    id: 'jungle',
    label: 'Jungle',
    border: '#6A994E',
    borderDark: '#386641',
    accent: '#E06C5C',
    wash: '#EEF5E8',
    pdfBorder: rgb(0.416, 0.6, 0.306),
    pdfAccent: rgb(0.878, 0.424, 0.361),
    pdfWash: rgb(0.933, 0.961, 0.91),
  },
  space: {
    id: 'space',
    label: 'Space',
    border: '#1F2A44',
    borderDark: '#12182A',
    accent: '#E9C46A',
    wash: '#EEF0F6',
    pdfBorder: rgb(0.122, 0.165, 0.267),
    pdfAccent: rgb(0.914, 0.769, 0.416),
    pdfWash: rgb(0.933, 0.941, 0.965),
  },
}
