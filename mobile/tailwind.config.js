/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#090E0C',
        'background-secondary': 'rgba(13, 21, 18, 0.72)',
        card: 'rgba(18, 28, 24, 0.42)',
        'card-elevated': 'rgba(23, 35, 30, 0.55)',
        primary: '#00E676',
        'primary-pressed': '#00C968',
        'primary-soft': 'rgba(12, 42, 28, 0.72)',
        'text-primary': '#F5F7F6',
        'text-secondary': '#9AA8A1',
        'text-muted': '#65736C',
        border: 'rgba(255, 255, 255, 0.12)',
        error: '#FF5C5C',
        warning: '#FFB547',
        bitcoin: '#F7931A',
      },
    },
  },
  plugins: [],
};
