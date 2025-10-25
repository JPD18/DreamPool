/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#030203',
        neon: '#36D421',
        magenta: '#E10CF1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-neon': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #36D421, 0 0 10px #36D421, 0 0 15px #36D421' },
          '100%': { boxShadow: '0 0 10px #36D421, 0 0 20px #36D421, 0 0 30px #36D421' },
        },
      },
    },
  },
  plugins: [],
}
