/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // 최종 디자인(tqwhyl.readdy.co)에서 실측한 값. 50/100/300/400/500/600/800/950 등은
      // getComputedStyle + 픽셀 추출로 확인한 정확한 값이고, 나머지 단계는 보간값.
      colors: {
        background: {
          50: '#ffffff',
          100: '#fff7ea',
          200: '#f5ecd9',
          300: '#ecdfc4',
          400: '#ddccaa',
          500: '#c9b489',
        },
        foreground: {
          50: '#f4f7f6',
          100: '#e6ecea',
          200: '#d0dbd8',
          300: '#aabcb8',
          400: '#8c9d99',
          500: '#6e7e7b',
          600: '#52625e',
          700: '#3a4744',
          800: '#1e2c29',
          900: '#101a17',
          950: '#020c09',
        },
        primary: {
          50: '#fff1e8',
          100: '#ffdfc9',
          200: '#ffbc8f',
          300: '#ff9556',
          400: '#fa7d2e',
          500: '#f56100',
          600: '#d55200',
          700: '#b34400',
        },
        accent: {
          100: '#ffd99b',
          200: '#ffcb7a',
          400: '#f89a2e',
          500: '#ed7e00',
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6.4px)' },
        },
      },
      animation: {
        float: 'float 3.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

