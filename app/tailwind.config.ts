import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-instrument-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'hsl(var(--bg) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'surface-2': 'hsl(var(--surface-2) / <alpha-value>)',
        'surface-3': 'hsl(var(--surface-3) / <alpha-value>)',
        ink: 'hsl(var(--ink) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        'muted-2': 'hsl(var(--muted-2) / <alpha-value>)',
        line: 'hsl(var(--line) / <alpha-value>)',
        'line-2': 'hsl(var(--line-2) / <alpha-value>)',
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          soft: 'hsl(var(--accent-soft) / <alpha-value>)',
          deep: 'hsl(var(--accent-deep) / <alpha-value>)',
        },
        success: 'hsl(var(--success) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
        error: 'hsl(var(--error) / <alpha-value>)',
        mod: {
          citas: 'hsl(var(--mod-citas) / <alpha-value>)',
          salud: 'hsl(var(--mod-salud) / <alpha-value>)',
          gastos: 'hsl(var(--mod-gastos) / <alpha-value>)',
          proyectos: 'hsl(var(--mod-proyectos) / <alpha-value>)',
          mant: 'hsl(var(--mod-mant) / <alpha-value>)',
          viajes: 'hsl(var(--mod-viajes) / <alpha-value>)',
          fechas: 'hsl(var(--mod-fechas) / <alpha-value>)',
          discus: 'hsl(var(--mod-discus) / <alpha-value>)',
          mimos: 'hsl(var(--mod-mimos) / <alpha-value>)',
        },
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        DEFAULT: 'var(--r-md)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
      },
      keyframes: {
        'in-fade': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'in-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'in-fade': 'in-fade 150ms ease-out',
        'in-up': 'in-up 220ms ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
