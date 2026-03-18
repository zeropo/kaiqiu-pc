/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './plugins/**/*.{js,vue}'
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', md: '2rem' },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Outfit', 'Inter', 'Noto Sans SC', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#E63946', // A vibrant, clean Red
          primaryHover: '#D62828',
          secondary: '#1D3557', // Deep sophisticated blue
          accent: '#457B9D'
        },
        surface: '#FFFFFF',
        surfaceMuted: '#FAFAFB',
        surfaceSoft: '#F3F4F6',
        border: '#F1F1F3',
        text: {
          main: '#0F172A',
          muted: '#64748B',
          light: '#94A3B8'
        }
      },
      borderRadius: {
        card: '20px',
        btn: '10px'
      },
      boxShadow: {
        card: '0 4px 24px -4px rgba(0, 0, 0, 0.04), 0 1px 4px -1px rgba(0, 0, 0, 0.02)',
        cardHover: '0 12px 40px -6px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        header: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp')
  ]
};

