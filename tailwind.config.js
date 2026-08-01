/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F6F43',
          light: '#2A8F58',
          dark: '#165A35',
        },
        cream: '#F8F5EF',
        gold: {
          DEFAULT: '#D4A017',
          light: '#E8B82A',
        },
        surface: {
          DEFAULT: '#F4F5F7',
          dark: '#1A1D23',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(31, 111, 67, 0.08)',
        'soft-lg': '0 8px 32px -8px rgba(31, 111, 67, 0.12)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.06)',
        gold: '0 4px 20px -4px rgba(212, 160, 23, 0.35)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
