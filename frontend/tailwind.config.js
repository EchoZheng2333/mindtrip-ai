/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wabi: {
          50: '#FBF9F5',
          100: '#F4F1EA',   // 侘寂米 — 全站大背景
          200: '#E8E3D8',
          300: '#D4CDBC',
          400: '#B8AD96',
          500: '#9C8E72',
        },
        'ink': {
          dark: '#1C1C1E',   // 深玄黑 — 高质感文本
          retro: '#2C3A2E',  // 复古松烟绿
        },
        'cute': {
          pop: '#E63946',    // 古怪心形红 — Logo/高亮
          light: '#FF6B7A',
          dark: '#C62828',
        },
        'glass': {
          white: 'rgba(255, 255, 255, 0.75)',
        },
        'stone': {
          200: '#E8E0D4',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Noto Serif SC', 'serif'],
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
      backdropBlur: {
        md: '12px',
      },
      borderRadius: {
        'eccentric-tl': '2rem',
        'eccentric-br': '2rem',
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'flip-card': 'flipCard 0.6s ease-in-out',
        'code-fall': 'codeFall 1.5s ease-out',
        'kiln-glow': 'kilnGlow 3s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.01)', opacity: '0.97' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(230, 57, 70, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(230, 57, 70, 0.3)' },
        },
        flipCard: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        codeFall: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '0.5' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        kilnGlow: {
          '0%, 100%': { background: 'rgba(230, 57, 70, 0.05)' },
          '50%': { background: 'rgba(230, 57, 70, 0.15)' },
        },
      },
    },
  },
  plugins: [],
}