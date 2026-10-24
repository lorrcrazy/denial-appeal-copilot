/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        hand: ['Caveat', 'cursive'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: { 50: '#F6F6F5', 100: '#ECECEA', 200: '#DEDEDB', 300: '#C9C9C5' },
        ink: { 950: '#1C1C1E', 900: '#27272A', 800: '#3A3A3E', 700: '#55555B' },
        brand: { 50: '#EEF7F8', 100: '#D6EDF0', 200: '#AEDAE0', 300: '#7EC1CB', 400: '#4CA4B2', 500: '#2B8897', 600: '#1F6F7D', 700: '#1A5966', 900: '#0E333B' },
        clay: { 50: '#FCF2EE', 100: '#F7DFD5', 200: '#EFC1AE', 300: '#E49E83', 400: '#D87C5D', 500: '#C4603F', 600: '#A64C30', 700: '#843D28' },
        marker: '#FFE27A',
      },
      boxShadow: {
        glow: '0 1px 0 rgba(31,27,22,.08)',
        card: '0 1px 2px rgba(31,27,22,.05), 0 6px 18px -10px rgba(31,27,22,.18)',
        paper: '0 1px 1px rgba(31,27,22,.06), 0 12px 30px -12px rgba(31,27,22,.28)',
      },
      keyframes: {
        dash: { to: { strokeDashoffset: '-40' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        pulseRing: { '0%': { transform: 'scale(.8)', opacity: '.8' }, '100%': { transform: 'scale(2.2)', opacity: '0' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        kenburns: { '0%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1.08)' } },
      },
      animation: {
        dash: 'dash 1.2s linear infinite',
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s cubic-bezier(.2,.6,.4,1) infinite',
        shimmer: 'shimmer 2s infinite',
        kenburns: 'kenburns 24s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}
