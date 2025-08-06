import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 宫崎骏风格色彩
        forest: {
          light: '#d9f2e6',
          DEFAULT: '#a8d5ba',
          dark: '#7fb069',
          deep: '#5a8a4c',
        },
        sky: {
          light: '#e6f3ff',
          DEFAULT: '#b3d9ff',
          deep: '#7fb3e6',
        },
        cream: '#fff9e6',
        peach: '#ffc7a0',
        rose: '#d4a5a5',
        sand: '#f7e4c1',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config