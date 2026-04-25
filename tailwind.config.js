/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Clinical professional palette — deep teal primary, warm neutrals
        primary: {
          50:  '#f0f7f7',
          100: '#d9ebea',
          200: '#b5d7d5',
          300: '#86b9b7',
          400: '#579795',
          500: '#3d7c7b',
          600: '#2f6362',
          700: '#285150',
          800: '#224342',
          900: '#1f3938',
        },
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        critical: '#b91c1c',
        warning: '#b45309',
        success: '#15803d',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"DM Serif Display"', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
