/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff9f2',
          100: '#ffeacc',
          200: '#ffd099',
          300: '#ffb066',
          400: '#ff9233',
          500: '#ff7700', // Primary saffron
          600: '#d96100',
          700: '#b34c00',
          800: '#8c3800',
          900: '#662600',
          950: '#401500',
        },
        gold: {
          50: '#fefdf3',
          100: '#fbf8d4',
          200: '#f5eda4',
          300: '#eedf6f',
          400: '#e5cd3a',
          500: '#d4af37', // Gold
          600: '#ad8b25',
          700: '#866819',
          800: '#5f4710',
          900: '#382808',
          950: '#1c1303',
        },
        devored: {
          50: '#fff5f5',
          100: '#ffe8e8',
          200: '#ffd1d1',
          300: '#ffa3a3',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b71c1c', // Devotional Red
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        cream: {
          50: '#fefefe',
          100: '#fdfcf9',
          200: '#faf7f0',
          300: '#f7f2e4',
          400: '#f0e6cb',
          500: '#e7d7ad', // Devotional cream background base
          600: '#cca770',
          700: '#aa8250',
          800: '#886236',
          900: '#664522',
          950: '#442b10',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
