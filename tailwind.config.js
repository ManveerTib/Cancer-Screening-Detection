/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#1b263b',
          700: '#0f1823',
          50: '#f0f4f8',
          100: '#d9e3ef',
          200: '#b3c7df',
          300: '#8daacf',
        },
        accent: {
          600: '#05a896',
          700: '#047a71',
          50: '#f0fdf9',
          100: '#ccf7f1',
        },
      },
    },
  },
  plugins: [],
};
