/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f14',
        surface: '#121821',
        elevated: '#18212d',
        border: '#243041',
        fg: '#e8eef6',
        muted: '#8b9bb0',
        primary: '#2dd4bf',
        'primary-fg': '#042f2e',
        accent: '#38bdf8',
        danger: '#f87171',
        warn: '#fbbf24',
        success: '#34d399',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04), 0 12px 40px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
