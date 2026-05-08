/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta café IES Pio Baroja
        coffee: {
          50: '#faf6f0',
          100: '#f5ede0',
          200: '#e8d5b8',
          300: '#d4b088',
          400: '#bc8a5f',
          500: '#a16f43',
          600: '#8b5a2b',
          700: '#6f4622',
          800: '#5a3920',
          900: '#3d2817',
          950: '#2a1c10',
        },
        cream: {
          50: '#fdfbf7',
          100: '#faf6f0',
          200: '#f5ede0',
        },
        accent: {
          DEFAULT: '#d97706',
          light: '#f59e0b',
          dark: '#92400e',
        },
        healthy: {
          DEFAULT: '#65a30d',
          light: '#84cc16',
          dark: '#4d7c0f',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(61, 40, 23, 0.06)',
        'soft-lg': '0 8px 24px rgba(61, 40, 23, 0.08)',
        'inner-soft': 'inset 0 1px 2px rgba(61, 40, 23, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-subtle': 'bounceSubtle 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
