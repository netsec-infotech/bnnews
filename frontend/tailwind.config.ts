import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#282779', // Official Primary Navy
          dark: '#1e1d5c',
          light: '#393184',   // Official Secondary Purple
        },
        purple: {
          DEFAULT: '#393184',
          dark: '#2d2669',
          light: '#4b41a3',
        },
        secondary: {
          DEFAULT: '#F58220', // Official Brand Orange
          hover: '#E06B0B',
          light: '#FFF7ED',
        },
        breaking: {
          DEFAULT: '#E51B2B', // Official Breaking Red
          dark: '#C41321',
        },
        accent: {
          gold: '#FFD900',    // Official Brand Yellow
          yellow: '#FFD900',
          silver: '#E2E8F0',
        },
        neutral: {
          bg: '#F7F8FA',      // Official Background
          surface: '#FFFFFF',
          text: '#171A2C',
          muted: '#64748B',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        gujarati: ['var(--font-noto-gujarati)', 'Noto Sans Gujarati', 'Shruti', 'sans-serif'],
        headline: ['var(--font-headline)', 'Oswald', 'Inter', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(30, 37, 115, 0.08), 0 1px 4px -1px rgba(30, 37, 115, 0.04)',
        cardHover: '0 12px 28px -6px rgba(30, 37, 115, 0.16), 0 8px 12px -6px rgba(30, 37, 115, 0.1)',
        logo: '0 4px 14px 0 rgba(200, 29, 37, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
