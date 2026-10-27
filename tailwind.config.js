/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#07080b',
          card: '#0f1118',
          surface: '#151823',
          border: '#232838',
          hover: '#1d2232',
          muted: '#8e96aa',
          dim: '#555e73',
          glow: '#f59e0b',
          accent: '#6366f1',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px -3px rgba(245, 158, 11, 0.3)' },
          '100%': { boxShadow: '0 0 25px 2px rgba(245, 158, 11, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'studio-mesh': 'radial-gradient(at 10% 20%, rgba(99, 102, 241, 0.08) 0px, transparent 50%), radial-gradient(at 90% 10%, rgba(245, 158, 11, 0.08) 0px, transparent 50%), radial-gradient(at 50% 80%, rgba(6, 182, 212, 0.06) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};
