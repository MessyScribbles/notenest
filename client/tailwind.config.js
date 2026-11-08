/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        app: 'var(--color-bg-app)',
        surface: 'var(--color-surface)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
        },
        main: 'var(--color-text-main)',
        muted: 'var(--color-text-muted)',
        divider: 'var(--color-border)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        hover: '0 8px 20px -4px rgba(0, 0, 0, 0.08)',
      },
      transitionDuration: {
        '200': '200ms',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}