/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { navy: '#0F172A', slateblue: '#2563EB', tealx: '#0D9488', emeraldx: '#059669', rosex: '#E11D48', ink: '#0F172A' },
      fontFamily: { inter: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
