import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF6EE',
        ink: '#1F2A44',
        coral: '#E06C5C',
        teal: '#2A9D8F',
        sunflower: '#E9C46A',
        sage: '#B7CDB0',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        ui: ['Nunito', 'system-ui', 'sans-serif'],
        hand: ['Patrick Hand', 'cursive'],
      },
    },
  },
} satisfies Config
