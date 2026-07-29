/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          rapunzel: '#FFB6C1', // Pastel pink primary
          cute: '#FFC0CB'
        },
        purple: {
          rapunzel: '#C084FC', // Soft lavender
          lantern: '#E9D5FF'
        },
        gold: {
          sun: '#FACC15', // Sun gold
          glow: '#FDE047'
        }
      },
      fontFamily: {
        rounded: ['Fredoka', 'Quicksand', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 15s ease-in-out infinite',
        'float-medium': 'float 10s ease-in-out infinite',
        'float-fast': 'float 6s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(110vh) translateX(0px) scale(0.8)', opacity: 0 },
          '10%': { opacity: 0.7 },
          '90%': { opacity: 0.7 },
          '100%': { transform: 'translateY(-10vh) translateX(50px) scale(1.3) rotate(20deg)', opacity: 0 },
        },
        sparkle: {
          '0%, 100%': { transform: 'scale(0.8)', opacity: 0.5 },
          '50%': { transform: 'scale(1.2)', opacity: 1 },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(253, 224, 71, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(253, 224, 71, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
