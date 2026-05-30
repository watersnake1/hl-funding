/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f0f14',
        card: '#16161f',
        border: '#2a2a3a',
        accent: '#00d4ff',
        positive: '#00e676',
        negative: '#ff5252',
        muted: '#8888aa',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
