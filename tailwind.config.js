/**
 * Tailwind CSS 配置
 *
 * ═══ 单一数据源架构 ═══
 *
 * 所有设计值定义在 src/index.css 的 :root CSS 变量中，
 * 本文件通过 var() 引用，确保 Tailwind 类名与 CSS 变量保持同步。
 *
 * 修改颜色/尺寸时：只需修改 index.css 中的 :root 变量。
 *
 * 注意：使用 var() 的颜色不支持 Tailwind 的 /opacity 修饰符
 *       （如 bg-brand/50 无效），需使用显式的 alpha 变体
 *       （如 bg-brand-subtle、bg-brand-alpha-10）。
 */

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

      /* ── Colors (引用 CSS 变量) ── */
      colors: {
        /* 品牌色 */
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
        /* 文字色 */
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted:     'var(--color-text-muted)',
          inverse:   'var(--color-text-inverse)',
        },
        /* 背景 / 表面 */
        surface: {
          primary:   'var(--color-bg-primary)',
          card:      'var(--color-bg-card)',
          elevated:  'var(--color-bg-elevated)',
          'hover-card': 'var(--color-bg-hover-card)',
          'hover-row':  'var(--color-bg-hover-row)',
          'hover-btn':  'var(--color-bg-hover-btn)',
          active:    'var(--color-bg-active)',
        },
        /* 边框 */
        line: {
          DEFAULT:   'var(--color-border)',
          light:     'var(--color-border-light)',
          hover:     'var(--color-border-hover)',
        },
        /* 语义色 */
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
        /* 数据可视化色 */
        data: {
          blue:   'var(--color-data-blue)',
          green:  'var(--color-data-green)',
          orange: 'var(--color-data-orange)',
          red:    'var(--color-data-red)',
          purple: 'var(--color-data-purple)',
          cyan:   'var(--color-data-cyan)',
        },
      },

      /* ── Border Radius (引用 CSS 变量) ── */
      borderRadius: {
        'sm':      'var(--radius-sm)',
        DEFAULT:   'var(--radius)',
        'md':      'var(--radius-md)',
        'lg':      'var(--radius-lg)',
        'full':    'var(--radius-full)',
      },

      /* ── Box Shadow (引用 CSS 变量) ── */
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

      /* ── Animation ── */
      transitionDuration: {
        fast:   'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow:   'var(--duration-slow)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in var(--duration-slow) ease-out both',
        'fade-in-up': 'fade-in-up 400ms ease-out both',
        'scale-in': 'scale-in var(--duration-slow) ease-out both',
      },
    },
  },
  plugins: [],
};
