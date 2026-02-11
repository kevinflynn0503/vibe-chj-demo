/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', '1.5'],
        'sm': ['13px', '1.5'],
        'base': ['14px', '1.5'],
        'lg': ['16px', '1.5'],
        'xl': ['18px', '1.4'],
        '2xl': ['24px', '1.3'],
        'tag': ['11px', '1.4'],
      },
      colors: {
        text: {
          primary: '#1A1D26',
          secondary: '#5E6278',
          muted: '#9097A7',
        },
        brand: {
          DEFAULT: '#3370FF',
          hover: '#2860E1',
          active: '#1D4ED8',
          light: '#EBF2FF',
          subtle: 'rgba(51, 112, 255, 0.06)',
          muted: 'rgba(51, 112, 255, 0.08)',
        },
        surface: {
          primary: '#F7F8FA',
          card: '#FFFFFF',
          elevated: '#FFFFFF',
          hover: '#F0F1F3',
        },
        data: {
          blue: '#3B82F6',
          green: '#10B981',
          orange: '#F59E0B',
          red: '#EF4444',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
        },
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'DEFAULT': '8px',
        'lg': '10px',
        'xl': '12px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'md': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        'lg': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
        'card': '0 1px 2px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 1px 2px rgba(0, 0, 0, 0.03), 0 4px 8px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
