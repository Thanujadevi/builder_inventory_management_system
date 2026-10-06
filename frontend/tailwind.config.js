/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Sophisticated Purple (#7C3AED & #844FC1)
        primary: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED', // Primary standard (#7C3AED)
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
          accent: '#844FC1', // Primary alternate (#844FC1)
        },
        // Neutral Dark Charcoal (#0F172A)
        charcoal: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A', // Neutral Dark (#0F172A)
          950: '#090D16',
        },
        // Neutral Light Gray (#F3F4F6)
        lightgray: {
          50: '#FAFAFA',
          100: '#F3F4F6', // Neutral Light (#F3F4F6)
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
        },
        // Mapped Brand & Construction palette
        construction: {
          purple: '#7C3AED',
          accent: '#844FC1',
          dark: '#0F172A',
          light: '#F3F4F6',
          yellow: '#7C3AED',
          amber: '#844FC1',
        },
        brand: {
          slate: '#0F172A',
          body: '#F3F4F6',
          card: '#FFFFFF',
          border: '#E5E7EB',
          purple: '#7C3AED',
          accent: '#844FC1',
        },
        steel: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
