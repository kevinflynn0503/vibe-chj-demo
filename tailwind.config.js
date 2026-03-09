/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {

      /* ── Typography ── */
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        mono: ['var(--font-family-mono)'],
      },
      fontSize: {
        'tag':  ['var(--font-size-tag)',  { lineHeight: 'var(--line-height-tight)' }],
        'xs':   ['var(--font-size-xs)',   { lineHeight: 'var(--line-height-normal)' }],
        'sm':   ['var(--font-size-sm)',   { lineHeight: 'var(--line-height-normal)' }],
        'base': ['var(--font-size-base)', { lineHeight: 'var(--line-height-normal)' }],
        'lg':   ['var(--font-size-lg)',   { lineHeight: 'var(--line-height-normal)' }],
        'xl':   ['var(--font-size-xl)',   { lineHeight: 'var(--line-height-tight)' }],
        '2xl':  ['var(--font-size-2xl)',  { lineHeight: 'var(--line-height-tight)' }],
      },

      /* ── Spacing (8级) ── */
      spacing: {
        'sp-1': 'var(--space-1)',
        'sp-2': 'var(--space-2)',
        'sp-3': 'var(--space-3)',
        'sp-4': 'var(--space-4)',
        'sp-5': 'var(--space-5)',
        'sp-6': 'var(--space-6)',
        'sp-7': 'var(--space-7)',
        'sp-8': 'var(--space-8)',
      },

      /* ── Colors (引用 CSS 变量) ── */
      colors: {
        brand: {
          DEFAULT:    'var(--color-brand)',
          hover:      'var(--color-brand-hover)',
          active:     'var(--color-brand-active)',
          light:      'var(--color-brand-light)',
          subtle:     'var(--color-brand-subtle)',
          muted:      'var(--color-brand-muted)',
          'alpha-10': 'var(--color-brand-alpha-10)',
          'alpha-20': 'var(--color-brand-alpha-20)',
          'alpha-25': 'var(--color-brand-alpha-25)',
        },
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted:     'var(--color-text-muted)',
          inverse:   'var(--color-text-inverse)',
        },
        surface: {
          primary:   'var(--color-bg-primary)',
          card:      'var(--color-bg-card)',
          elevated:  'var(--color-bg-elevated)',
          'hover-card': 'var(--color-bg-hover-card)',
          'hover-row':  'var(--color-bg-hover-row)',
          'hover-btn':  'var(--color-bg-hover-btn)',
          active:    'var(--color-bg-active)',
        },
        line: {
          DEFAULT:   'var(--color-border)',
          light:     'var(--color-border-light)',
          hover:     'var(--color-border-hover)',
        },
        success: {
          DEFAULT:   'var(--color-success)',
          light:     'var(--color-success-light)',
        },
        warning: {
          DEFAULT:   'var(--color-warning)',
          light:     'var(--color-warning-light)',
        },
        error: {
          DEFAULT:   'var(--color-error)',
          light:     'var(--color-error-light)',
        },
        info: {
          DEFAULT:   'var(--color-info)',
          light:     'var(--color-info-light)',
        },
        data: {
          blue:   'var(--color-data-blue)',
          green:  'var(--color-data-green)',
          orange: 'var(--color-data-orange)',
          red:    'var(--color-data-red)',
          purple: 'var(--color-data-purple)',
          cyan:   'var(--color-data-cyan)',
        },
        neutral: {
          50:  'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
        },
      },

      /* ── Border Radius ── */
      borderRadius: {
        'sm':      'var(--radius-sm)',
        DEFAULT:   'var(--radius)',
        'md':      'var(--radius-md)',
        'lg':      'var(--radius-lg)',
        'full':    'var(--radius-full)',
      },

      /* ── Box Shadow ── */
      boxShadow: {
        'xs':         'var(--shadow-xs)',
        'sm':         'var(--shadow-sm)',
        DEFAULT:      'var(--shadow-sm)',
        'md':         'var(--shadow-md)',
        'lg':         'var(--shadow-lg)',
        'card':       'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'brand-sm':   'var(--shadow-brand-sm)',
        'brand':      'var(--shadow-brand)',
      },

      /* ── Transition ── */
      transitionDuration: {
        fast:   'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow:   'var(--duration-slow)',
      },
      transitionTimingFunction: {
        'out-expo': 'var(--easing)',
        'out-cubic': 'var(--easing-hover)',
      },

      /* ── Animation ── */
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in var(--duration-slow) var(--easing) both',
        'fade-in-up': 'fade-in-up 400ms var(--easing) both',
        'scale-in': 'scale-in var(--duration-slow) var(--easing) both',
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
};
