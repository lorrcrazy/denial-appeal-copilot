/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: { 950: '#050B18', 900: '#0A1428', 800: '#111F3A', 700: '#1B2C4F' },
        brand: { 50: '#EFFDFA', 100: '#CCFBF1', 200: '#99F6E4', 300: '#5EEAD4', 400: '#2DD4BF', 500: '#14B8A6', 600: '#0D9488', 700: '#0F766E', 900: '#134E4A' },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(45,212,191,.25), 0 10px 40px -10px rgba(45,212,191,.45)',
        card: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px -8px rgba(15,23,42,.12)',
      },
      keyframes: {
        dash: { to: { strokeDashoffset: '-40' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseRing: { '0%': { transform: 'scale(.8)', opacity: '.8' }, '100%': { transform: 'scale(2.2)', opacity: '0' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        kenburns: { '0%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1.15) translate(-1%, -1%)' } },
      },
      animation: {
        dash: 'dash 1.2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s cubic-bezier(.2,.6,.4,1) infinite',
        shimmer: 'shimmer 2s infinite',
        kenburns: 'kenburns 18s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}
