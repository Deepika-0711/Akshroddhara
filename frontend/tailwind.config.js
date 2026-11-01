/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F4EFE6',
          300: '#EDE5D5',
          400: '#E2D6C0',
          500: '#D4C4A8',
        },
        forest: {
          50: '#F0F5F2',
          100: '#D8E6DE',
          200: '#ADCAB9',
          300: '#7EAA91',
          500: '#2D6A4F',
          600: '#1B4332', // Primary accent
          700: '#153628',
          800: '#102A1F',
          900: '#0B1E16',
        },
        gold: {
          50: '#FCF9EE',
          100: '#F7F0D4',
          200: '#EDDDA5',
          300: '#E0C773',
          400: '#D4B447',
          500: '#C5A059', // Muted antique gold
          600: '#B08A38',
          700: '#8A6A24',
          800: '#674D16',
          900: '#46330C',
        },
        ink: {
          900: '#1C1917', // Dark readable text
          800: '#292524',
          700: '#44403C',
          600: '#57534E',
          500: '#78716C',
          400: '#A8A29E',
          300: '#D6D3D1',
        },
        manuscript: {
          paper: '#FAF6ED',
          border: '#E3D8C4',
          highlight: '#FFF6D6',
          uncertain: '#FFF3CD',
          uncertainBorder: '#F59E0B',
          reconstructed: '#E0F2FE',
          reconstructedBorder: '#0284C7',
          verified: '#DCFCE7',
          verifiedBorder: '#16A34A',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif Kannada"', '"Tiro Kannada"', 'Georgia', 'serif'],
        sans: ['"Noto Sans Kannada"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'parchment': '0 4px 20px -2px rgba(45, 35, 20, 0.08), 0 2px 6px -1px rgba(45, 35, 20, 0.04)',
        'parchment-lg': '0 10px 30px -4px rgba(45, 35, 20, 0.12), 0 4px 12px -2px rgba(45, 35, 20, 0.06)',
      }
    },
  },
  plugins: [],
};
